create table policy
(
    id           bigint not null primary key,
    name         varchar(255),
    masking_type varchar(255)
);
create table policy_fields
(
    policy_id bigint not null
        constraint fkq4ltt72s1qqgpolry1fnmy67b references policy,
    field     varchar(255)
);

create table policy_resources
(
    policy_id bigint not null
        constraint fkk7ao2gxpd7peapqwu27wj9dng references policy,
    resources varchar(255)
);

CREATE SEQUENCE SEQ_POLICY MINVALUE 1 START WITH 1 INCREMENT BY 1 CACHE 10;

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
