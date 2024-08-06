create table system_function
(
    id    bigint             not null primary key,
    name  varchar(40) unique not null,
    label varchar(255)
);

create table user_group
(
    id   bigint              not null primary key,
    name varchar(255) unique not null
);

create table system_functions_user_groups
(
    system_function_id   bigint not null
        constraint fkm881e9dsmi47fw56l92mgc8gq references system_function,
    user_group_id bigint not null
        constraint fkovb2eut0o2pwk7si60ue5f63i references user_group,
    primary key (system_function_id, user_group_id)
);

CREATE SEQUENCE SEQ_SYSTEM_FUNCTION MINVALUE 1 START WITH 1 INCREMENT BY 1 CACHE 10;
CREATE SEQUENCE SEQ_USER_GROUP MINVALUE 1 START WITH 1 INCREMENT BY 1 CACHE 10;



insert into system_function(id, name, label)
VALUES (nextval('SEQ_SYSTEM_FUNCTION'), 'TOPIC_LIST', 'Topic list'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'TOPIC_CREATE', 'Create new topic'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'TOPIC_DETAILS', 'View topic details'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'TOPIC_UPDATE', 'Update topic'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'TOPIC_DELETE', 'Delete topic'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'TOPIC_MESSAGES', 'View topic messages'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'TOPIC_SEND_MESSAGE', 'Send message'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'TOPIC_RESEND_MESSAGE', 'Resend message'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'BROKERS_LIST', 'View broker list'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'BROKER_DETAILS', 'View broker details'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'CONSUMER_GROUP_LIST', 'View consumer group list'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'CONSUMER_GROUP_DELETE', 'Delete consumer group'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'CONSUMER_GROUP_DETAILS', 'View consumer group details'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'TRACK_LIST', 'View event track list'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'SCHEMA_LIST', 'View schema list'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'SCHEMA_DETAILS', 'View schema details'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'SCHEMA_CREATE', 'Create new schema'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'SCHEMA_UPDATE', 'Update schema'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'SCHEMA_DELETE', 'Delete schema'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'LOGIN', 'Login');
