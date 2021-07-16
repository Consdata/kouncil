package com.consdata.kouncil.track;

import com.consdata.kouncil.AbstractMessagesController;
import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.topic.TopicMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.logging.log4j.util.Strings;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.config.WebSocketMessageBrokerStats;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@RestController
public class TrackController extends AbstractMessagesController {

    private final SimpMessagingTemplate eventSender;

    private final ExecutorService executor;

    private final WebSocketMessageBrokerStats webSocketMessageBrokerStats;

    private final DestinationStore destinationStore;

    private final EventMatcher eventMatcher;

    public TrackController(KafkaConnectionService kafkaConnectionService, SimpMessagingTemplate eventSender, ExecutorService executor, WebSocketMessageBrokerStats webSocketMessageBrokerStats, DestinationStore destinationStore, EventMatcher eventMatcher) {
        super(kafkaConnectionService);
        this.eventSender = eventSender;
        this.executor = executor;
        this.webSocketMessageBrokerStats = webSocketMessageBrokerStats;
        this.destinationStore = destinationStore;
        this.eventMatcher = eventMatcher;
    }

    @GetMapping("/api/track/stats")
    public String printStats() throws JsonProcessingException {
        WebSocketStats wss = WebSocketStats.builder()
                .wsSession(webSocketMessageBrokerStats.getWebSocketSessionStatsInfo())
                .taskScheduler(webSocketMessageBrokerStats.getSockJsTaskSchedulerStatsInfo())
                .clientInbound(webSocketMessageBrokerStats.getClientInboundExecutorStatsInfo())
                .clientOutbound(webSocketMessageBrokerStats.getClientOutboundExecutorStatsInfo())
                .destinations(destinationStore.getActiveDestinations())
                .build();
        String result = new ObjectMapper().writeValueAsString(wss);
        log.debug(result);
        return result;
    }

    @GetMapping("/api/track/sync")
    public List<TopicMessage> getSync(@RequestParam("topicNames") List<String> topicNames,
                                      @RequestParam("field") String field,
                                      @RequestParam("operator") String operatorParam,
                                      @RequestParam("value") String value,
                                      @RequestParam("beginningTimestampMillis") Long beginningTimestampMillis,
                                      @RequestParam("endTimestampMillis") Long endTimestampMillis,
                                      @RequestParam("serverId") String serverId) {
        return getEvents(topicNames, field, operatorParam, value, beginningTimestampMillis, endTimestampMillis, serverId, null);
    }

    @GetMapping("/api/track/async")
    public void getAsync(@RequestParam("topicNames") List<String> topicNames,
                         @RequestParam("field") String field,
                         @RequestParam("operator") String operatorParam,
                         @RequestParam("value") String value,
                         @RequestParam("beginningTimestampMillis") Long beginningTimestampMillis,
                         @RequestParam("endTimestampMillis") Long endTimestampMillis,
                         @RequestParam("serverId") String serverId,
                         @RequestParam("asyncHandle") String asyncHandle) {
        executor.submit(() -> getEvents(topicNames, field, operatorParam, value, beginningTimestampMillis, endTimestampMillis, serverId, asyncHandle));
    }

    private List<TopicMessage> getEvents(List<String> topicNames, String field, String operatorParam, String value, Long beginningTimestampMillis, Long endTimestampMillis, String serverId, String asyncHandle) {
        log.debug("TRACK01 topicNames={}, field={}, operator={}, value={}, beginningTimestampMillis={}, endTimestampMillis={}, serverId={}, asyncHandle={}",
                topicNames, field, operatorParam, value, beginningTimestampMillis, endTimestampMillis, serverId, asyncHandle);
        TrackOperator trackOperator = TrackOperator.fromValue(operatorParam);
        validateTopics(serverId, topicNames);
        String destination = "/topic/track/" + asyncHandle;
        try (KafkaConsumer<String, String> consumer = kafkaConnectionService.getKafkaConsumer(serverId, 5000)) {
            List<TopicMessage> messages = new ArrayList<>();
            for (String t : topicNames) {
                if (Strings.isNotBlank(asyncHandle) && !destinationStore.destinationIsActive(destination)) {
                    log.warn("Client disconnection detected topic={}, destination={}", t, destination);
                    break;
                }
                Map<Integer, TopicPartition> partitionMap;
                Collector<Integer, ?, Map<Integer, TopicPartition>> integerMapCollector = Collectors.toMap(Function.identity(), p -> new TopicPartition(t, p));
                List<PartitionInfo> partitionInfos = consumer.partitionsFor(t);
                partitionMap = IntStream.rangeClosed(0, partitionInfos.size() - 1)
                        .boxed()
                        .collect(integerMapCollector);

                consumer.assign(partitionMap.values());

                Map<Integer, Long> beginningOffsets = calculateBeginningOffsets(beginningTimestampMillis, consumer, partitionMap.values());
                log.debug("TRACK03 beginningOffsets={}", beginningOffsets);

                Map<Integer, Long> endOffsets = calculateEndOffsets(endTimestampMillis, consumer, partitionMap.values());
                log.debug("TRACK04 endOffsets={}", endOffsets);

                Boolean[] exhausted = new Boolean[partitionMap.size()];
                Arrays.fill(exhausted, Boolean.FALSE);
                for (Map.Entry<Integer, TopicPartition> entry : partitionMap.entrySet()) {
                    Integer partitionIndex = entry.getKey();
                    Long startOffsetForPartition = beginningOffsets.get(partitionIndex);
                    log.debug("TRACK50 partition={}, startOffsetForPartition={}", partitionIndex, startOffsetForPartition);
                    if (startOffsetForPartition < 0) {
                        log.debug("TRACK51 startOffsetForPartition is -1, seekToEnd, topic={}, partition={}", t, partitionIndex);
                        consumer.seekToEnd(Collections.singletonList(partitionMap.get(partitionIndex)));
                        exhausted[partitionIndex] = true;
                    } else {
                        log.debug("TRACK52 topic={}, partition={}, startOffsetForPartition={}", t, partitionIndex, startOffsetForPartition);
                        consumer.seek(partitionMap.get(partitionIndex), startOffsetForPartition);
                    }
                }

                long startTime = System.nanoTime();

                int emptyPolls = 0;
                while (emptyPolls < 3 && Arrays.stream(exhausted).anyMatch(x -> !x)) {
                    List<TopicMessage> candidates = new ArrayList<>();
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(POLL_TIMEOUT));
                    if (records.isEmpty()) {
                        emptyPolls++;
                    } else {
                        emptyPolls = 0;
                    }
                    log.debug("TRACK70 poll took={}ms, returned {} records for topic {}", (System.nanoTime() - startTime) / 1000000, records.count(), t);
                    for (ConsumerRecord<String, String> consumerRecord : records) {
                        if (consumerRecord.offset() >= endOffsets.get(consumerRecord.partition())) {
                            if (Boolean.FALSE.equals(exhausted[consumerRecord.partition()])) {
                                log.debug("TRACK24 topic={}, partition={} exhausted", t, consumerRecord.partition());
                                exhausted[consumerRecord.partition()] = true;
                            }
                            continue;
                        }
                        if (eventMatcher.filterMatch(field, trackOperator, value, consumerRecord)) {
                            candidates.add(TopicMessage
                                    .builder()
                                    .topic(t)
                                    .key(consumerRecord.key())
                                    .value(consumerRecord.value())
                                    .offset(consumerRecord.offset())
                                    .partition(consumerRecord.partition())
                                    .timestamp(consumerRecord.timestamp())
                                    .headers(mapHeaders(consumerRecord.headers()))
                                    .build());
                        }
                    }
                    log.debug("TRACK90 poll completed topic={}, candidates.size={}", t, candidates.size());
                    if (!candidates.isEmpty()) {
                        if (Strings.isNotBlank(asyncHandle)) {
                            candidates.sort(Comparator.comparing(TopicMessage::getTimestamp));
                            log.debug("TRACK91 async batch send topic={}, destination={}, size={}", t, destination, candidates.size());
                            eventSender.convertAndSend(destination, candidates);
                        } else {
                            messages.addAll(candidates);
                        }
                    }
                }
            }

            messages.sort(Comparator.comparing(TopicMessage::getTimestamp));
            log.debug("TRACK99 search completed result.size={}", messages.size());
            if (messages.size() > 1000) {
                log.warn("Result to large for browser to handle!");
                return messages.subList(0, 1000);
            }
            return messages;
        }
    }


}
