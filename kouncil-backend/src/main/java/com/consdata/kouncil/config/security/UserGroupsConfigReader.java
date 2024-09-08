package com.consdata.kouncil.config.security;

import com.consdata.kouncil.model.admin.SystemFunction;
import com.consdata.kouncil.model.admin.SystemFunctionName;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.KouncilRole;
import com.consdata.kouncil.security.function.SystemFunctionsRepository;
import com.consdata.kouncil.security.group.UserGroupRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * @deprecated will be removed in version 1.10.
 */
@Deprecated(since = "version 1.10")
@Component
@Data
@RequiredArgsConstructor
@Slf4j
public final class UserGroupsConfigReader {

    @Value("${kouncil.authorization.role-admin:}")
    private String adminRoles;
    @Value("${kouncil.authorization.role-editor:}")
    private String editorRoles;
    @Value("${kouncil.authorization.role-viewer:}")
    private String viewerRoles;
    private static final String VALUES_SEPARATOR = ";";

    private final SystemFunctionsRepository systemFunctionsRepository;
    private final UserGroupRepository userGroupRepository;

    @PostConstruct
    public void init() {
        Map<KouncilRole, Set<String>> roleMapping = new EnumMap<>(KouncilRole.class);
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_ADMIN, new HashSet<>(Arrays.asList(adminRoles.split(VALUES_SEPARATOR))));
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_EDITOR, new HashSet<>(Arrays.asList(editorRoles.split(VALUES_SEPARATOR))));
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_VIEWER, new HashSet<>(Arrays.asList(viewerRoles.split(VALUES_SEPARATOR))));

        List<SystemFunctionName> adminFunctions = List.of(SystemFunctionName.BROKERS_LIST, SystemFunctionName.BROKER_DETAILS,
                SystemFunctionName.CONSUMER_GROUP_LIST, SystemFunctionName.CONSUMER_GROUP_DETAILS, SystemFunctionName.CONSUMER_GROUP_DELETE,
                SystemFunctionName.LOGIN);

        List<SystemFunctionName> editorFunctions = List.of(
                SystemFunctionName.TOPIC_LIST, SystemFunctionName.TOPIC_CREATE, SystemFunctionName.TOPIC_UPDATE, SystemFunctionName.TOPIC_DELETE, SystemFunctionName.TOPIC_MESSAGES,
                SystemFunctionName.TOPIC_RESEND_MESSAGE, SystemFunctionName.TOPIC_SEND_MESSAGE,
                SystemFunctionName.TRACK_LIST,
                SystemFunctionName.SCHEMA_LIST, SystemFunctionName.SCHEMA_CREATE, SystemFunctionName.SCHEMA_UPDATE, SystemFunctionName.SCHEMA_DELETE, SystemFunctionName.SCHEMA_DETAILS,
                SystemFunctionName.LOGIN);

        List<SystemFunctionName> viewerFunctions = List.of(
                SystemFunctionName.TOPIC_LIST, SystemFunctionName.TOPIC_MESSAGES,
                SystemFunctionName.TRACK_LIST,
                SystemFunctionName.SCHEMA_LIST, SystemFunctionName.SCHEMA_DETAILS,
                SystemFunctionName.LOGIN);

        List<UserGroup> groups = new ArrayList<>();

        List<String> foundGroupNames = StreamSupport.stream(userGroupRepository.findAll().spliterator(), false).map(UserGroup::getName).toList();

        roleMapping.values()
                .stream()
                .flatMap(Set::stream)
                .collect(Collectors.toSet())
                .stream().filter(groupName -> !foundGroupNames.contains(groupName))
                .forEach(groupName -> {
                    UserGroup group = new UserGroup();
                    group.setName(groupName);
                    groups.add(group);
                });

        userGroupRepository.saveAll(groups);

        Map<String, UserGroup> groupMap = new HashMap<>();
        groups.forEach(savedGroup -> groupMap.put(savedGroup.getName(), savedGroup));

        List<SystemFunction> functions = StreamSupport.stream(systemFunctionsRepository.findAll().spliterator(), false).toList();

        functions.forEach(function -> {

            if (function.getUserGroups() == null) {
                function.setUserGroups(new HashSet<>());
            }
            if (adminFunctions.contains(function.getName())) {
                addGroupToFunction(function, roleMapping.get(KouncilRole.ROLE_KOUNCIL_ADMIN), groupMap);
            }
            if (editorFunctions.contains(function.getName())) {
                addGroupToFunction(function, roleMapping.get(KouncilRole.ROLE_KOUNCIL_EDITOR), groupMap);
            }
            if (viewerFunctions.contains(function.getName())) {
                addGroupToFunction(function, roleMapping.get(KouncilRole.ROLE_KOUNCIL_VIEWER), groupMap);
            }
        });

        systemFunctionsRepository.saveAll(functions);
    }

    private void addGroupToFunction(SystemFunction function, Set<String> roles, Map<String, UserGroup> groupMap) {
        roles.forEach(groupFromConfig -> {
            if (groupMap.get(groupFromConfig) != null) {
                function.getUserGroups().add(groupMap.get(groupFromConfig));
            }
        });
    }
}
