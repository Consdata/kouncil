package com.consdata.kouncil.serde.formatter.schema;

import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.serialization.SerializationData;
import com.fasterxml.jackson.databind.JsonNode;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaDeserializer;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaSerializer;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.utils.Bytes;

import java.util.Map;

@Slf4j
public class JsonSchemaMessageFormatter implements MessageFormatter {
    private final KafkaJsonSchemaDeserializer<JsonNode> jsonSchemaDeserializer;
    private final KafkaJsonSchemaSerializer<JsonNode> jsonSchemaSerializer;

    public JsonSchemaMessageFormatter(SchemaRegistryClient client) {
        this.jsonSchemaDeserializer = new KafkaJsonSchemaDeserializer<>(client);
        this.jsonSchemaSerializer = new KafkaJsonSchemaSerializer<>(client);
    }

    @Override
    public String deserialize(DeserializationData deserializationData) {
        JsonNode json = jsonSchemaDeserializer.deserialize(deserializationData.getTopicName(), deserializationData.getValue());
        return json.toString();
    }

    @Override
    public Bytes serialize(SerializationData serializationData) {
        this.configureSerializer(serializationData);
        JsonSchema jsonSchema = (JsonSchema) serializationData.getSchema();
        JsonNode jsonNode = jsonSchema.toJsonNode();
        try {
            byte[] serialized = jsonSchemaSerializer.serialize(serializationData.getTopicName(), jsonNode);
            return Bytes.wrap(serialized);
        } catch (Throwable e) {
            throw new RuntimeException("Failed to serialize JSON_SCHEMA record for topic " + serializationData.getTopicName(), e);
        }
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.JSON_SCHEMA;
    }

    private void configureSerializer(SerializationData serializationData) {
        jsonSchemaSerializer.configure(
                Map.of(AbstractKafkaSchemaSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, "needed_in_runtime_but_not_used",
                        AbstractKafkaSchemaSerDeConfig.AUTO_REGISTER_SCHEMAS, false,
                        AbstractKafkaSchemaSerDeConfig.USE_LATEST_VERSION, true),
                serializationData.isKey()
        );
    }
}
