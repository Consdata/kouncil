### LDAP, LDAPS and AD authentication

Below you can find configuration snippets for authentication using LDAP, LDAPS and AD:

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
