## Database configuration

Currently, Kouncil supports two databases:
* PostgreSQL
* H2

If no database is specified with below properties, H2 in-memory database will be used.

### Configuration properties
* `spring.datasource.url` JDBC URL of the database
* `spring.datasource.username` login username of the database
* `spring.datasource.password` login password of the database
* `spring.jpa.hibernate.default_schema` sets default schema 

### Example
```yaml
spring:
  datasource:
      url: jdbc:postgresql://localhost:5432/
      username: postgres
      password: password
  jpa:
    hibernate:
      default_schema: kouncil
```
