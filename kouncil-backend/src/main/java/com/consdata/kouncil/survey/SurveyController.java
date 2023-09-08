package com.consdata.kouncil.survey;

import static com.consdata.kouncil.config.security.RoleNames.ADMIN_ROLE;
import static com.consdata.kouncil.config.security.RoleNames.EDITOR_ROLE;
import static com.consdata.kouncil.config.security.RoleNames.VIEWER_ROLE;

import javax.annotation.security.RolesAllowed;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class SurveyController {

    @Value("${kouncil.survey.base-path:}")
    private String surveyBasePath;

    @RolesAllowed({ADMIN_ROLE, EDITOR_ROLE, VIEWER_ROLE})
    @GetMapping("/api/survey/config")
    public String getSurveyBasePath() {
        return surveyBasePath;
    }
}
