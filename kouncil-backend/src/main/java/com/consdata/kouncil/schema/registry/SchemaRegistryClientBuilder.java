package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.config.SchemaRegistryConfig;
import io.confluent.kafka.schemaregistry.SchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClientConfig;
import io.confluent.kafka.schemaregistry.client.rest.RestService;
import io.confluent.kafka.schemaregistry.json.JsonSchemaProvider;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaProvider;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.experimental.UtilityClass;
import org.apache.kafka.common.config.SslConfigs;

@UtilityClass
public class SchemaRegistryClientBuilder {

    private static final int SCHEMA_CACHE_SIZE = 100;

    public static SchemaRegistryClient build(SchemaRegistryConfig schemaRegistryConfig) {
        List<SchemaProvider> schemaProviders =
                List.of(new AvroSchemaProvider(), new ProtobufSchemaProvider(), new JsonSchemaProvider());

        // Schema registry authentication should come here
        Map<String, String> configs = new HashMap<>();

        if (schemaRegistryConfig.getSecurity() != null && schemaRegistryConfig.getSsl() != null) {
            final RestService restService = new RestService(schemaRegistryConfig.getUrl());
            try {
                if (schemaRegistryConfig.getSsl() != null) {
                    prepareSslConfig(configs, schemaRegistryConfig);
                }
            } catch (IOException e) {
                throw new KouncilRuntimeException(e);
            }

            if (schemaRegistryConfig.getAuth() != null) {
                configs.put(SchemaRegistryClientConfig.BASIC_AUTH_CREDENTIALS_SOURCE, schemaRegistryConfig.getAuth().getSource());
                configs.put(SchemaRegistryClientConfig.USER_INFO_CONFIG, schemaRegistryConfig.getAuth().getUserInfo());
            }

            return new CachedSchemaRegistryClient(restService, SCHEMA_CACHE_SIZE, schemaProviders, configs, null);
        }

        return new CachedSchemaRegistryClient(schemaRegistryConfig.getUrl(),
                SCHEMA_CACHE_SIZE,
                schemaProviders,
                configs);
    }

    private static void prepareSslConfig(Map<String, String> configs, SchemaRegistryConfig schemaRegistryConfig) throws IOException {
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE.concat(SslConfigs.SSL_PROTOCOL_CONFIG),
                schemaRegistryConfig.getSecurity().getProtocol());
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE.concat(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG),
                schemaRegistryConfig.getSsl().getTrustStoreLocation().getFile().getAbsolutePath());
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE.concat(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG),
                schemaRegistryConfig.getSsl().getTrustStorePassword());
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE.concat(SslConfigs.SSL_TRUSTSTORE_TYPE_CONFIG),
                schemaRegistryConfig.getSsl().getTrustStoreType());
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE.concat(SslConfigs.SSL_KEYSTORE_LOCATION_CONFIG),
                schemaRegistryConfig.getSsl().getKeyStoreLocation().getFile().getAbsolutePath());
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE.concat(SslConfigs.SSL_KEYSTORE_PASSWORD_CONFIG),
                schemaRegistryConfig.getSsl().getKeyStorePassword());
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE.concat(SslConfigs.SSL_KEY_PASSWORD_CONFIG),
                schemaRegistryConfig.getSsl().getKeyPassword());
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE.concat(SslConfigs.SSL_KEYSTORE_TYPE_CONFIG),
                schemaRegistryConfig.getSsl().getKeyStoreType());
    }
}
