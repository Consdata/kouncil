package com.consdata.kouncil.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.consdata.kouncil.config.security.UserGroupsConfigReader;
import com.consdata.kouncil.config.security.inmemory.FirstTimeLoginController;
import com.consdata.kouncil.config.security.inmemory.InMemoryUserManager;
import com.consdata.kouncil.config.security.inmemory.InMemoryWebSecurityConfig;
import com.consdata.kouncil.security.function.SystemFunctionsRepository;
import com.consdata.kouncil.security.group.UserGroupRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(value = AuthController.class)
@ContextConfiguration(classes = {FirstTimeLoginController.class, InMemoryUserManager.class, InMemoryWebSecurityConfig.class, UserGroupsConfigReader.class})
class FirstTimeLoginControllerInMemoryTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private UserRolesMapping userRolesMapping;
    @MockBean
    private SystemFunctionsRepository systemFunctionsRepository;
    @MockBean
    private UserGroupRepository userGroupRepository;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void should_check_if_user_is_login_first_time() throws Exception {
        Path path = Paths.get("default_admin_password.txt");
        if (Files.exists(path)) {
            Files.delete(path);
        }

        mockMvc.perform(get("/api/firstTimeLogin/admin"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("true")));

        mockMvc.perform(get("/api/skipChangeDefaultPassword"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/firstTimeLogin/admin"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("false")));

        assertAll(
                () -> assertThat(Files.exists(path)).isTrue(),
                () -> assertThat(Files.readString(path).split(";")[0]).isEqualTo("admin"),
                () -> assertThat(Files.readString(path).split(";")[1]).isEqualTo("admin_group")
        );
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void should_change_users_default_password() throws Exception {
        Path path = Paths.get("default_admin_password.txt");
        if (Files.exists(path)) {
            Files.delete(path);
        }

        mockMvc.perform(post("/api/changeDefaultPassword").content("newpassword").with(csrf()))
                .andExpect(status().isOk());

        assertAll(
                () -> assertThat(Files.exists(path)).isTrue(),
                () -> assertThat(Files.readString(path).split(";")[0]).isEqualTo("newpassword"),
                () -> assertThat(Files.readString(path).split(";")[1]).isEqualTo("admin_group")
        );
    }
}
