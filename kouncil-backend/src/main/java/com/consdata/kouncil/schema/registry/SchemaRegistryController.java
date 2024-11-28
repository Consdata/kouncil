package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import com.consdata.kouncil.schema.SchemaDTO;
import com.consdata.kouncil.schema.SchemasConfigurationDTO;
import com.consdata.kouncil.schema.SchemasDTO;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.IOException;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
public class SchemaRegistryController {

    private final SchemaRegistryService schemaRegistryService;

    @RolesAllowed(SystemFunctionNameConstants.LOGIN)
    @GetMapping("/api/schemas/configs")
    public List<SchemasConfigurationDTO> getSchemasConfiguration() {
        return schemaRegistryService.getSchemasConfiguration();
    }

    @RolesAllowed(SystemFunctionNameConstants.SCHEMA_DETAILS)
    @GetMapping("/api/schemas/latest/{topicName}")
    public SchemasDTO getLatestSchemas(@PathVariable String topicName, @RequestParam String serverId) {
        return schemaRegistryService.getLatestSchemas(serverId, topicName);
    }

    @RolesAllowed(SystemFunctionNameConstants.SCHEMA_LIST)
    @GetMapping("/api/schemas/{serverId}")
    public List<SchemaDTO> getSchemas(@PathVariable String serverId, @RequestParam("topicNames") List<String> topicNames) {
        return schemaRegistryService.getSchemas(serverId, topicNames);
    }

    @RolesAllowed(SystemFunctionNameConstants.SCHEMA_DETAILS)
    @GetMapping("/api/schemas/{serverId}/{subject}/{version}")
    public SchemaDTO getSchemaVersion(@PathVariable String serverId, @PathVariable String subject, @PathVariable Integer version)
            throws RestClientException, IOException {
        return schemaRegistryService.getSchemaVersion(serverId, subject, version);
    }

    @RolesAllowed(SystemFunctionNameConstants.SCHEMA_CREATE)
    @PostMapping("/api/schemas/{serverId}")
    public void createSchema(@PathVariable String serverId, @RequestBody SchemaDTO schema) throws RestClientException, IOException {
        schemaRegistryService.createSchema(serverId, schema);
    }

    @RolesAllowed(SystemFunctionNameConstants.SCHEMA_UPDATE)
    @PutMapping("/api/schemas/{serverId}")
    public void updateSchema(@PathVariable String serverId, @RequestBody SchemaDTO schema) throws RestClientException, IOException {
        schemaRegistryService.updateSchema(serverId, schema);
    }

    @RolesAllowed(SystemFunctionNameConstants.SCHEMA_DELETE)
    @DeleteMapping("/api/schemas/{serverId}/{subject}/{version}")
    public void deleteSchema(@PathVariable String serverId, @PathVariable String subject, @PathVariable String version)
            throws RestClientException, IOException {
        schemaRegistryService.deleteSchema(serverId, subject, version);
    }
}
