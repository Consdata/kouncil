package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import com.google.protobuf.Message;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class AvroMessageFormatter implements MessageFormatter {

    @Override
    public String format(String topic, byte[] value) {
        log.info("NOT IMPLEMENTED");
        return null;
    }

    @Override
    public Bytes read(String topic, String value, ParsedSchema parsedSchema) {
        log.info("NOT IMPLEMENTED");
        return null;
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.AVRO;
    }
}
