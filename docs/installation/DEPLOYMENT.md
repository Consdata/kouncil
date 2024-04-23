# Deployment

There are two ways in which Kouncil can be configured:
* simple - suitable for most cases, relying solely on `docker run` parameters
* advanced - suitable for larger configurations. Provided as an external file, and thus can be tracked in version control. It also exposes additional configuration options, which are not available in the simple configuration

## Docker - simple configuration

Simple configuration is passed directly into `docker run` command using `bootstrapServers` environment variable, just as we've seen in [Quick start](../README.md#quick-start):

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
