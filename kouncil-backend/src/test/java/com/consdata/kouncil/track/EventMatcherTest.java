package com.consdata.kouncil.track;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.apache.kafka.common.record.TimestampType;
import org.assertj.core.util.Arrays;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class EventMatcherTest {

    private final EventMatcher eventMatcher = new EventMatcher();

    @Test
    void should_match_with_IS() {
        // given
        ConsumerRecord<String, String> candidate = prepareConsumerRecord("header", "test", "value");

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "test", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "Test", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "atest", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "testerka", candidate)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "value", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "Value", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "avalue", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "valuerka", candidate)).isFalse();
    }

    @Test
    void should_match_with_NOT_IS() {
        // given
        ConsumerRecord<String, String> candidate = prepareConsumerRecord("header", "test", "value");

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "test", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "Test", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "atest", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "testerka", candidate)).isTrue();

        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "value", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "Value", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "avalue", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "valuerka", candidate)).isTrue();
    }

    @Test
    void should_match_with_LIKE() {
        // given
        ConsumerRecord<String, String> candidate = prepareConsumerRecord("header", "test", "value");

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "test", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "Test", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "est", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "tes", candidate)).isTrue();

        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "value", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "Value", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "lue", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "val", candidate)).isTrue();
    }

    @Test
    void should_match_with_NOT_LIKE() {
        // given
        ConsumerRecord<String, String> candidate = prepareConsumerRecord("header", "test", "value");

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "test", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "Test", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "est", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "tes", candidate)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "value", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "Value", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "lue", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "val", candidate)).isFalse();
    }

    @Test
    void should_handle_empty_filter_value() {
        // given
        ConsumerRecord<String, String> candidate = prepareConsumerRecord("header", "test", "value");

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "", candidate)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "", candidate)).isFalse();
    }

    @Test
    void should_handle_empty_header_or_record_value() {
        // given
        ConsumerRecord<String, String> candidate = prepareConsumerRecord("header", "", "");

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "", candidate)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "", candidate)).isFalse();
    }

    @Test
    void should_handle_null_header_or_record_value() {
        // given
        ConsumerRecord<String, String> candidate = prepareConsumerRecord("header", null, null);

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "", candidate)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "", candidate)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "", candidate)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "", candidate)).isFalse();
    }

    private ConsumerRecord<String, String> prepareConsumerRecord(String headerKey, String headerValue, String recordValue) {
        Headers headers = new RecordHeaders(Arrays.array(new RecordHeader(headerKey, headerValue != null ? headerValue.getBytes(StandardCharsets.UTF_8) : null)));
        return new ConsumerRecord<>("", 0, 0, 0, TimestampType.NO_TIMESTAMP_TYPE, 0L, 0, 0, "key", recordValue, headers);
    }
}
