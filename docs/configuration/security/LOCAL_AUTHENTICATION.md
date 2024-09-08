### Local authentication

The simplest in-memory provider. It does not require any configuration. Only for test purposes! The
default uses are admin, editor, and viewer. The default password for each of these users is user
name.

```yaml
kouncil:
  auth:
    active-provider: inmemory
```
