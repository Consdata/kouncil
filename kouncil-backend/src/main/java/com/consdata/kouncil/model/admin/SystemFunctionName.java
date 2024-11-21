package com.consdata.kouncil.model.admin;

import lombok.experimental.FieldNameConstants;

@FieldNameConstants(onlyExplicitlyIncluded = true)
public enum SystemFunctionName {

    //topic
    @FieldNameConstants.Include TOPIC_LIST,
    @FieldNameConstants.Include TOPIC_CREATE,
    @FieldNameConstants.Include TOPIC_UPDATE,
    @FieldNameConstants.Include TOPIC_DELETE,
    @FieldNameConstants.Include TOPIC_MESSAGES,
    @FieldNameConstants.Include TOPIC_SEND_MESSAGE,
    @FieldNameConstants.Include TOPIC_RESEND_MESSAGE,

    //broker
    @FieldNameConstants.Include BROKERS_LIST,
    @FieldNameConstants.Include BROKER_DETAILS,

    //consumer groups
    @FieldNameConstants.Include CONSUMER_GROUP_LIST,
    @FieldNameConstants.Include CONSUMER_GROUP_DELETE,
    @FieldNameConstants.Include CONSUMER_GROUP_DETAILS,

    //track
    @FieldNameConstants.Include TRACK_LIST,

    //schemas
    @FieldNameConstants.Include SCHEMA_LIST,
    @FieldNameConstants.Include SCHEMA_DETAILS,
    @FieldNameConstants.Include SCHEMA_CREATE,
    @FieldNameConstants.Include SCHEMA_UPDATE,
    @FieldNameConstants.Include SCHEMA_DELETE,

    //clusters
    @FieldNameConstants.Include CLUSTER_LIST,
    @FieldNameConstants.Include CLUSTER_CREATE,
    @FieldNameConstants.Include CLUSTER_UPDATE,
    @FieldNameConstants.Include CLUSTER_DETAILS,
    @FieldNameConstants.Include CLUSTER_DELETE,

    //admin
    @FieldNameConstants.Include LOGIN,
    @FieldNameConstants.Include USER_GROUPS,
    @FieldNameConstants.Include USER_GROUPS_LIST,
    @FieldNameConstants.Include USER_GROUP_CREATE,
    @FieldNameConstants.Include USER_GROUP_UPDATE,
    @FieldNameConstants.Include USER_GROUP_DELETE,

    //data masking
    @FieldNameConstants.Include POLICY_LIST,
    @FieldNameConstants.Include POLICY_CREATE,
    @FieldNameConstants.Include POLICY_DETAILS,
    @FieldNameConstants.Include POLICY_UPDATE,
    @FieldNameConstants.Include POLICY_DELETE

}
