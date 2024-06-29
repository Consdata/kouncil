package com.consdata.kouncil.model.admin;

import lombok.experimental.FieldNameConstants;

@FieldNameConstants(onlyExplicitlyIncluded = true)
public enum FunctionName {

    //topic
    @FieldNameConstants.Include TOPIC_LIST,
    @FieldNameConstants.Include TOPIC_CREATE,
    @FieldNameConstants.Include TOPIC_UPDATE,
    @FieldNameConstants.Include TOPIC_DETAILS,
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

    //login
    @FieldNameConstants.Include LOGIN
}
