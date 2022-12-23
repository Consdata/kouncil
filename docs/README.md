# Kouncil for Apache Kafka

Kouncil lets you monitor and manage your Apache Kafka clusters using a modern web interface. It's free & open source kafka web UI, [feature-rich](FEATURES.md#features) and [easy to set up](#quick-start)! This simple kafka tool makes your DATA detectible, helps to troubleshoot problems and deliver optimal solutions. Yoy can easily monitor brokers and their condition, consumer groups and their pace along with the current lag or simply view the content of topics in real time.

Here are some of **the main features of [Kouncil](https://kouncil.io)**. For a more comprehensive list check out the [features section](FEATURES.md#features).
* Advanced record browsing in table format
* Multiple cluster support
* Cluster monitoring
* Consumer group monitoring
* Event Tracking

## Demo app

If you wish to simply check out Kouncil in action, without having to install it, we've prepared a demo site showcasing the main features of Kouncil. The demo site can be found [here](https://kouncil-demo.web.app/)

## Quick start

The easiest way to start working with Kouncil is by using Docker:

```bash
docker run -d -p 80:8080 -e bootstrapServers="KAFKA_BROKER_HOST:9092" consdata/kouncil:latest
```
There is only one required environment variable, `bootstrapServers`, which should point to one of the brokers in your Kafka cluster. For example, if your cluster consists of three brokers - kafka1.cluster.local, kafka2.cluster.local, kafka3.cluster.local - you only have to specify one of them (`-e bootstrapServers="kafka1.cluster.local:9092"`), and you are good to go, Kouncil will automatically do the rest!

Additionally, Kouncil supports multiple clusters. Hosts specified in `bootstrapServers` may point to brokers in several clusters, and Kouncil will recognize that properly. Brokers should be separated using comma, i.e.: `docker run -d -p 80:8080 -e bootstrapServers="CLUSTER_1:9092,CLUSTER_2:9092" consdata/kouncil:latest`

After the `docker run` command head to [http://localhost](http://localhost).

Images for Kouncil are hosted here: https://hub.docker.com/r/consdata/kouncil.

For more advanced configuration consult the [Deployment](DEPLOYMENT.md#deployment) section.

## Authentication
Default credentials to log in to Kouncil are admin/admin. For more authentication option head out to [Authentication](DEPLOYMENT.md#authentication)

## Roadmap
| Version                                                                                                        | Content                                                                                                                                                                                                                                                                                                                                                              | Status         |
|----------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| <b>UI Tweaks Part 1</b>  <br> A handful of fixes based on the most frequently reported comments from our users | <ul> <li> Better logs on broker unavailability <li> Broker config - table improvements </li> <li> Consumer group - Improved lag tracking </li> <li> Consumer group - colour coded </li> <li> Event tracking - date format </li> <li> Event tracking - topic order </li> <li> Event tracking - web socket toggle </li> <li> Tables - Stick it to the left </li> </ul> | Released (1.1) |
| <b> Not Only JSON Part 1</b>  <br> This version will bring the remaining popular message formats               | <ul> <li> Schema Registry </li> <li>Protobuf consumer</li><li>Protobuf producer</li> </ul>                                                                                                                                                                                                                                                                           | Released (1.2) |
| <b> Not Only JSON Part 2</b>  <br> This version will bring the remaining popular message formats               | <ul>  <li> Avro consumer</li> <li> Avro producer</li><li>Plaintext handling</li> </ul>                                                                                                                                                                                                                                                                               | Released (1.4) |
| <b> Security </b>  <br> Extended Kafka and Kouncil security support                                            | <ul> <li> SSL support</li> <li> JAAS authentication </li> <li> LDAP authentication</li> <li> Logged users activity monitoring</li>  </ul>                                                                                                                                                                                                                            | In progress    |
| <b> Cloud </b> <br>Easy way of deploying Kouncil to the cloud                                                  | <ul> <li>K8s support - helm chart</li>  <li> Terraform (GCP, AWS, Azure) </li> </ul>                                                                                                                                                                                                                                                                                 | TODO           |
| <b> UI Tweaks Part 2 </b> <br>Second batch of frontend improvements                                            | <ul> <li>Broker list - overview</li> <li>Event tracking - additional columns </li>  <li>Tables - column auto adjustment </li>  <li>Consumer Group - Lag preview </li>  </li>                                                                                                                                                                                         | TODO           |

