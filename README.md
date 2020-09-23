# Kafka Companion
During work on our latest messaging system which is based on Kafka, we needed a simple tool for browsing and testing. We went on a search for an easy and free solution, but we didn't find anything that suits our needs. So we came up with our solution. If your payload is in JSON, you're in the right place. Kafka Companion lets you 
* check cluster state, 
* monitor consumers lag,
* browse messages in a table format,
* generate messages with auto-filled placeholders.

# Development
For a backend, run KafkaCompanionApplication passing parameter ```bootstrapServers=localhost:9092``` pointing to any of your Kafka brokers.

For a frontend, having node and yarn installed, run ```yarn``` and ```yarn start```

# Deployment
```
docker run -d -p 64000:8080 -e bootstrapServers="localhost:9092" consdata/kafka-companion:latest
```
