package com.consdata.kouncil.serde.formatter.schema;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.serialization.SerializationData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.schemaregistry.json.JsonSchemaUtils;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaDeserializer;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaSerializer;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.utils.Bytes;

import java.util.Map;

@Slf4j
public class JsonSchemaMessageFormatter implements MessageFormatter {
    private static final ObjectMapper MAPPER = new ObjectMapper();
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
        try {
            JsonNode jsonPayloadNode = MAPPER.readTree(serializationData.getPayload());
            JsonSchema jsonSchema = ((JsonSchema) serializationData.getSchema());
            jsonSchema.validate(jsonPayloadNode);

            JsonNode jsonNodeWithEnvelopedSchema = MAPPER.valueToTree(JsonSchemaUtils.toObject(jsonPayloadNode, jsonSchema));

            byte[] serialized = jsonSchemaSerializer.serialize(serializationData.getTopicName(), jsonNodeWithEnvelopedSchema);
            return Bytes.wrap(serialized);
        } catch (Exception e) {
            throw new KouncilRuntimeException("Failed to serialize JSON record for topic " + serializationData.getTopicName(), e);
        }
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.JSON;
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
