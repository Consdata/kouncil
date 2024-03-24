## Advanced config - TLS

Let's assume that your Kafka is secured and you need mTLS to connect. You need to provide a client truststore, containing CA public certificate and keystore with both client private key and CA signed certificate.
Then add "kafka" node to your yaml with the following values:

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
        -  host: 192.10.0.1
           port: 9092
```
