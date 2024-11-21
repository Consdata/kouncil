DELETE FROM system_functions_user_groups where function_id = (select id from system_function where name = 'TOPIC_DETAILS');
DELETE FROM system_function where name='TOPIC_DETAILS';

commit;
