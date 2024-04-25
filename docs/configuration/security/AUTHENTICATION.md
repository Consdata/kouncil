## Authentication
Kouncil supports multiple authentication methods along with LDAP, Active Directory and SSO. There are a lot of different configuration scenarios. Here are examples of most common ones:

* Simplest in-memory provider. Do not require any configuration. Only for the test purposes! Default uses are admin, editor and viewer. Default password for each of these users is equal to username.
```yaml
kouncil:
  auth:
    active-provider: inmemory
```

* LDAPS authentication for all users.
```yaml
kouncil:
  auth:
    active-provider: ldap
    ldap:
      provider-url: "ldaps:///kouncil.io"
      search-base: "ou=Users,dc=kouncil,dc=io"
      search-filter: "(uid={0})"
```

* LDAP authentication with a technical user for users who belong to a KOUNCIL group.
```yaml
kouncil:
  auth:
    active-provider: ldap
    ldap:
      provider-url: "ldaps://kouncil.io"
      technical-user-name: "admin@kouncil.io"
      technical-user-password: "q1w2e3r4"
      search-base: "ou=Users,dc=kouncil,dc=io"
      search-filter: "(&(objectClass=user)(uid={0})(memberOf=CN=KOUNCIL,CN=Users,DC=kouncil,DC=io))"
```

* Active Directory authentication for users who belong to a KOUNCIL group.
```yaml
kouncil:
  auth:
    active-provider: ad
    ad:
      domain: "kouncil.io"
      url: "ldap://kouncil.io:389"
      search-filter: "(&(objectClass=user)(userPrincipalName={0})(memberOf=CN=KOUNCIL,CN=Users,DC=kouncil,DC=io))"
```
* Github SSO
```yaml
kouncil:
  auth:
    active-provider: sso
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
