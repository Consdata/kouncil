

## Custom base path
If you want to expose Kouncil in custom base path you need to set Spring's `server.servlet.context-path` parameter.
In docker run command it will look like this
```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e server.servlet.context-path="/console" consdata/kouncil:latest
```
After that, visit [http://localhost/console](http://localhost/console) in your browser, and you should be greeted by a login screen.
