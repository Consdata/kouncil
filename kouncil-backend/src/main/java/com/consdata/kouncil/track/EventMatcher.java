package com.consdata.kouncil.track;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.utils.Bytes;
import org.apache.logging.log4j.util.Strings;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EventMatcher {

    public boolean filterMatch(String field,
                               TrackOperator operator,
                               String filterValue,
                               Headers headers,
                               String searchingForValue) {
        if (Strings.isNotBlank(field)) {
            return headerMatch(field, operator, filterValue, headers);
        } else {
            return plainValueMatch(operator, filterValue, searchingForValue != null ? searchingForValue : "");
        }
    }

    private boolean headerMatch(String field, TrackOperator operator, String filterValue, Headers headers) {
        for (Header header : headers) {
            if (field.equals(header.key())) {
                return plainValueMatch(operator, filterValue, header.value() != null ? new String(header.value()) : "");
            }
        }
        return false;
    }

    private boolean plainValueMatch(TrackOperator operator, String filterValue, String searchingForValue) {
        switch (operator) {
            case LIKE:
                return searchingForValue.contains(filterValue);
            case NOT_LIKE:
                return !searchingForValue.contains(filterValue);
            case IS:
                return searchingForValue.compareTo(filterValue) == 0;
            case NOT_IS:
                return searchingForValue.compareTo(filterValue) != 0;
            case REGEX:
                return searchingForValue.matches(filterValue);
        }
        return false;
    }
}
