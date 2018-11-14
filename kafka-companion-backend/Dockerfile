FROM openjdk:8-jdk-alpine
VOLUME /tmp
RUN apk add --update libc6-compat
ARG JAR_FILE
ADD ${JAR_FILE} app.jar
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
