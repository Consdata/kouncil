package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.serde.SubjectType;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class TopicUtils {

    private static final String KEY_SCHEMA_SUFFIX = "-key";
    private static final String VALUE_SCHEMA_SUFFIX = "-value";

    public static String getSubjectSuffix(boolean isKey) {
        return isKey ? KEY_SCHEMA_SUFFIX : VALUE_SCHEMA_SUFFIX;
    }

    public static String getSubjectSuffix(SubjectType subjectType) {
        return SubjectType.KEY.equals(subjectType) ? KEY_SCHEMA_SUFFIX : VALUE_SCHEMA_SUFFIX;
    }

    public static String getTopicName(String subject) {
        return subject.replace(KEY_SCHEMA_SUFFIX, "").replace(VALUE_SCHEMA_SUFFIX, "");
    }

    public static SubjectType subjectType(String subject) {
        return subject.contains(KEY_SCHEMA_SUFFIX) ? SubjectType.KEY : SubjectType.VALUE;
    }
}
