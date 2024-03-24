## Advanced config - SSL Schema registry

Let's assume that your SchemaRegistry is secured and you need SSL to connect. You need to provide a client truststore, containing CA public certificate and keystore with both client private key and CA signed certificate.

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      schemaRegistry:
        url: "https://schema.registry:8081"
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
