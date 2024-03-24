## WebSocket allowed origins configuration
By default, WebSocket allowed origins are set to *, which can be inefficient from the security point of view. You can easily narrow it down, setting `allowedOrigins` environment variable like that:

```bash
docker run -d -p 80:8080 -e bootstrapServers="kafka1:9092" -e allowedOrigins="http://localhost:*, https://yourdomain.com" consdata/kouncil:latest
```

