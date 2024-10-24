## Logging

Kouncil supports logging to an external log file, and we recommend using Logback. You can either use
the provided `logback.xml` file as-is or use it as a reference to create your custom one.
If you use the provided `logback.xml`, logs will be placed under logs/kouncil.log

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e logging.config="path_to_your_logback_xml_file_in_docker_container" -v path_to_your_local_logback_xml_folder:/path_to_your_container_logback_xml_folder consdata/kouncil:latest
```

If you want the logs to be accessible outside the Docker container, you can add another volume to
the Docker run command like this:

```bash
-v path_to_your_local_logback_xml_folder:path_to_docker_container_logs
```

Ensure that `path_to_docker_container_logs` matches the path specified in the `appender/file`
parameter in your `logback.xml`.
