## Advanced config - SASL Plain Authentication

{% hint style="warning" %}
**WARNING**

This configuration will be deprecated in version 1.9 and removed in the future. In version 1.9 this
configuration will be used to preload your clusters.
{% endhint %}

If one of your brokers in a cluster environment requires SASL authentication, you should
specify `saslMechanism`, `saslProtocol` and `saslJassConfig` for that broker. For example:

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
