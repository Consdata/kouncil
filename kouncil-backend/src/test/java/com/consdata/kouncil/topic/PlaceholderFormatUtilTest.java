package com.consdata.kouncil.topic;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.consdata.kouncil.topic.util.FieldType;
import com.consdata.kouncil.topic.util.PlaceholderFormatUtil;
import java.time.LocalDate;
import java.time.Month;
import org.junit.jupiter.api.Test;

class PlaceholderFormatUtilTest {

    @Test
    void formatPlaceholder() {
        String stringToken = "\\{\\{placeholder(.*?)}}";
        String localeDateToken = "\\{\\{timestamp(.*?)}}";
        String data = "ID2022{{placeholder:04d}};DATE{{timestamp:YYYY}}";
        data = PlaceholderFormatUtil.formatPlaceholder(stringToken, data, FieldType.STRING, 3);
        data = PlaceholderFormatUtil.formatPlaceholder(localeDateToken, data, FieldType.DATE, LocalDate.of(2022, Month.APRIL, 8));
        assertEquals("ID20220003;DATE2022", data);
    }

    @Test
    void should_replace_placeholder() {
        String stringToken = "\\{\\{placeholder(.*?)}}";
        String data = "2022{{placeholder}}";
        data = PlaceholderFormatUtil.formatPlaceholder(stringToken, data, FieldType.STRING, 5);
        assertEquals("20225", data);
    }

    @Test
    void should_replace_placeholder_when_type_is_null() {
        String stringToken = "\\{\\{placeholder(.*?)}}";
        String data = "2022{{placeholder}}";
        data = PlaceholderFormatUtil.formatPlaceholder(stringToken, data, null, 5);
        assertEquals("20225", data);
    }
}
