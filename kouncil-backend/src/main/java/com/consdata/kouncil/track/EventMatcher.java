package com.consdata.kouncil.track;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.logging.log4j.util.Strings;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EventMatcher {

    public boolean filterMatch(String field, TrackOperator operator, String filterValue, ConsumerRecord<String, String> consumerRecord) {
        if (Strings.isNotBlank(field)) {
            return headerMatch(field, operator, filterValue, consumerRecord.headers());
        } else {
            return plainValueMatch(operator, filterValue, consumerRecord.value());
        }
    }

    private boolean headerMatch(String field, TrackOperator operator, String filterValue, Headers headers) {
        for (Header header : headers) {
            if (field.equals(header.key())) {
                return plainValueMatch(operator, filterValue, new String(header.value()));
            }
        }
        return false;
    }

    private boolean plainValueMatch(TrackOperator operator, String filterValue, String headerValue) {
        switch (operator) {
            case LIKE:
                return headerValue.contains(filterValue);
            case NOT_LIKE:
                return !headerValue.contains(filterValue);
            case IS:
                return headerValue.compareTo(filterValue) == 0;
            case NOT_IS:
                return headerValue.compareTo(filterValue) != 0;
        }
        return false;
    }
}
