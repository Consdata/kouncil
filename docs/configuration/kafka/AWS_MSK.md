## Advanced config - Amazon MSK Kafka cluster

{% hint style="warning" %}
**WARNING**

This configuration will be deprecated in version 1.9 and removed in 1.10. In version 1.9 this
configuration will be used to preload your clusters.
{% endhint %}

If one of your brokers in a cluster environment is located in an Amazon MSK cluster, you should
specify `saslMechanism`, `saslProtocol`, `saslJassConfig`, and `saslCallbackHandler` for this
broker, like this:

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      brokers:
        - host: 192.10.0.1
          port: 9092
          saslMechanism: AWS_MSK_IAM
          saslProtocol: SASL_SSL
          saslJassConfig: software.amazon.msk.auth.iam.IAMLoginModule required awsProfileName="username";
          saslCallbackHandler: software.amazon.msk.auth.iam.IAMClientCallbackHandler
        - host: 192.10.0.2
          port: 9093
        - host: 192.10.0.3
          port: 9094
```

The above configuration uses IAM access to the Amazon MSK cluster, and you should
provide `AWS_SECRET_ACCESS_KEY` and `AWS_ACCESS_KEY_ID` as environment variables to Kouncil.
These two values should be generated for the user with access to the Amazon MSK cluster, and their
user name should be provided in `awsProfileName` in the Kouncil configuration.
