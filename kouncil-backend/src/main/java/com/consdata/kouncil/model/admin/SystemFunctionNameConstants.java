package com.consdata.kouncil.model.admin;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class SystemFunctionNameConstants {

    //topic
    public static final String TOPIC_LIST = "TOPIC_LIST";
    public static final String TOPIC_CREATE = "TOPIC_CREATE";
    public static final String TOPIC_UPDATE = "TOPIC_UPDATE";
    public static final String TOPIC_DELETE = "TOPIC_DELETE";
    public static final String TOPIC_MESSAGES = "TOPIC_MESSAGES";
    public static final String TOPIC_SEND_MESSAGE = "TOPIC_SEND_MESSAGE";
    public static final String TOPIC_RESEND_MESSAGE = "TOPIC_RESEND_MESSAGE";

    //broker
    public static final String BROKERS_LIST = "BROKERS_LIST";
    public static final String BROKER_DETAILS = "BROKER_DETAILS";

    //consumer groups
    public static final String CONSUMER_GROUP_LIST = "CONSUMER_GROUP_LIST";
    public static final String CONSUMER_GROUP_DELETE = "CONSUMER_GROUP_DELETE";
    public static final String CONSUMER_GROUP_DETAILS = "CONSUMER_GROUP_DETAILS";

    //track
    public static final String TRACK_LIST = "TRACK_LIST";

    //schemas
    public static final String SCHEMA_LIST = "SCHEMA_LIST";
    public static final String SCHEMA_DETAILS = "SCHEMA_DETAILS";
    public static final String SCHEMA_CREATE = "SCHEMA_CREATE";
    public static final String SCHEMA_UPDATE = "SCHEMA_UPDATE";
    public static final String SCHEMA_DELETE = "SCHEMA_DELETE";

    //clusters
    public static final String CLUSTER_LIST = "CLUSTER_LIST";
    public static final String CLUSTER_CREATE = "CLUSTER_CREATE";
    public static final String CLUSTER_UPDATE = "CLUSTER_UPDATE";
    public static final String CLUSTER_DETAILS = "CLUSTER_DETAILS";
    public static final String CLUSTER_DELETE = "CLUSTER_DELETE";

    //admin
    public static final String LOGIN = "LOGIN";
    public static final String USER_GROUPS = "USER_GROUPS";
    public static final String USER_GROUPS_LIST = "USER_GROUPS_LIST";
    public static final String USER_GROUP_CREATE = "USER_GROUP_CREATE";
    public static final String USER_GROUP_UPDATE = "USER_GROUP_UPDATE";
    public static final String USER_GROUP_DELETE = "USER_GROUP_DELETE";
}
