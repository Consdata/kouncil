package com.consdata.kouncil.config.security.inmemory;

import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_DEFAULT_GROUP;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.EDITOR_DEFAULT_GROUP;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.VIEWER_DEFAULT_GROUP;

import com.consdata.kouncil.model.admin.SystemFunction;
import com.consdata.kouncil.model.admin.SystemFunctionName;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.function.SystemFunctionsRepository;
import com.consdata.kouncil.security.group.UserGroupRepository;
import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
public class InMemoryBaseDataLoader {

    private final SystemFunctionsRepository systemFunctionsRepository;
    private final UserGroupRepository userGroupRepository;
    private final InMemoryUserManager inMemoryUserManager;

    private static final List<SystemFunctionName> ADMIN_FUNCTIONS = List.of(SystemFunctionName.BROKERS_LIST, SystemFunctionName.BROKER_DETAILS,
            SystemFunctionName.CONSUMER_GROUP_LIST, SystemFunctionName.CONSUMER_GROUP_DETAILS, SystemFunctionName.CONSUMER_GROUP_DELETE,
            SystemFunctionName.LOGIN,
            SystemFunctionName.USER_GROUPS, SystemFunctionName.USER_GROUPS_LIST, SystemFunctionName.USER_GROUP_CREATE, SystemFunctionName.USER_GROUP_UPDATE,
            SystemFunctionName.USER_GROUP_DELETE,
            SystemFunctionName.CLUSTER_LIST, SystemFunctionName.CLUSTER_CREATE, SystemFunctionName.CLUSTER_UPDATE, SystemFunctionName.CLUSTER_DETAILS,
            SystemFunctionName.CLUSTER_DELETE);

    private static final List<SystemFunctionName> EDITOR_FUNCTIONS = List.of(
            SystemFunctionName.TOPIC_LIST, SystemFunctionName.TOPIC_CREATE, SystemFunctionName.TOPIC_UPDATE, SystemFunctionName.TOPIC_DELETE,
            SystemFunctionName.TOPIC_MESSAGES,
            SystemFunctionName.TOPIC_RESEND_MESSAGE, SystemFunctionName.TOPIC_SEND_MESSAGE,
            SystemFunctionName.TRACK_LIST,
            SystemFunctionName.SCHEMA_LIST, SystemFunctionName.SCHEMA_CREATE, SystemFunctionName.SCHEMA_UPDATE, SystemFunctionName.SCHEMA_DELETE,
            SystemFunctionName.SCHEMA_DETAILS,
            SystemFunctionName.LOGIN,
            SystemFunctionName.CLUSTER_LIST, SystemFunctionName.CLUSTER_CREATE, SystemFunctionName.CLUSTER_UPDATE, SystemFunctionName.CLUSTER_DETAILS,
            SystemFunctionName.CLUSTER_DELETE);

    private static final List<SystemFunctionName> VIEWER_FUNCTIONS = List.of(
            SystemFunctionName.TOPIC_LIST, SystemFunctionName.TOPIC_MESSAGES,
            SystemFunctionName.TRACK_LIST,
            SystemFunctionName.SCHEMA_LIST, SystemFunctionName.SCHEMA_DETAILS,
            SystemFunctionName.LOGIN,
            SystemFunctionName.CLUSTER_LIST, SystemFunctionName.CLUSTER_DETAILS);

    @PostConstruct
    public void init() {
        List<UserGroup> userGroups = StreamSupport.stream(userGroupRepository.findAll().spliterator(), false).toList();

        if (userGroups.isEmpty()) {
            Set<String> roleMapping = Set.of(ADMIN_DEFAULT_GROUP, EDITOR_DEFAULT_GROUP, VIEWER_DEFAULT_GROUP);

            List<UserGroup> groups = new ArrayList<>();
            roleMapping.stream().filter(groupCode -> !groupCode.isEmpty())
                    .forEach(groupCode -> {
                        UserGroup group = new UserGroup();
                        group.setCode(groupCode);
                        group.setName(groupCode.replace("_", " "));
                        group.setFunctions(new HashSet<>());
                        groups.add(group);
                    });

            userGroupRepository.saveAll(groups);

            Map<String, UserGroup> groupMap = new HashMap<>();
            groups.forEach(savedGroup -> groupMap.put(savedGroup.getCode(), savedGroup));

            List<SystemFunction> functions = StreamSupport.stream(systemFunctionsRepository.findAll().spliterator(), false).toList();

            functions.forEach(function -> {
                if (ADMIN_FUNCTIONS.contains(function.getName())) {
                    addFunctionToUserGroup(function, ADMIN_DEFAULT_GROUP, groupMap);
                }
                if (EDITOR_FUNCTIONS.contains(function.getName())) {
                    addFunctionToUserGroup(function, EDITOR_DEFAULT_GROUP, groupMap);
                }
                if (VIEWER_FUNCTIONS.contains(function.getName())) {
                    addFunctionToUserGroup(function, VIEWER_DEFAULT_GROUP, groupMap);
                }
            });

            userGroupRepository.saveAll(groups);
        }

        inMemoryUserManager.createDefaultUsers();
    }

    private void addFunctionToUserGroup(SystemFunction function, String role, Map<String, UserGroup> groupMap) {
        if (groupMap.get(role) != null) {
            groupMap.get(role).getFunctions().add(function);
        }
    }
}
