package com.consdata.kouncil.schemaregistry;

import com.consdata.kouncil.serde.ClusterAwareSchema;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.SerdeService;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@Slf4j
public class SchemaRegistryController {
    private final SerdeService serdeService;

    public SchemaRegistryController(SerdeService serdeService) {
        this.serdeService = serdeService;
    }

    @GetMapping("/api/schemas/latest/{topicName}")
    public SchemasDTO getLatestSchemas(@PathVariable String topicName,
                                       @RequestParam String serverId) {
        ClusterAwareSchema clusterAwareSchema = serdeService.getClusterAwareSchema(serverId);
        if (clusterAwareSchema != null) {
            SchemaMetadata keySchema = clusterAwareSchema.getSchemaRegistryFacade().getLatestSchemaMetadata(topicName, true);
            SchemaMetadata valueSchema = clusterAwareSchema.getSchemaRegistryFacade().getLatestSchemaMetadata(topicName, false);
            return SchemasDTO.builder()
                    .keyMessageFormat(MessageFormat.valueOf(keySchema.getSchemaType()))
                    .keyPlainTextSchema(keySchema.getSchema())
                    .valueMessageFormat(MessageFormat.valueOf(valueSchema.getSchemaType()))
                    .valuePlainTextSchema(valueSchema.getSchema())
                    .build();
        } else {
            log.warn("Schema registry not configured for specified cluster={}", serverId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Schema registry not configured for specified cluster=%s", serverId));
        }
    }
}
