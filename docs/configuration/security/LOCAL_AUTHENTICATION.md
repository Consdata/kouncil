### Local authentication

Simplest user authentication is using in-memory provider. Do not require any configuration. Only for the test purposes! Default
uses are superuser, admin, editor, viewer. Default password for each of these users is equal to
username.

```yaml
kouncil:
  auth:
    active-provider: inmemory
```
