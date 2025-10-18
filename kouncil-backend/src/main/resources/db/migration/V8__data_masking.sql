create table policy
(
    id           bigint not null primary key,
    name         varchar(255),
    masking_type varchar(255),
    apply_to_all_resources boolean
);
create table policy_fields
(
    policy_id bigint not null
        constraint fkq4ltt72s1qqgpolry1fnmy67b references policy,
    field     varchar(255)
);

create table policy_resource
(
    id         bigint not null primary key,
    topic      varchar(255),
    cluster_id bigint
        constraint fk58aualhiqf7wqmxjo5nwgnqn9 references cluster,
    policy_id  bigint
        constraint fkltj5s392jlbr2mshmoyn3vd2a references policy
);

CREATE SEQUENCE SEQ_POLICY MINVALUE 1 START WITH 1 INCREMENT BY 1 CACHE 10;
CREATE SEQUENCE SEQ_POLICY_RESOURCE MINVALUE 1 START WITH 1 INCREMENT BY 1 CACHE 10;

insert into system_function(id, name, label, function_group)
VALUES (nextval('SEQ_SYSTEM_FUNCTION'), 'POLICY_LIST', 'Policies list', 'DATA_MASKING'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'POLICY_CREATE', 'Create new policy',
        'DATA_MASKING'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'POLICY_DETAILS', 'View policy details',
        'DATA_MASKING'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'POLICY_UPDATE', 'Update policy',
        'DATA_MASKING'),
       (nextval('SEQ_SYSTEM_FUNCTION'), 'POLICY_DELETE', 'Delete policy',
        'DATA_MASKING')
;

commit;
