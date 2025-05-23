package com.consdata.kouncil.survey;

import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import jakarta.annotation.security.RolesAllowed;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class SurveyController {

    @Value("${kouncil.survey.base-path:}")
    private String surveyBasePath;

    @RolesAllowed(SystemFunctionNameConstants.LOGIN)
    @GetMapping("/api/survey/config")
    public String getSurveyBasePath() {
        return surveyBasePath;
    }
}
