package com.consdata.kouncil.model.admin;

public enum SystemFunctionName {

    //topic
    TOPIC_LIST,
    TOPIC_CREATE,
    TOPIC_UPDATE,
    TOPIC_DELETE,
    TOPIC_MESSAGES,
    TOPIC_SEND_MESSAGE,
    TOPIC_RESEND_MESSAGE,

    //broker
    BROKERS_LIST,
    BROKER_DETAILS,

    //consumer groups
    CONSUMER_GROUP_LIST,
    CONSUMER_GROUP_DELETE,
    CONSUMER_GROUP_DETAILS,

    //track
    TRACK_LIST,

    //schemas
    SCHEMA_LIST,
    SCHEMA_DETAILS,
    SCHEMA_CREATE,
    SCHEMA_UPDATE,
    SCHEMA_DELETE,

    //clusters
    CLUSTER_LIST,
    CLUSTER_CREATE,
    CLUSTER_UPDATE,
    CLUSTER_DETAILS,
    CLUSTER_DELETE,

    //admin
    LOGIN,
    USER_GROUPS,
    USER_GROUPS_LIST,
    USER_GROUP_CREATE,
    USER_GROUP_UPDATE,
    USER_GROUP_DELETE

}
