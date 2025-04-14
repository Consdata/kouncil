### GitHub SSO configuration

In Kouncil you can configure GitHub SSO by adding below snippet to your configuration file. You have to replace `your-client-id`, `your-client-secret` and `your-application-url`.

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
            scope: read:org
```

Since GitHub doesn't have user roles like other RBAC systems, we decided to use GitHub teams as objects to define access in Kouncil. With the configuration above, Kouncil will use teams across all users organizations. If you want to limit this to specific organizations provide the `spring.security.oauth2.client.registration.github.organizations` parameter. If you need to specify more than one organization, use a comma as the delimiter.
