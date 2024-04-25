## Advanced config - JMX monitoring

If your Kafka brokers expose JMX metrics Kouncil can take advantage of that, displaying additional metrics. This is done using advanced config, where you can specify JMX parameters for each broker, like so:

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      brokers:
        - host: 192.10.0.1
          port: 9092
          jmxPort: 5088
        - host: 192.10.0.2
          port: 9093
          jmxPort: 5089
        - host: 192.10.0.3
          port: 9094
          jmxPort: 5090
```
This example assumes that broker does not require any kind of authentication to access JMX metrics - you only need to specify JMX port. If that's not the case, and JMX authentication is turned on, you can also specify JMX user and password:

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      brokers:
        - host: 192.10.0.1
          port: 9092
          jmxPort: 5088
          jmxUser: jmxAdmin
          jmxPassword: jmxPassword
        - host: 192.10.0.2
          port: 9093
          jmxPort: 5088
          jmxUser: jmxAdmin
          jmxPassword: jmxPassword
        - host: 192.10.0.3
          port: 9094
          jmxPort: 5088
          jmxUser: jmxAdmin
          jmxPassword: jmxPassword
```
It quickly becomes clear, that in many cases those properties (`jmxPort`, `jmxUser`, `jmxPassword`) will be identical for each of the brokers inside the cluster. For that reason, you can also specify them on a cluster level, and they will propagate to each broker:

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      jmxPort: 5088
      jmxUser: jmxAdmin
      jmxPassword: jmxPassword
      brokers:
        - host: 192.10.0.1
          port: 9092    
        - host: 192.10.0.2
          port: 9093
        - host: 192.10.0.3
          port: 9094
```
All brokers inside `transaction-cluster` will share the same JMX configuration (`jmxPort` = `5088`, `jmxUser` = `jmxAdmin`, `jmxPassword` = `jmxPassword`).

Propagation of JMX parameters works independently for each of those parameters. For example, each of the brokers may have the same JMX user and password, but different port:

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      jmxUser: jmxAdmin
      jmxPassword: jmxPassword
      brokers:
        - host: 192.10.0.1
          port: 9092
          jmxPort: 5088
        - host: 192.10.0.2
          port: 9093
          jmxPort: 5089
        - host: 192.10.0.3
          port: 9094
          jmxPort: 5090
```

In the case of both simple and advanced configuration being present, the advanced configuration takes precedence.
