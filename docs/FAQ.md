# Frequently Asked Questions

## I don't see my topics, brokers.
First verify logs using:
```bash
docker logs <container_name>
```
If you see this kind of messages 
```text
 INFO 201079 --- [| adminclient-1] org.apache.kafka.clients.NetworkClient   : [AdminClient clientId=adminclient-1] Node -1 disconnected.
 WARN 201079 --- [| adminclient-1] org.apache.kafka.clients.NetworkClient   : [AdminClient clientId=adminclient-1] Connection to node -1 (/192.168.1.28:9092) could not be established. Broker may not be available.
ERROR 201079 --- [nio-8080-exec-3] com.consdata.kouncil.logging.CoreLogger  : Exception while invoking method=TopicsController.getTopics(..)
ERROR 201079 --- [nio-8080-exec-3] c.c.kouncil.KouncilControllerAdvisor     : Received Exception message=java.util.concurrent.ExecutionException: org.apache.kafka.common.errors.TimeoutException: Timed out waiting for a node assignment. Call: listTopics
com.consdata.kouncil.KouncilRuntimeException: java.util.concurrent.ExecutionException: org.apache.kafka.common.errors.TimeoutException: Timed out waiting for a node assignment. Call: listTopics
```
follow one of the below fixes.

If you run Kafka in terminal (not using docker) you can:

   1. use your host IP address. In that case you would have to modify IP address of listeners and advertised.listeners in server.properties. Kouncil docker run command would look like this (replace <host_ip_address> to yours IP address):
      ```bash
      docker run -p 80:8080 -e bootstrapServers="<host_ip_address>:9092" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
      ```
   
      Kouncil will be available via: http://localhost/login

   2. use IP address of the docker bridge network. To find that IP address you have to run docker network inspect bridge in terminal and under Config use value assigned to Gateway. Also you have to modify IP address of listeners and advertised.listeners in server.properties to the found IP address of the gateway. If you run Kouncil in Windows or Mac you should be able to use host.docker.internal as IP address of bootstrapServer.
      ```bash
      docker run -p 80:8080 -e bootstrapServers="host.docker.internal:9092" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
      ```
      But if you are using Linux you will have to use --add-host:
      ```bash 
      docker run -p 80:8080 -e bootstrapServers="host.docker.internal:9092" --add-host=host.docker.internal:host-gateway -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
      ```
      Kouncil will be available via: http://localhost/login
   
   3. add --network host to Kouncil docker command. It will look like this (as you can see I also removed publish flag as this is discarded by docker when using host network mode):
      ```bash
      docker run -e bootstrapServers="localhost:9092" --network host -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
      ```
      Kouncil will be available via: http://localhost:8080/login
   

If you run Kafka using docker container you have to put both containers in the same network, so they can reach out to each other. Firstly create new network using 
```bash 
docker network create --driver bridge <network_name>
```
Then use this network name in run command/docker compose files, for example Kouncil docker run command will look like this:
```bash
docker run -p 80:8080 -e bootstrapServers="<container_name>:9092" --network="<network_name>" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
```
Also, you should use Kafka docker container name as IP address (see <container_name>)

## I logged in and I see only brokers and consumer groups.

You logged in as an administrator user, `admin`. In this case we have few possible solutions:

   1. Log in as a user with editor role (in default configuration it will be the `editor` user)
   2. Pass environment variable, `-e`, `kouncil.authorization.role-editor` in `docker run` command, which will include the group name for the `admin` user. This value will be used instead of the value from default configuration. Docker run command will look like this:
      ```bash
      docker run -p 80:8080 -e kouncil.authorization.role-editor="editor_group;admin_group" consdata/kouncil:latest
      ```

   3. In docker run command mount volume which will have a custom configuration file. Docker run command will look like this:
      ```bash
      docker run -p 80:8080 -v <path to kouncil.yaml config file>:/config/ consdata/kouncil:latest
      ```

## I don't see any resolution to my issue
Please [reach out to us](mailto:kouncil@consdata.com)
