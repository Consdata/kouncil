package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.model.datamasking.MaskingType;
import com.consdata.kouncil.model.datamasking.Policy;
import com.consdata.kouncil.model.datamasking.PolicyField;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.io.StringReader;
import java.util.Arrays;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class PolicyApplier {

    private static final int MASKING_SIGNS_AMOUNT = 5;
    private static final String MASKING_SIGN = "*";
    private static final String FIELD_SEPARATOR = "\\.";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    static {
        OBJECT_MAPPER.configure(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS, true);
    }

    public static String apply(Policy policy, String value) {
        try {
            JsonNode jsonNode = OBJECT_MAPPER.readTree(new StringReader(value));
            for (PolicyField field : policy.getFields()) {
                String[] split = field.getField().split(FIELD_SEPARATOR);
                traversFieldPathAndUpdateValue(field, jsonNode, split, 0);
            }
            return jsonNode.toString();
        } catch (IOException e) {
            throw new DataMaskingExcpetion(e);
        }
    }

    private static void traversFieldPathAndUpdateValue(PolicyField policyField, JsonNode jsonNode, String[] path, int index) {
        String fieldNameFromPath = path[0];
        jsonNode.fieldNames().forEachRemaining(jsonChildFieldName -> processField(policyField, fieldNameFromPath, jsonChildFieldName, jsonNode, path, index));
    }

    private static void processField(PolicyField policyField, String fieldNameFromPath, String jsonChildFieldName, JsonNode jsonNode, String[] path,
            int index) {
        if (fieldNameFromPath.equals(jsonChildFieldName)) {
            JsonNode childNode = jsonNode.get(fieldNameFromPath);
            if (childNode.isObject()) {
                processObjectNode(policyField, childNode, Arrays.copyOfRange(path, index + 1, path.length), index);
            } else {
                processValueNode(childNode, policyField, index, path, jsonNode, fieldNameFromPath);
            }
        }
    }

    private static void processObjectNode(PolicyField policyField, JsonNode childNode, String[] path, int index) {
        traversFieldPathAndUpdateValue(policyField, childNode, path, index);
    }

    private static void processValueNode(JsonNode childNode, PolicyField policyField, int index, String[] path, JsonNode jsonNode, String fieldNameFromPath) {
        if (childNode.isArray()) {
            for (int i = 0; i < childNode.size(); i++) {
                if (childNode.get(i).isValueNode()) {
                    ((ArrayNode) childNode).set(i, maskFieldValue(policyField.getMaskingType(), childNode.get(i).asText()));
                } else {
                    processObjectNode(policyField, childNode.get(i), Arrays.copyOfRange(path, index + 1, path.length), index);
                }
            }
        } else {
            ((ObjectNode) jsonNode).put(fieldNameFromPath, maskFieldValue(policyField.getMaskingType(), childNode.asText()));
        }
    }

    private static String maskFieldValue(MaskingType policyMaskingType, String fieldValue) {
        String newFieldValue = fieldValue;
        if (fieldValue.length() < MASKING_SIGNS_AMOUNT || MaskingType.ALL.equals(policyMaskingType)) {
            newFieldValue = MASKING_SIGN.repeat(fieldValue.length());
        } else if (MaskingType.FIRST_5.equals(policyMaskingType)) {
            newFieldValue = MASKING_SIGN.repeat(MASKING_SIGNS_AMOUNT) + fieldValue.substring(MASKING_SIGNS_AMOUNT);
        } else if (MaskingType.LAST_5.equals(policyMaskingType)) {
            newFieldValue = fieldValue.substring(0, fieldValue.length() - MASKING_SIGNS_AMOUNT) + MASKING_SIGN.repeat(MASKING_SIGNS_AMOUNT);
        }
        return newFieldValue;
    }
}
