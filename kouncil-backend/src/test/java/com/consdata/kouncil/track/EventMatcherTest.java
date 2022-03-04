package com.consdata.kouncil.track;

import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.assertj.core.util.Arrays;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class EventMatcherTest {

    private final EventMatcher eventMatcher = new EventMatcher();

    @Test
    void should_match_with_IS() {
        // given
        Headers headers = prepareHeaders("header", "test");
        String searchValue = "value";

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "test", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "Test", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "atest", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "testerka", headers, searchValue)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "value", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "Value", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "avalue", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "valuerka", headers, searchValue)).isFalse();
    }

    @Test
    void should_match_with_NOT_IS() {
        // given
        Headers headers = prepareHeaders("header", "test");
        String searchValue = "value";

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "test", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "Test", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "atest", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "testerka", headers, searchValue)).isTrue();

        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "value", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "Value", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "avalue", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "valuerka", headers, searchValue)).isTrue();
    }

    @Test
    void should_match_with_LIKE() {
        // given
        Headers headers = prepareHeaders("header", "test");
        String searchValue = "value";

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "test", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "Test", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "est", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "tes", headers, searchValue)).isTrue();

        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "value", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "Value", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "lue", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "val", headers, searchValue)).isTrue();
    }

    @Test
    void should_match_with_NOT_LIKE() {
        // given
        Headers headers = prepareHeaders("header", "test");
        String searchValue = "value";

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "test", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "Test", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "est", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "tes", headers, searchValue)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "value", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "Value", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "lue", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "val", headers, searchValue)).isFalse();
    }

    @Test
    void should_match_with_REGEX() {
        // given
        Headers headers = prepareHeaders("header", "test");
        String searchValue = "value";

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.REGEX, ".*", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.REGEX, ".*e.*", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.REGEX, ".*u", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.REGEX, "u.*", headers, searchValue)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.REGEX, ".*", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.REGEX, ".*u.*", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.REGEX, ".*u", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.REGEX, "u.*", headers, searchValue)).isFalse();
    }

    @Test
    void should_handle_empty_filter_value() {
        // given
        Headers headers = prepareHeaders("header", "test");
        String searchValue = "value";

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.REGEX, "", headers, searchValue)).isFalse();

        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.REGEX, "", headers, searchValue)).isFalse();
    }

    @Test
    void should_handle_empty_header_or_record_value() {
        // given
        Headers headers = prepareHeaders("header", "");
        String searchValue = "";
        
        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.REGEX, "", headers, searchValue)).isTrue();

        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.REGEX, "", headers, searchValue)).isTrue();
    }

    @Test
    void should_handle_null_header_or_record_value() {
        // given
        Headers headers = prepareHeaders("header", null);
        String searchValue = null;

        // when & then
        assertThat(eventMatcher.filterMatch("header", TrackOperator.IS, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_IS, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.LIKE, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.NOT_LIKE, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("header", TrackOperator.REGEX, "", headers, searchValue)).isTrue();

        assertThat(eventMatcher.filterMatch("", TrackOperator.IS, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_IS, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.LIKE, "", headers, searchValue)).isTrue();
        assertThat(eventMatcher.filterMatch("", TrackOperator.NOT_LIKE, "", headers, searchValue)).isFalse();
        assertThat(eventMatcher.filterMatch("", TrackOperator.REGEX, "", headers, searchValue)).isTrue();
    }

    private Headers prepareHeaders(String headerKey, String headerValue) {
        return new RecordHeaders(Arrays.array(new RecordHeader(headerKey, headerValue != null ? headerValue.getBytes(StandardCharsets.UTF_8) : null)));
    }
}
