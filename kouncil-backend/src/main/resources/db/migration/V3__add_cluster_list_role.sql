DELETE FROM functions_user_groups;
DELETE FROM user_group;

insert into function(id, name, label)
VALUES (nextval('SEQ_FUNCTION'), 'CLUSTER_LIST', 'Cluster list');

commit;
