![Kouncil](.github/img/jumbo.png)

# Kouncil
[![Build Status](https://travis-ci.com/Consdata/kouncil.svg?branch=master)](https://travis-ci.com/Consdata/kouncil)
[![Docker](https://img.shields.io/docker/pulls/consdata/kouncil.svg)](https://hub.docker.com/r/consdata/kouncil)

[Kouncil](https://kounci.io) lets you manage your Kafka clusters using modern web interface. It's [free & open source](#license), [feature rich](#features) and [easy to setup](#quick-start)! 

Here are some of the main features. For more comprehensive list checkout the [features section](#features).
* Advanced record browsing in table format
* Multiple cluster support
* Cluster monitoring
* Consumer group monitoring

## Table of Contents

- [Quick start](#quick-start)
- [Demo site](#demo-site)
- [Features](#features)
- [Deployment](#deployment)
  - [Docker](#docker)
  - [From sources](#sources)
- [Configuration](#configuration)
- [Local Development](#local-development)
- [License](#license)
- [About](#about)

## Quick start

Easiest way to start working with Kouncil is by using Docker:

```
docker run -d -p 80:8080 -e bootstrapServers="KAFKA_BROKER_HOST:9092" consdata/kouncil:latest
```
There is only one required environment variable, `bootstrapServers`, that should point to one of the brokers in your Kafka cluster. For example, if your cluster consists of three brokers - kafka1.cluster.local, kafka2.cluster.local, kafka3.cluster.local - you only have to specify one of them (`-e bootstrapServers="kafka1.cluster.local:9092"`) and you are good to go, Kouncil will automatically do the rest!

Additionaly, Koucil supports multiple clusters. Hosts specified in `bootstrapServers` may point to brokers in several different clusters, and Kouncil will recognize that properly. Brokers should be separated using comma, i.e.: `docker run -d -p 80:8080 -e bootstrapServers="CLUSTER_1:9092,CLUSTER_2:9092" consdata/kouncil:latest`

After the `docker run` command head to [http://localhost](http://localhost).

For more advanced configuration consult the [Deployment](#deployment) section.

## Demo site

If you wish to simply check out Kouncil in action, without having to install it, we've prepared a demo site showcasing main features of Kouncil. Demo site can be found [here](https://kouncil-demo.web.app/)

## Features

### Multiple cluster support

### Advanced JSON processing

### Cluster monitoring

### Consumer monitoring

## Deployment

There are two ways in which Kouncil can be configured:
* simple - suitable for most cases, relying solely on `docker run` parameters
* advanced - suitable for larger configurations. Since it's provided as an external file, advanced configuration can be tracked in version control. It also exposes additional configuration options, which are not avaiable in simple configuration

### Docker - simple configuration

Simple configuration is passed directly into `docker run` command using `bootstrapServers` environment variable, just as we've seen in [Quick start](#quick-start):

```
docker run -d -p 80:8080 -e bootstrapServers="KAFKA_BROKER_HOST:9092" consdata/kouncil:latest
```

`bootstrapServers` variable expects a comma separated list of brokers, each belonging to a different cluster. Kouncil only needs to know about single broker from cluster in order to work.

So the simplest possible configuration would look like that:

```
docker run -d -p 80:8080 -e bootstrapServers="kafka1.cluster.local:9092" consdata/kouncil:latest
```

After that, visit [http://localhost](http://localhost) in your browser, and you should be greeted with list of topics from your cluster.

If you have multiple clusters, and wish to manage them all with Kouncil, you can do so by simply specifying one broker from each cluster using comma separated list:

```
docker run -d -p 80:8080 -e bootstrapServers="kafka1.cluster.local:9092,kafka1.another.cluster:8001" consdata/kouncil:latest
```

If you wish to change the port on which Kouncil listens for connections, just modify the `-p` argument, like so:

```
docker run -d -p 7070:8080 -e bootstrapServers="kafka1.cluster.local:9092" consdata/kouncil:latest
```

That will cause Kouncil to listen on port `7070`.

### Docker - advanced configuration

Advanced configuration takes precedence over simple configuration.

### Sources

## Local Development
For a backend, run KouncilApplication passing parameter ```bootstrapServers=localhost:9092``` pointing to any of your Kafka brokers.

For a frontend, having node and yarn installed, run ```yarn``` and ```yarn start```

For a local Kafka with two test topics, create docker-compose.yml (KAFKA_ADVERTISED_HOST_NAME should match your docker host IP)
```
version: '2'
services:
  zookeeper:
    image: wurstmeister/zookeeper
    ports:
      - "2181:2181"
  kafka:
    image: wurstmeister/kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: 192.168.1.76
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_CREATE_TOPICS: "TestTopic:4:1,TestTopicCompact:4:1:compact"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

run ```docker-compose up -d```

more info: https://hub.docker.com/r/wurstmeister/kafka/


# Release

To release just push to release branch:
```bash
git push origin master:release
```

after successful release, remember to merge back to master:
```bash
git merge origin/release
```
## License
