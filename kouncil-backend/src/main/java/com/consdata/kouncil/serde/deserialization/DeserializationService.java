package com.consdata.kouncil.serde.deserialization;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

@Service
public class DeserializationService {
    public DeserializedValue deserialize(ConsumerRecord<Bytes, Bytes> message) {
        return null;
    }
}
