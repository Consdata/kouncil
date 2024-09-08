### GitHub SSO configuration

In Kouncil you can configure GitHub SSO by adding below snippet to your configuration file. You have
to replace `your-client-id`, `your-client-secret` and `your-application-url`.

```yaml
kouncil:
  auth:
    active-provider: sso
    sso:
      supported:
        providers: github
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: your-client-id
            client-secret: your-client-secret
            redirect-uri: http://your-application-url/oauth
```
