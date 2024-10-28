## Custom context path

If you want to expose Kouncil in a custom context path, you need to set
Spring's `kouncil.context-path` parameter.
In Docker run command it will look like this

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e kouncil.context-path="/console" consdata/kouncil:latest
```

After that, visit [http://localhost/console](http://localhost/console) in your browser, and you
should see a login screen.
