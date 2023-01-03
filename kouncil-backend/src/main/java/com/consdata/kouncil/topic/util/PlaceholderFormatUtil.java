package com.consdata.kouncil.topic.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PlaceholderFormatUtil {

    public static String formatPlaceholder(String regex, String input, FieldType fieldType, Object value) {
        String replacement = value.toString();
        if (fieldType != null) {
            Pattern compiledPattern = Pattern.compile(regex);
            Matcher matcher = compiledPattern.matcher(input);
            if (matcher.find()) {
                String placeholder = matcher.group();
                placeholder = placeholder.replace("\\{", "").replace("}", "");
                String[] tokenPattern = placeholder.split(":");
                if (tokenPattern.length > 1) {
                    String pattern = tokenPattern[1];
                    if (fieldType == FieldType.STRING) {
                        replacement = String.format(String.format("%%%s", pattern), value);
                    } else if (fieldType == FieldType.DATE) {
                        replacement = ((LocalDate) value).format(DateTimeFormatter.ofPattern(pattern));
                    }
                }
            }
        }
        return replacePlaceholder(regex, input, replacement);
    }

    private static String replacePlaceholder(String regex, String input, String replacement) {
        return Pattern.compile(regex).matcher(input).replaceFirst(replacement);
    }
}
