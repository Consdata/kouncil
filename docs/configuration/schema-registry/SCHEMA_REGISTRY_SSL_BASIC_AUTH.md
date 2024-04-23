## Advanced config - Schema registry SSL and BASIC Authentication

Let's assume that your SchemaRegistry is secured and you need SSL and BASIC authentication to connect. You need to provide a client truststore, containing CA public certificate and keystore with both client private key and CA signed certificate.
And fot the BASIC authentication you need to provide user-info which will be use to authenticate when Kouncil will connect to Schema Registry.

```yaml
kouncil:
  clusters:
    - name: local-cluster
      schemaRegistry:
        url: "https://schema.registry:8081"
        auth:
          source: USER_INFO
          user-info: username:password
        security:
          protocol: SSL
        ssl:
          truststore-location: file:///config/truststore/client.truststore.jks
          truststore-password: password
          trustStoreType: JKS
          keystore-location: file:///config/keystore/client.keystore.jks
          keystore-password: password
          key-password: password
          keyStoreType: JKS
      brokers:
        - host: 192.10.0.1
          port: 9092

```
