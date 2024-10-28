## Advanced config - TLS

{% hint style="warning" %}
**WARNING**

This configuration will be deprecated in version 1.9 and removed in the future. In version 1.9 this
configuration will be used to preload your clusters.
{% endhint %}

Assuming your Kafka is secured and requires mTLS to connect, you need to provide a client truststore
containing the CA's public certificate, and a keystore with both the client's private key and the
CA-signed certificate.
Then, add a kafka node to your YAML configuration with the following values:

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      kafka:
        security:
          protocol: SSL
        ssl:
          truststore-location: file:///config/truststore/client.truststore.jks
          truststore-password: secret
          keystore-password: secret
          keystore-location: file:///config/keystore/client.keystore.jks
          key-password: secret
      brokers:
        - host: 192.10.0.1
          port: 9092
```
