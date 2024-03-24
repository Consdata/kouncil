## Advanced config - SASL Plain Authentication

If one of your brokers in cluster environment needs SASL authentication you should specify `saslMechanism`, `saslProtocol` and `saslJassConfig` for this broker, like this:

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      brokers:
        - host: 192.10.0.1
          port: 9092
          saslMechanism: PLAIN
          saslProtocol: SASL_PLAINTEXT
          saslJassConfig: org.apache.kafka.common.security.plain.PlainLoginModule required username="user" password="secret";
        - host: 192.10.0.2
          port: 9093
        - host: 192.10.0.3
          port: 9094
```
