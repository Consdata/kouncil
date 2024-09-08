## Advanced config - SSL Schema registry

{% hint style="warning" %}
**WARNING**

This configuration will be deprecated in version 1.9 and removed in 1.10. In version 1.9 this
configuration will be used to preload your clusters.
{% endhint %}

Assuming your SchemaRegistry is secured and requires SSL for connection, you need to provide a
client truststore that contains the CA's public certificate, and a keystore that includes both the
client's private key and the CA-signed certificate.

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
