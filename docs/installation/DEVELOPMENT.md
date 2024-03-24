# Local Development

## Running the project
For the backend, run KouncilApplication passing parameter ```bootstrapServers=localhost:9092``` pointing to any of your Kafka brokers and ```spring.config.name=kouncil```.

For the frontend, having node and yarn installed, run ```yarn``` and ```yarn start```

For the local Kafka, create docker-compose.yml (KAFKA_ADVERTISED_HOST_NAME should match your docker host IP)
```yaml
version: "2"

services:
  kafka:
    image: docker.io/bitnami/kafka:latest
    ports:
      - "9092:9092"
    environment:
      # KRaft settings
      - KAFKA_CFG_NODE_ID=0
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka:9093
      # Listeners
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT
```

run ```docker-compose up -d```

more info: https://hub.docker.com/r/bitnami/kafka/

By default, authentication is set to inmemory. Default users role configuration is described here [Authorization](../configuration/security/AUTHORIZATION.md). 
You can modify this to match your needs, for example if you want to have editor role on an admin user you have to add `admin-group` to the `role-editor`. 

## Release

To release just push to release branch:
```bash
git push origin master:release
```

after a successful release, remember to merge back to master:
```bash
git merge origin/release
```
