# Kouncil for Apache Kafka

Kouncil lets you monitor and manage your Apache Kafka clusters using a modern web interface.It's
an [easy-to-set-up](#quick-start), [feature-rich](FEATURES.md#features), free and open-source Kafka
web UI. This simple Kafka tool makes your DATA detectible, helps troubleshoot problems and deliver
optimal solutions. You can easily monitor brokers and their condition, consumer groups and their
pace along with the current lag, or view the content of topics in real time.

Here are some of **[Kouncil's](https://kouncil.io) main features**. For a more comprehensive list
check out the [features section](FEATURES.md#features).

* Advanced record browsing in table format
* Multiple cluster support
* Cluster monitoring
* Consumer group monitoring
* Event Tracking

## Demo app

Check out Kouncil in action without installing it. We've prepared a demo site showcasing the main
features of Kouncil, which can be found [here]. (https://kouncil-demo.web.app/)

## Quick start

The easiest way to start working with Kouncil is by using Docker:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
```
There are only two required environment variables: `bootstrapServers`, which should point to one of
the brokers in your Kafka cluster, and `kouncil.auth.active-provider`, which specifies
authentication mode. For example, if your cluster consists of three brokers - kafka1:9092, kafka2:
9092, kafka3:9092 - you only have to specify one of them (`-e bootstrapServers="kafka1:9092"`), and
you are good to go. Kouncil will automatically do the rest.

Additionally, Kouncil supports multiple clusters. Hosts specified in `bootstrapServers` may point to
brokers in several clusters, and Kouncil will recognize that properly. Brokers should be separated
using a comma,
i.e.: `docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092,kafka1.another.cluster:8001" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest`

After the `docker run` command, head to [http://localhost](http://localhost).

Images for Kouncil are hosted here: https://hub.docker.com/r/consdata/kouncil.

For more advanced configuration, consult the [Deployment](installation/DEPLOYMENT.md#deployment)
section.

## Authentication

Default credentials to log in to Kouncil are admin/admin. For more authentication options, check
out [Authentication](configuration/security/AUTHENTICATION.md)
