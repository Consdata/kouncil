# Kafka Companion
Simple frontend for browsing and adding messages to the Kafka topics.

# Developent
For backend, run KafkaCompanionApplication passing parameter ```bootstrapServers=localhost:9092```.

For frontent, having ng-cli installed, run ```ng start``` preceeded by ```npm install```

# Deployment
```
mvn package -P dist
docker run -d -p 64000:8080 -e bootstrapServers="localhost:9092" --name kafka-companion tomlewlit/kafka-companion
```
