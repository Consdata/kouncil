# Deployment

There are two ways in which Kouncil can be configured:
* simple - suitable for most cases, relying solely on `docker run` parameters
* advanced - suitable for larger configurations. Provided as an external file, and thus can be tracked in version control. It also exposes additional configuration options, which are not available in the simple configuration

## Docker - simple configuration

Simple configuration is passed directly into `docker run` command using `bootstrapServers` environment variable, just as we've seen in [Quick start](README.md#quick-start):

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" consdata/kouncil:latest
```

`bootstrapServers` variable expects a comma-separated list of brokers, each belonging to a different cluster. Kouncil only needs to know about a single broker from the cluster in order to work.

The simplest possible configuration looks like this:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" consdata/kouncil:latest
```

After that, visit [http://localhost](http://localhost) in your browser, and you should be greeted with a list of topics from your cluster.

If you have multiple clusters and wish to manage them all with Kouncil, you can do so by simply specifying one broker from each cluster using comma-separated list:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092,kafka1.another.cluster:8001" consdata/kouncil:latest
```

If you want to set Schema Registry url use `schemaRegistryUrl` environment variable, for instance:
```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e schemaRegistryUrl="http://schema.registry:8081" consdata/kouncil:latest
```
This url will be used for every cluster in `boostrapServers` variable. If you want to be more specific go to [Advanced configuration](#docker---advanced-configuration).

If you want to set list of headers to keep while resending events from one topic to another you can use `resendHeadersToKeep` environment variable and pass list of comma-seperated header names, for example:
```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e resendHeadersToKeep="requestId,version" consdata/kouncil:latest
```

In order to change the port on which Kouncil listens for connections, just modify the `-p` argument, like so:

```bash
docker run -d -p 7070:8080 -e bootstrapServers="kafka1:9092" consdata/kouncil:latest
```

That will cause Kouncil to listen on port `7070`.

## Docker - advanced configuration

If you have many Kafka clusters, configuring them using `bootstrapServers` may become cumbersome. It is also impossible to express more sophisticated configuration options using such a simple configuration pattern.

To address these issues Kouncil allows you to provide an external configuration in a yaml file.

Kouncil expects this configuration file to be named `kouncil.yaml`. After that it's only a matter of binding a directory containing that file into docker - let's say your `kouncil.yaml` lives in `/home/users/test/Kouncil/config/`, that's how your `docker run` should look:

```bash
docker run -p 80:8080 -v /home/users/test/Kouncil/config/:/config/ consdata/kouncil:latest
```

Format of `kouncil.yaml` is described below.

## Advanced config example

```yaml
kouncil:
  clusters:
    - name: transaction-cluster
      schemaRegistry:
        url: "http://schema.registry:8081"
      brokers:
        - host: 192.10.0.1
          port: 9092
        - host: 192.10.0.2
          port: 9093
        - host: 192.10.0.3
          port: 9094
    - name: kouncil
      schemaRegistry:
        url: "http://another.schema.registry:8081"
      brokers:
        - host: kouncil.kafka.local
          port: 8001
        - host: kouncil.kafka.local
          port: 8002
```
This example shows two clusters, named `transaction-cluster` and `kouncil` respectively. Each cluster needs to have its name specified. After that comes a list of brokers that make up this cluster - each of which consisting of the broker's host and port on which it's listening on.

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

## Advanced config - Amazon MSK Kafka cluster

If one of your brokers in cluster environment is located in Amazon MSK cluster you should specify `saslMechanism`, `saslProtocol`, `saslJassConfig` and `saslCallbackHandler` for this broker, like this:

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

Above configuration is using IAM access to Amazon MSK cluster and you should provide `AWS_SECRET_ACCESS_KEY` and `AWS_ACCESS_KEY_ID` as environment variables to Kouncil. 
And this two values should be generated to the user which has access to Amazon MSK cluster and his username should be provided in `awsProfileName` in Kouncil configuration.

## WebSocket allowed origins configuration
By default, WebSocket allowed origins are set to *, which can be inefficient from the security point of view. You can easily narrow it down, setting `allowedOrigins` environment variable like that:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e allowedOrigins="http://localhost:*, https://yourdomain.com" consdata/kouncil:latest
```

## Authentication
Kouncil supports multiple authentication methods along with LDAP, Active Directory and SSO. There are a lot of different configuration scenarios. Here are examples of most common ones:

* Simplest in-memory provider. Do not require any configuration. Only for the test purposes! Default uses are admin, editor and viewer. Default password for each of these users is equal to username.
```yaml
kouncil:
  auth:
    active-provider: inmemory
```

* LDAPS authentication for all users.
```yaml
kouncil:
  auth:
    active-provider: ldap
    ldap:
      provider-url: "ldaps:///kouncil.io"
      search-base: "ou=Users,dc=kouncil,dc=io"
      search-filter: "(uid={0})"
```

* LDAP authentication with a technical user for users who belong to a KOUNCIL group.
```yaml
kouncil:
  auth:
    active-provider: ldap
    ldap:
      provider-url: "ldaps://kouncil.io"
      technical-user-name: "admin@kouncil.io"
      technical-user-password: "q1w2e3r4"
      search-base: "ou=Users,dc=kouncil,dc=io"
      search-filter: "(&(objectClass=user)(uid={0})(memberOf=CN=KOUNCIL,CN=Users,DC=kouncil,DC=io))"
```

* Active Directory authentication for users who belong to a KOUNCIL group.
```yaml
kouncil:
  auth:
    active-provider: ad
    ad:
      domain: "kouncil.io"
      url: "ldap://kouncil.io:389"
      search-filter: "(&(objectClass=user)(userPrincipalName={0})(memberOf=CN=KOUNCIL,CN=Users,DC=kouncil,DC=io))"
```
* Github SSO
```yaml
kouncil:
  auth:
    active-provider: sso
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: your-client-id
            client-secret: your-client-secret
            redirect-uri: http://your-application-url/oauth
```

## Authorization
Kouncil allows to restrict access to pages and functions for users. To achieve that you should add to you configuration file appropriate properties.
There are three of them, `kouncil.authorization.role-admin`, `kouncil.authorization.role-editor`, `kouncil.authorization.role-viewer`.
Each one of this will allow user to do specific actions in Kouncil. Users with roles assigned to:
* `kouncil.authorization.role-admin` can view brokers and consumer groups pages.
* `kouncil.authorization.role-editor` can view topics, event tracker pages and sent messages to topics.
* `kouncil.authorization.role-viewer` can only view topics and event tracker pages.

As a values in these parameters you should provide semicolon (`;`) separated list of groups defined in selected authentication provider (`inmemory`, `LDAP`, `AD`, `SSO`).

For the default configuration, we have defined user groups: 
```yaml
kouncil:
  authorization:
    role-admin: admin_group
    role-editor: editor_group
    role-viewer: viewer_group
```
These will be used in any authentication method unless you override them in any of your configuration files, which are used by Kouncil.

Example roles configuration:
```yaml
kouncil:
  authorization:
    role-admin: KOUNCIL_ADMIN;ROLE_USER;admin_group
    role-editor: KOUNCIL_EDITOR;editor_group
    role-viewer: KOUNCIL_VIEWER;viewer_group
```

To get LDAP user groups in LDAP configuration we have to add few additional parameters (`group-search-base`, `group-search-filter`, `group-role-attribute`)
```yaml
kouncil:
  auth:
    active-provider: ldap
    ldap:
      provider-url: "ldaps://kouncil.io"
      technical-user-name: "admin@kouncil.io"
      technical-user-password: "q1w2e3r4"
      search-base: "ou=Users,dc=kouncil,dc=io"
      search-filter: "(&(objectClass=user)(uid={0})(memberOf=CN=KOUNCIL,CN=Users,DC=kouncil,DC=io))"
      group-search-base: "ou=Groups,dc=kouncil,dc=io"
      group-search-filter: "(memberuid={0})"
      group-role-attribute: "cn"
```

## Logging
Kouncil supports logging to external log file. We suggest to use logback. If you want you can use our provided `logback.xml` file as it is or use it as a reference to create your custom one.
If you use provided `logback.xml` logs will be placed under logs/kouncil.log

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e logging.config="path_to_your_logback_xml_file_in_docker_container" -v path_to_your_local_logback_xml_folder:/path_to_your_container_logback_xml_folder consdata/kouncil:latest
```
If you want the logs to be accessible outside the docker container, you could pass another volume in docker run command like this:
```bash
-v path_to_your_local_logback_xml_folder:path_to_docker_container_logs
```
Also `path_to_docker_container_logs` should be equal to path in `appender/file` parameter in `logback.xml`
