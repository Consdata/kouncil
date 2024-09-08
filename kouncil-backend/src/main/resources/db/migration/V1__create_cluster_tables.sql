CREATE TABLE SCHEMA_REGISTRY
(
    ID                    BIGINT       NOT NULL PRIMARY KEY,
    AUTHENTICATION_METHOD VARCHAR(14)  NOT NULL,
    SECURITY_PROTOCOL     VARCHAR(255),
    KEY_PASSWORD          VARCHAR(255),
    KEYSTORE_LOCATION     VARCHAR(255),
    KEYSTORE_PASSWORD     VARCHAR(255),
    KEYSTORE_TYPE         INTEGER,
    PASSWORD              VARCHAR(255),
    TRUSTSTORE_LOCATION   VARCHAR(255),
    TRUSTSTORE_PASSWORD   VARCHAR(255),
    TRUSTSTORE_TYPE       INTEGER,
    USERNAME              VARCHAR(255),
    URL                   VARCHAR(255) NOT NULL
);

CREATE TABLE CLUSTER
(
    ID                    BIGINT      NOT NULL PRIMARY KEY,
    NAME                  VARCHAR(40) NOT NULL UNIQUE,
    AUTHENTICATION_METHOD VARCHAR(7)  NOT NULL,
    SECURITY_PROTOCOL     VARCHAR(255),
    SASL_MECHANISM        VARCHAR(255),
    KEY_PASSWORD          VARCHAR(255),
    KEYSTORE_LOCATION     VARCHAR(255),
    KEYSTORE_PASSWORD     VARCHAR(255),
    TRUSTSTORE_LOCATION   VARCHAR(255),
    TRUSTSTORE_PASSWORD   VARCHAR(255),
    USERNAME              VARCHAR(255),
    PASSWORD              VARCHAR(255),
    AWS_PROFILE_NAME      VARCHAR(255),
    GLOBAL_JMX_PASSWORD   VARCHAR(40),
    GLOBAL_JMX_PORT       VARCHAR(5),
    GLOBAL_JMX_USER       VARCHAR(40),
    SCHEMA_REGISTRY_ID    BIGINT
        CONSTRAINT FKA2711P8DDP9LO6TQ6V6RNYTQH REFERENCES SCHEMA_REGISTRY
);

CREATE TABLE BROKER
(
    ID               BIGINT       NOT NULL PRIMARY KEY,
    BOOTSTRAP_SERVER VARCHAR(255) NOT NULL,
    JMX_PASSWORD     VARCHAR(40),
    JMX_PORT         VARCHAR(5),
    JMX_USER         VARCHAR(40),
    CLUSTER_ID       BIGINT
        CONSTRAINT FK2YXH9X6VCDMYGIKJCS5AOWAWL REFERENCES CLUSTER
);

CREATE SEQUENCE SEQ_CLUSTER MINVALUE 1 START WITH 1 INCREMENT BY 1 CACHE 10;
CREATE SEQUENCE SEQ_SCHEMA_REGISTRY MINVALUE 1 START WITH 1 INCREMENT BY 1 CACHE 10;
CREATE SEQUENCE SEQ_BROKER MINVALUE 1 START WITH 1 INCREMENT BY 1 CACHE 10;
