package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.schema.SchemaDTO;
import com.consdata.kouncil.schema.SchemasConfigurationDTO;
import com.consdata.kouncil.schema.SchemasDTO;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.topic.TopicsController;
import com.consdata.kouncil.topic.TopicsDto;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class SchemaRegistryController {

    private final SchemaAwareClusterService schemaAwareClusterService;
    private final KouncilConfiguration kouncilConfiguration;
    private final TopicsController topicsController;

    public SchemaRegistryController(SchemaAwareClusterService schemaAwareClusterService,
            KouncilConfiguration kouncilConfiguration, TopicsController topicsController) {
        this.schemaAwareClusterService = schemaAwareClusterService;
        this.kouncilConfiguration = kouncilConfiguration;
        this.topicsController = topicsController;
    }

    @GetMapping("/api/schemas/configs")
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

    @GetMapping("/api/schemas/latest/{topicName}")
    public SchemasDTO getLatestSchemas(@PathVariable String topicName, @RequestParam String serverId) {
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

    @GetMapping("/api/schemas/{serverId}")
    public List<SchemaDTO> getAllSchemasForServer(@PathVariable String serverId) {
        if (schemaAwareClusterService.clusterHasSchemaRegistry(serverId)) {
            List<SchemaDTO> schemas = new ArrayList<>();
            TopicsDto topics = topicsController.getTopics(serverId);

            topics.getTopics().forEach(topic -> {
                SchemaAwareCluster schemaAwareCluster = schemaAwareClusterService.getClusterSchema(serverId);

                schemaAwareCluster.getSchemaRegistryFacade()
                        .getLatestSchemaMetadata(topic.getName(), true)
                        .ifPresent(schema -> schemas.add(
                                SchemaDTO.builder()
                                        .subjectName(topic.getName().concat(TopicUtils.getSubjectSuffix(true)))
                                        .messageFormat(MessageFormat.valueOf(schema.getSchemaType()))
                                        .plainTextSchema(schema.getSchema())
                                        .topicName(topic.getName())
                                        .version(schema.getVersion())
                                        .build()
                        ));
                schemaAwareCluster.getSchemaRegistryFacade()
                        .getLatestSchemaMetadata(topic.getName(), false)
                        .ifPresent(schema -> schemas.add(
                                SchemaDTO.builder()
                                        .subjectName(topic.getName().concat(TopicUtils.getSubjectSuffix(false)))
                                        .messageFormat(MessageFormat.valueOf(schema.getSchemaType()))
                                        .plainTextSchema(schema.getSchema())
                                        .topicName(topic.getName())
                                        .version(schema.getVersion())
                                        .build()
                        ));

            });

            return schemas;
        } else {
            throw new SchemaRegistryNotConfiguredException(
                    String.format("Schema registry not configured for specified cluster=[%s]", serverId));
        }
    }
}
