package com.consdata.kouncil.config.security;

import com.consdata.kouncil.model.admin.Function;
import com.consdata.kouncil.model.admin.FunctionName;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.KouncilRole;
import com.consdata.kouncil.security.function.FunctionsRepository;
import com.consdata.kouncil.security.group.GroupRepository;
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
public final class FunctionsGroupsConfigReader {

    @Value("${kouncil.authorization.role-admin:}")
    private String adminRoles;
    @Value("${kouncil.authorization.role-editor:}")
    private String editorRoles;
    @Value("${kouncil.authorization.role-viewer:}")
    private String viewerRoles;
    private static final String VALUES_SEPARATOR = ";";

    private final FunctionsRepository functionsRepository;
    private final GroupRepository groupRepository;

    @PostConstruct
    public void init() {
        Map<KouncilRole, Set<String>> roleMapping = new EnumMap<>(KouncilRole.class);
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_ADMIN, new HashSet<>(Arrays.asList(adminRoles.split(VALUES_SEPARATOR))));
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_EDITOR, new HashSet<>(Arrays.asList(editorRoles.split(VALUES_SEPARATOR))));
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_VIEWER, new HashSet<>(Arrays.asList(viewerRoles.split(VALUES_SEPARATOR))));

        List<FunctionName> adminFunctions = List.of(FunctionName.BROKERS_LIST, FunctionName.BROKER_DETAILS,
                FunctionName.CONSUMER_GROUP_LIST, FunctionName.CONSUMER_GROUP_DETAILS, FunctionName.CONSUMER_GROUP_DELETE,
                FunctionName.LOGIN);

        List<FunctionName> editorFunctions = List.of(
                FunctionName.TOPIC_LIST, FunctionName.TOPIC_CREATE, FunctionName.TOPIC_UPDATE, FunctionName.TOPIC_DELETE, FunctionName.TOPIC_MESSAGES,
                FunctionName.TOPIC_RESEND_MESSAGE, FunctionName.TOPIC_SEND_MESSAGE,
                FunctionName.TRACK_LIST,
                FunctionName.SCHEMA_LIST, FunctionName.SCHEMA_CREATE, FunctionName.SCHEMA_UPDATE, FunctionName.SCHEMA_DELETE, FunctionName.SCHEMA_DETAILS,
                FunctionName.LOGIN);

        List<FunctionName> viewerFunctions = List.of(
                FunctionName.TOPIC_LIST, FunctionName.TOPIC_MESSAGES,
                FunctionName.TRACK_LIST,
                FunctionName.SCHEMA_LIST, FunctionName.SCHEMA_DETAILS,
                FunctionName.LOGIN);

        List<UserGroup> groups = new ArrayList<>();

        List<String> foundGroupNames = StreamSupport.stream(groupRepository.findAll().spliterator(), false).map(UserGroup::getName).toList();

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

        groupRepository.saveAll(groups);

        Map<String, UserGroup> groupMap = new HashMap<>();
        groups.forEach(savedGroup -> groupMap.put(savedGroup.getName(), savedGroup));

        List<Function> functions = StreamSupport.stream(functionsRepository.findAll().spliterator(), false).toList();

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

        functionsRepository.saveAll(functions);
    }

    private void addGroupToFunction(Function function, Set<String> roles, Map<String, UserGroup> groupMap) {
        roles.forEach(groupFromConfig -> {
            if (groupMap.get(groupFromConfig) != null) {
                function.getUserGroups().add(groupMap.get(groupFromConfig));
            }
        });
    }
}
