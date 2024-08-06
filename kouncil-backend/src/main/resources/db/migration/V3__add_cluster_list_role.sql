DELETE FROM system_functions_user_groups;
DELETE FROM user_group;

insert into system_function(id, name, label)
VALUES (nextval('SEQ_SYSTEM_FUNCTION'), 'CLUSTER_LIST', 'Cluster list');

