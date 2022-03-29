package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.schema.SchemasDTO;
import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.serde.MessageFormat;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class SchemaRegistryController {
    private final ClusterAwareSchemaService clusterAwareSchemaService;

    public SchemaRegistryController(ClusterAwareSchemaService clusterAwareSchemaService) {
        this.clusterAwareSchemaService = clusterAwareSchemaService;
    }

    @GetMapping("/api/schemas/latest/{topicName}")
    public SchemasDTO getLatestSchemas(@PathVariable String topicName,
                                       @RequestParam String serverId) {
        ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(serverId);
        if (clusterAwareSchema != null) {
            var schemaBuilder = SchemasDTO.builder();
            clusterAwareSchema.getSchemaRegistryFacade()
                    .getLatestSchemaMetadata(topicName, true)
                    .ifPresent(schema -> {
                        schemaBuilder.keyMessageFormat(MessageFormat.valueOf(schema.getSchemaType()));
                        schemaBuilder.keyPlainTextSchema(schema.getSchema());
                    });
            clusterAwareSchema.getSchemaRegistryFacade()
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
}
