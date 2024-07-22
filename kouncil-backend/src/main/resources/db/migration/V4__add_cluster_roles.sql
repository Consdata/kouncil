DELETE FROM functions_user_groups;
DELETE FROM user_group;

insert into function(id, name, label) VALUES (nextval('SEQ_FUNCTION'), 'CLUSTER_CREATE', 'Create new cluster');
insert into function(id, name, label) VALUES (nextval('SEQ_FUNCTION'), 'CLUSTER_UPDATE', 'Update cluster');
insert into function(id, name, label) VALUES (nextval('SEQ_FUNCTION'), 'CLUSTER_DETAILS', 'View cluster details');

commit;
