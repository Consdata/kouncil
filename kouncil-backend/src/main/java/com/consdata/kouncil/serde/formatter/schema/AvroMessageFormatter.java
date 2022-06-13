package com.consdata.kouncil.serde.formatter.schema;

import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.serialization.SerializationData;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.utils.Bytes;

import java.io.IOException;
import java.util.Map;

@Slf4j
public class AvroMessageFormatter implements MessageFormatter {

    private final KafkaAvroDeserializer avroDeserializer;

    private final KafkaAvroSerializer avroSerializer;

    public AvroMessageFormatter(SchemaRegistryClient client) {
        this.avroDeserializer = new KafkaAvroDeserializer(client);
        this.avroSerializer = new KafkaAvroSerializer(client);
    }

    @Override
    public String deserialize(DeserializationData deserializationData) {
        Object deserialized = avroDeserializer.deserialize(deserializationData.getTopicName(), deserializationData.getValue());
        byte[] jsonBytes;
        try {
            jsonBytes = AvroSchemaUtils.toJson(deserialized);
        } catch (IOException e) {
            throw new RuntimeException("Failed to deserialize AVRO record for topic " + deserializationData.getTopicName(), e);
        }
        return new String(jsonBytes);
    }

    @Override
    public Bytes serialize(SerializationData serializationData) {
        this.configureSerializer(serializationData);
        AvroSchema avroSchema = (AvroSchema) serializationData.getSchema();
        try {
            Object avroGeneric = AvroSchemaUtils.toObject(serializationData.getPayload(), avroSchema);
            byte[] serialized = avroSerializer.serialize(serializationData.getTopicName(), avroGeneric);
            return Bytes.wrap(serialized);
        } catch (Throwable e) {
            throw new RuntimeException("Failed to serialize AVRO record for topic " + serializationData.getTopicName(), e);
        }
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.AVRO;
    }

    private void configureSerializer(SerializationData serializationData) {
        avroSerializer.configure(
                Map.of(AbstractKafkaSchemaSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, "needed_in_runtime_but_not_used",
                        AbstractKafkaSchemaSerDeConfig.AUTO_REGISTER_SCHEMAS, false,
                        AbstractKafkaSchemaSerDeConfig.USE_LATEST_VERSION, true),
                serializationData.isKey()
        );
    }
}
