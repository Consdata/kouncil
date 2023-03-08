# Kouncil for Apache Kafka
[![Price](https://img.shields.io/badge/price-FREE-0098f7.svg)](https://github.com/consdata/kouncil/blob/master/LICENSE)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://github.com/consdata/kouncil/blob/master/LICENSE)
[![Build Status](https://github.com/Consdata/kouncil/actions/workflows/build.yml/badge.svg)](https://github.com/Consdata/kouncil/actions/workflows/build.yml)
[![Docker](https://img.shields.io/docker/pulls/consdata/kouncil.svg)](https://hub.docker.com/r/consdata/kouncil)
[![Release version](https://img.shields.io/github/v/release/consdata/kouncil)](https://github.com/consdata/kouncil/releases)
![Github Start](https://img.shields.io/github/stars/consdata/kouncil.svg)

> Kouncil lets you monitor and manage your Apache Kafka clusters using a modern web interface. It's free & open source kafka web UI, feature-rich and easy to set up! This simple kafka tool makes your DATA detectible, helps to troubleshoot problems and deliver optimal solutions. Yoy can easily monitor brokers and their condition, consumer groups and their pace along with the current lag or simply view the content of topics in real time.

Here are some of **the main features of [Kouncil](https://kouncil.io)**. For a more comprehensive list check out the [docs.kouncil.io](https://docs.kouncil.io)
* Advanced record browsing in table format
* Multiple cluster support
* Cluster monitoring
* Consumer group monitoring
* Event Tracking

![Kouncil](.github/img/jumbo.png)

## Quick start

The easiest way to start working with Kouncil is by using Docker:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
```
#### Authentication
Default credentials to log in to Kouncil are admin/admin.

## Documentation
* The official Kouncil documentation: [docs.kouncil.io](https://docs.kouncil.io)
