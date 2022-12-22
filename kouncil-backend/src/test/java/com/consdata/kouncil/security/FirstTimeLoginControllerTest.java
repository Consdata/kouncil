package com.consdata.kouncil.security;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.consdata.kouncil.config.WebSecurityConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(value = AuthController.class)
@ContextConfiguration(classes = {FirstTimeLoginController.class, WebSecurityConfig.class, DefaultUserManagerImpl.class, InMemoryUserManager.class})
class FirstTimeLoginControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void should_check_if_user_is_login_first_time() throws Exception {
        mockMvc.perform(get("/api/firstTimeLogin"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("false")));
    }
}
