DELETE
FROM functions_user_groups;
DELETE
FROM user_group;
DELETE
FROM function;

ALTER TABLE function
    add column function_group VARCHAR(40);
ALTER TABLE user_group
    add column code VARCHAR(255);

insert into function(id, name, label, function_group)
VALUES (nextval('SEQ_FUNCTION'), 'TOPIC_LIST', 'Topic list', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'TOPIC_CREATE', 'Create new topic', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'TOPIC_DETAILS', 'View topic details', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'TOPIC_UPDATE', 'Update topic', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'TOPIC_DELETE', 'Delete topic', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'TOPIC_MESSAGES', 'View topic messages', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'TOPIC_SEND_MESSAGE', 'Send message', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'TOPIC_RESEND_MESSAGE', 'Resend message', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'CONSUMER_GROUP_LIST', 'View consumer group list', 'CONSUMER_GROUP'),
       (nextval('SEQ_FUNCTION'), 'CONSUMER_GROUP_DELETE', 'Delete consumer group', 'CONSUMER_GROUP'),
       (nextval('SEQ_FUNCTION'), 'CONSUMER_GROUP_DETAILS', 'View consumer group details', 'CONSUMER_GROUP'),
       (nextval('SEQ_FUNCTION'), 'TRACK_LIST', 'View event track list', 'TOPIC'),
       (nextval('SEQ_FUNCTION'), 'SCHEMA_LIST', 'View schema list', 'SCHEMA_REGISTRY'),
       (nextval('SEQ_FUNCTION'), 'SCHEMA_DETAILS', 'View schema details', 'SCHEMA_REGISTRY'),
       (nextval('SEQ_FUNCTION'), 'SCHEMA_CREATE', 'Create new schema', 'SCHEMA_REGISTRY'),
       (nextval('SEQ_FUNCTION'), 'SCHEMA_UPDATE', 'Update schema', 'SCHEMA_REGISTRY'),
       (nextval('SEQ_FUNCTION'), 'SCHEMA_DELETE', 'Delete schema', 'SCHEMA_REGISTRY'),
       (nextval('SEQ_FUNCTION'), 'LOGIN', 'Login', 'ADMIN'),
       (nextval('SEQ_FUNCTION'), 'CLUSTER_LIST', 'Cluster list', 'CLUSTER'),
       (nextval('SEQ_FUNCTION'), 'CLUSTER_CREATE', 'Create new cluster', 'CLUSTER'),
       (nextval('SEQ_FUNCTION'), 'CLUSTER_UPDATE', 'Update cluster', 'CLUSTER'),
       (nextval('SEQ_FUNCTION'), 'CLUSTER_DETAILS', 'View cluster details', 'CLUSTER'),
       (nextval('SEQ_FUNCTION'), 'CLUSTER_DELETE', 'Delete cluster', 'CLUSTER'),
       (nextval('SEQ_FUNCTION'), 'BROKERS_LIST', 'View broker list', 'CLUSTER'),
       (nextval('SEQ_FUNCTION'), 'BROKER_DETAILS', 'View broker details', 'CLUSTER'),
       (nextval('SEQ_FUNCTION'), 'USER_GROUPS', 'Manage user groups', 'ADMIN'),
       (nextval('SEQ_FUNCTION'), 'USER_GROUPS_LIST', 'Groups list', 'ADMIN'),
       (nextval('SEQ_FUNCTION'), 'USER_GROUP_CREATE', 'Add new group', 'ADMIN'),
       (nextval('SEQ_FUNCTION'), 'USER_GROUP_UPDATE', 'Update group', 'ADMIN'),
       (nextval('SEQ_FUNCTION'), 'USER_GROUP_DELETE', 'Delete group', 'ADMIN')
;

commit;
