package com.consdata.kouncil;

import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_DEFAULT_GROUP;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.EDITOR_DEFAULT_GROUP;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.VIEWER_DEFAULT_GROUP;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;

import com.consdata.kouncil.security.group.UserGroupsService;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class KouncilInMemoryApplicationTests {

    @Autowired
    private InfoController controller;

    @Autowired
    private UserGroupsService userGroupsService;

    @Test
    void contextLoads() {
        assertThat(controller).isNotNull();
    }

    @Test
    void should_load_groups_and_permissions_on_startup() {
        List<UserGroupDto> userGroups = userGroupsService.getUserGroups();
        Map<String, UserGroupDto> userGroupsMap = userGroups.stream().collect(Collectors.toMap(UserGroupDto::getCode, userGroup -> userGroup));

        assertAll(
                () -> assertThat(userGroupsMap).hasSize(3),
                () -> assertThat(userGroupsMap.get(ADMIN_DEFAULT_GROUP).getFunctions()).hasSize(16),
                () -> assertThat(userGroupsMap.get(EDITOR_DEFAULT_GROUP).getFunctions()).hasSize(19),
                () -> assertThat(userGroupsMap.get(VIEWER_DEFAULT_GROUP).getFunctions()).hasSize(8)
        );
    }
}
