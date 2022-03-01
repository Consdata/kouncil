package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.MessageFormatter;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

public interface MessageSerde {
    DeserializedValue deserialize(ConsumerRecord<Bytes, Bytes> message,
                                  MessageFormatter keyFormatter,
                                  MessageFormatter valueFormatter);

    // TODO serialize()
}
