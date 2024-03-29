package com.consdata.kouncil.schema.registry;

import static com.consdata.kouncil.config.security.RoleNames.ADMIN_ROLE;
import static com.consdata.kouncil.config.security.RoleNames.EDITOR_ROLE;
import static com.consdata.kouncil.config.security.RoleNames.VIEWER_ROLE;

import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.schema.SchemasConfigurationDTO;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.schema.SchemasDTO;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.serde.MessageFormat;
import javax.annotation.security.RolesAllowed;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@Slf4j
public class SchemaRegistryController {
    private final SchemaAwareClusterService schemaAwareClusterService;
    private final KouncilConfiguration kouncilConfiguration;

    public SchemaRegistryController(SchemaAwareClusterService schemaAwareClusterService,
                                    KouncilConfiguration kouncilConfiguration) {
        this.schemaAwareClusterService = schemaAwareClusterService;
        this.kouncilConfiguration = kouncilConfiguration;
    }



    @RolesAllowed({ADMIN_ROLE, EDITOR_ROLE, VIEWER_ROLE})
    @GetMapping("/api/schemas/configs")
    public List<SchemasConfigurationDTO> getSchemasConfiguration() {
        return kouncilConfiguration.getClusterConfig()
                .entrySet()
                .stream()
                .map(clusterEntry -> SchemasConfigurationDTO.builder()
                        .serverId(clusterEntry.getKey())
                        .hasSchemaRegistry(clusterEntry.getValue().getSchemaRegistry() != null)
                        .build()
                ).collect(Collectors.toList());
    }

    @RolesAllowed({ADMIN_ROLE, EDITOR_ROLE, VIEWER_ROLE})
    @GetMapping("/api/schemas/latest/{topicName}")
    public SchemasDTO getLatestSchemas(@PathVariable String topicName,
                                       @RequestParam String serverId) {
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
}
