## WebSocket allowed origins configuration

By default, WebSocket allowed origins are set to *, which can be insecure. You can easily narrow it
down by setting the allowedOrigins environment variable as follows:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e allowedOrigins="http://localhost:*, https://yourdomain.com" consdata/kouncil:latest
```

