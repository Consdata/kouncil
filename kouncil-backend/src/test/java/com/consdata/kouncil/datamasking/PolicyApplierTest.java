package com.consdata.kouncil.datamasking;

import static org.assertj.core.api.Assertions.assertThat;

import com.consdata.kouncil.model.datamasking.MaskingType;
import com.consdata.kouncil.model.datamasking.Policy;
import com.consdata.kouncil.model.datamasking.PolicyField;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.StringReader;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Objects;
import org.junit.jupiter.api.Test;

class PolicyApplierTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void shouldApplyPoliciesToSimpleMessage() throws URISyntaxException, IOException {
        String message = loadFile("data-masking/input/simple_object_test.json");

        Policy policy = new Policy();
        policy.setFields(new HashSet<>());
        policy.getFields().add(createField(MaskingType.LAST_5, "firstName"));
        policy.getFields().add(createField(MaskingType.FIRST_5, "lastName"));
        String apply = PolicyApplier.apply(policy, message);


        String result = objectMapper.readTree(new StringReader(loadFile("data-masking/output/simple_object_test_result.json"))).toString();
        assertThat(apply).isEqualTo(result);
    }

    @Test
    void shouldApplyPoliciesToComplexMessage() throws URISyntaxException, IOException {
        String message = loadFile("data-masking/input/complex_object_test.json");

        Policy policy = new Policy();
        policy.setFields(new HashSet<>());
        policy.getFields().add(createField(MaskingType.LAST_5, "firstName"));
        policy.getFields().add(createField(MaskingType.FIRST_5, "lastName"));
        policy.getFields().add(createField(MaskingType.ALL, "address.street"));
        policy.getFields().add(createField(MaskingType.FIRST_5, "longestTravels"));
        String apply = PolicyApplier.apply(policy, message);


        String result = objectMapper.readTree(new StringReader(loadFile("data-masking/output/complex_object_test_result.json"))).toString();
        assertThat(apply).isEqualTo(result);
    }

    @Test
    void shouldApplyPoliciesToMessageWithArrays() throws URISyntaxException, IOException {
        String message = loadFile("data-masking/input/object_with_arrays_test.json");

        Policy policy = new Policy();
        policy.setFields(new HashSet<>());
        policy.getFields().add(createField(MaskingType.ALL, "firstName"));
        policy.getFields().add(createField(MaskingType.FIRST_5, "lastName"));
        policy.getFields().add(createField(MaskingType.FIRST_5, "salary"));
        policy.getFields().add(createField(MaskingType.FIRST_5, "address.street"));
        policy.getFields().add(createField(MaskingType.LAST_5, "address.street"));
        policy.getFields().add(createField(MaskingType.LAST_5, "address.postalCodes"));
        policy.getFields().add(createField(MaskingType.ALL, "hobbies"));
        String apply = PolicyApplier.apply(policy, message);

        String result = objectMapper.readTree(new StringReader(loadFile("data-masking/output/object_with_arrays_test_result.json"))).toString();
        assertThat(apply).isEqualTo(result);
    }

    private String loadFile(String filePath) throws URISyntaxException, IOException {
        return Files.readString(Paths.get(Objects.requireNonNull(PolicyApplierTest.class.getClassLoader().getResource(filePath)).toURI()));
    }

    private PolicyField createField(MaskingType maskingType, String field) {
        PolicyField policyField = new PolicyField();
        policyField.setMaskingType(maskingType);
        policyField.setField(field);
        return policyField;
    }
}
