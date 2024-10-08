package com.consdata.kouncil.security;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.consdata.kouncil.config.security.UserGroupsConfigReader;
import com.consdata.kouncil.config.security.inmemory.InMemoryWebSecurityConfig;
import com.consdata.kouncil.security.function.SystemFunctionsRepository;
import com.consdata.kouncil.security.group.UserGroupRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(value = AuthController.class)
@ContextConfiguration(classes = {AuthController.class, InMemoryWebSecurityConfig.class, UserGroupsConfigReader.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private UserRolesMapping userRolesMapping;
    @MockBean
    private SystemFunctionsRepository systemFunctionsRepository;
    @MockBean
    private UserGroupRepository userGroupRepository;

    @Test
    void should_authenticate_user() throws Exception {
        mockMvc.perform(post("/api/login")
                        .content("{\"username\":\"admin\",\"password\":\"admin\"}")
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                )
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void should_logout_user() throws Exception {
        mockMvc.perform(get("/api/logout")).andExpect(status().isOk());
    }
}
