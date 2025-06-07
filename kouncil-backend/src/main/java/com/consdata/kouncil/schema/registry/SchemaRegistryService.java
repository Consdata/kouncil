package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.schema.SchemaDTO;
import com.consdata.kouncil.schema.SchemasConfigurationDTO;
import com.consdata.kouncil.schema.SchemasDTO;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.serde.Compatibility;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.topic.TopicMetadata;
import com.consdata.kouncil.topic.TopicsController;
import com.consdata.kouncil.topic.TopicsDto;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SchemaRegistryService {

    private final TopicsController topicsController;
    private final SchemaAwareClusterService schemaAwareClusterService;
    private final KouncilConfiguration kouncilConfiguration;

    public List<SchemasConfigurationDTO> getSchemasConfiguration() {
        return kouncilConfiguration.getClusterConfig()
                .entrySet()
                .stream()
                .map(clusterEntry -> SchemasConfigurationDTO.builder()
                        .serverId(clusterEntry.getKey())
                        .hasSchemaRegistry(clusterEntry.getValue().getSchemaRegistry() != null)
                        .build()
                ).toList();
    }

    public SchemasDTO getLatestSchemas(String serverId, String topicName) {
        if (schemaAwareClusterService.clusterHasSchemaRegistry(serverId)) {
            SchemaAwareCluster schemaAwareCluster = schemaAwareClusterService.getClusterSchema(serverId);

            var schemaBuilder = SchemasDTO.builder();
            schemaAwareCluster.getSchemaRegistryFacade()
                    .getLatestSchemaMetadata(topicName, true)
                    .ifPresent(schema -> {
                        schemaBuilder.keyMessageFormat(MessageFormat.valueOf(schema.getSchemaType()));
                        schemaBuilder.keyPlainTextSchema(schema.getSchema());
                    });
            schemaAwareCluster.getSchemaRegistryFacade()
                    .getLatestSchemaMetadata(topicName, false)
                    .ifPresent(schema -> {
                        schemaBuilder.valueMessageFormat(MessageFormat.valueOf(schema.getSchemaType()));
                        schemaBuilder.valuePlainTextSchema(schema.getSchema());
                    });
            return schemaBuilder.build();
        } else {
            throw new SchemaRegistryNotConfiguredException(
                    String.format("Schema registry not configured for specified cluster=[%s]", serverId));
        }
    }

    public List<SchemaDTO> getSchemas(String serverId, List<String> topicNames) {
        if (schemaAwareClusterService.clusterHasSchemaRegistry(serverId)) {
            List<SchemaDTO> schemas = new ArrayList<>();
            TopicsDto topics = topicsController.getTopics(serverId);

            SchemaAwareCluster schemaAwareCluster = schemaAwareClusterService.getClusterSchema(serverId);
            topics.getTopics()
                    .stream()
                    .filter(topic -> topicNames.isEmpty() || topicNames.contains(topic.getName()))
                    .forEach(topic -> {
                        getSchema(true, topic, schemas, schemaAwareCluster);
                        getSchema(false, topic, schemas, schemaAwareCluster);
                    });

            return schemas;
        } else {
            throw new SchemaRegistryNotConfiguredException(
                    String.format("Schema registry not configured for specified cluster=[%s]", serverId));
        }
    }

    private void getSchema(Boolean isKey, TopicMetadata topic, List<SchemaDTO> schemas, SchemaAwareCluster schemaAwareCluster) {
        schemaAwareCluster.getSchemaRegistryFacade()
                .getLatestSchemaMetadata(topic.getName(), isKey)
                .ifPresent(schema -> schemas.add(
                        SchemaDTO.builder()
                                .subjectName(topic.getName().concat(TopicUtils.getSubjectSuffix(isKey)))
                                .messageFormat(MessageFormat.valueOf(schema.getSchemaType()))
                                .plainTextSchema(schema.getSchema())
                                .topicName(topic.getName())
                                .version(schema.getVersion())
                                .build()
                ));

    }

    public SchemaDTO getSchemaVersion(String serverId, String subject, Integer version) throws RestClientException, IOException {
        SchemaMetadata schema = schemaAwareClusterService.getClusterSchema(serverId).getSchemaRegistryFacade().getSchemaVersion(subject, version);
        List<Integer> allVersions = schemaAwareClusterService.getClusterSchema(serverId).getSchemaRegistryFacade().getAllVersions(subject);

        String compatibility = schemaAwareClusterService.getClusterSchema(serverId).getSchemaRegistryFacade().getCompatibility(subject);

        return SchemaDTO.builder()
                .subjectName(subject)
                .messageFormat(MessageFormat.valueOf(schema.getSchemaType()))
                .plainTextSchema(schema.getSchema())
                .version(schema.getVersion())
                .topicName(TopicUtils.getTopicName(subject))
                .subjectType(TopicUtils.subjectType(subject))
                .versionsNo(allVersions)
                .compatibility(compatibility != null ? Compatibility.valueOf(compatibility) : null)
                .build();
    }

    public void createSchema(String serverId, SchemaDTO schema) throws RestClientException, IOException {
        schemaAwareClusterService.getClusterSchema(serverId).getSchemaRegistryFacade().createSchema(schema);
    }

    public void updateSchema(String serverId, SchemaDTO schema) throws RestClientException, IOException {
        schemaAwareClusterService.getClusterSchema(serverId).getSchemaRegistryFacade().updateSchema(schema);
    }

    public void deleteSchema(String serverId, String subject, String version) throws RestClientException, IOException {
        schemaAwareClusterService.getClusterSchema(serverId).getSchemaRegistryFacade().deleteSchema(subject, version);
    }

    public boolean testCompatibility(String serverId, SchemaDTO schema ) throws RestClientException, IOException {
        return schemaAwareClusterService.getClusterSchema(serverId).getSchemaRegistryFacade().testCompatibility(schema);
    }
}
