## Logging
Kouncil supports logging to external log file. We suggest to use logback. If you want you can use our provided `logback.xml` file as it is or use it as a reference to create your custom one.
If you use provided `logback.xml` logs will be placed under logs/kouncil.log

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e logging.config="path_to_your_logback_xml_file_in_docker_container" -v path_to_your_local_logback_xml_folder:/path_to_your_container_logback_xml_folder consdata/kouncil:latest
```
If you want the logs to be accessible outside the docker container, you could pass another volume in docker run command like this:
```bash
-v path_to_your_local_logback_xml_folder:path_to_docker_container_logs
```
Also `path_to_docker_container_logs` should be equal to path in `appender/file` parameter in `logback.xml`
