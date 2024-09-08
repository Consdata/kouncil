# Deployment

Kouncil can be configured in two ways:

* simple - suitable for most cases, relying solely on `docker run` parameters
* advanced - suitable for larger configurations, provided as an external file, allowing version
  control tracking and providing additional configuration options not available in the simple setup

In the case of both simple and advanced configuration being present, the advanced configuration
takes precedence.

## Docker - simple configuration

Simple configuration is passed directly into `docker run` command using `bootstrapServers`
environment variable, just as we've seen in [Quick start](../README.md#quick-start):

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" consdata/kouncil:latest
```

`bootstrapServers` variable expects a comma-separated list of brokers, each belonging to a different
cluster. Kouncil only needs to know about a single broker from the cluster in order to work.

The simplest possible configuration looks like this:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" consdata/kouncil:latest
```

Next, visit [http://localhost](http://localhost) in your browser, and you should be greeted with a
list of topics from your cluster.

If you have multiple clusters and wish to manage them all with Kouncil, you can do so by simply
specifying one broker from each cluster using a comma-separated list:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092,kafka1.another.cluster:8001" consdata/kouncil:latest
```

If you want to set Schema Registry URL, use `schemaRegistryUrl` environment variable, for instance:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e schemaRegistryUrl="http://schema.registry:8081" consdata/kouncil:latest
```

This URL will be used for every cluster in `boostrapServers` variable. If you want to be more
specific, go to [Advanced configuration](#docker---advanced-configuration).

If you want to set a list of headers to keep while resending events from one topic to another, you
can use `resendHeadersToKeep` environment variable and pass the list of comma-separated header
names, for example:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e resendHeadersToKeep="requestId,version" consdata/kouncil:latest
```

To change the port on which Kouncil listens for connections, just modify the `-p` argument, like so:

```bash
docker run -d -p 7070:8080 -e bootstrapServers="kafka1:9092" consdata/kouncil:latest
```

It will cause Kouncil to listen on port `7070`.

## Docker - advanced configuration

If you have many Kafka clusters, configuring them using `bootstrapServers` may become cumbersome. It
is also impossible to express more sophisticated configuration options using such a simple
configuration pattern.

To address these issues, Kouncil allows you to provide an external configuration in a YAML file.

Kouncil expects this configuration file to be named `kouncil.yaml`. It's only a matter of binding a
directory containing that file with Docker. Let's say your `kouncil.yaml` lives
in `/home/users/test/Kouncil/config/` - this is what your `docker run` should look like:

```bash
docker run -p 80:8080 -v /home/users/test/Kouncil/config/:/config/ consdata/kouncil:latest
```

The format of `kouncil.yaml` is described below.

## Advanced configuration example

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

This example shows two clusters named `transaction-cluster` and `kouncil`. Each cluster requires a
specified name, followed by a list of brokers that make up the cluster. Each broker entry includes
the broker's host and the port it is listening on.
