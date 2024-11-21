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

If you run Kafka in terminal (not using Docker) you can:

   1. Use your host IP address - in this case you need to modify the IP address of listeners and advertised.listeners in server.properties. Kouncil Docker run command would look like this (replace <host_ip_address> with yours IP address):
      ```bash
      docker run -p 80:8080 -e bootstrapServers="<host_ip_address>:9092" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
      ```
   
      Kouncil will be available via: http://localhost/login

   2. Use the IP address of the Docker bridge network - to find that IP address, run Docker network, inspect the bridge in the terminal,  and under Config, use the value assigned to Gateway. You also need to modify the IP addresses of listeners and advertised.listeners in server.properties to the IP address of the gateway. If you run Kouncil on Windows or Mac, you should be able to use host.docker.internal as the IP address of bootstrapServer. 
      ```bash
      docker run -p 80:8080 -e bootstrapServers="host.docker.internal:9092" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
      ```
      If you are using Linux, you will have to use --add-host:
      ```bash 
      docker run -p 80:8080 -e bootstrapServers="host.docker.internal:9092" --add-host=host.docker.internal:host-gateway -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
      ```
      Kouncil will be available via: http://localhost/login
   
   3. Add --network host to Kouncil Docker command. It will look like this (as you can see, I removed the publish flag as it is discarded by Docker when using host network mode):
      ```bash
      docker run -e bootstrapServers="localhost:9092" --network host -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
      ```
      Kouncil will be available via: http://localhost:8080/login
   

If you run Kafka using a Docker container, you have to put both containers in the same network, so they can communicate with each other. First, create a new network using
```bash 
docker network create --driver bridge <network_name>
```
Then use this network name in run command/Docker compose files, for example, Kouncil Docker run command will look like this:
```bash
docker run -p 80:8080 -e bootstrapServers="<container_name>:9092" --network="<network_name>" -e kouncil.auth.active-provider="inmemory" consdata/kouncil:latest
```
Also, you should use Kafka Docker container name as an IP address (see <container_name>)

## I logged in and I see only brokers and consumer groups.

You logged in as an administrator user, `admin`. In this case we have few possible solutions:

   1. Log in as a user with the editor’s role (in default configuration, it will be the `editor` user)
   2. Pass the environment variable, `-e`, `kouncil.authorization.role-editor` in the `docker run` command, with the value of the group name for the admin user. This value will be used instead of the value from default configuration. The Docker run command will look like this:
      ```bash
      docker run -p 80:8080 -e kouncil.authorization.role-editor="editor_group;admin_group" consdata/kouncil:latest
      ```

   3. In the Docker run command, mount a volume with a custom configuration file. The command will look like this:
      ```bash
      docker run -p 80:8080 -v <path to kouncil.yaml config file>:/config/ consdata/kouncil:latest
      ```

## I don't see any resolution to my issue
Please [reach out to us](https://kouncil.io/contact-us/)
