package com.consdata.kouncil.security;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UserRolesMapping {

    private static final String KEY_VALUE_SEPARATOR = "=";
    private static final String VALUES_SEPARATOR = ";";

    @Value("${kouncil.role-mapping:#{null}}")
    private String roleMappingFilePath;

    private final Map<KouncilRole, Set<String>> roleMapping = new HashMap<>();

    @PostConstruct
    public void init() throws IOException {
        log.info("Load roles mapping file");
        List<String> lines = new ArrayList<>();
        if (roleMappingFilePath == null) {
            log.info("Role mapping is null - reading default one");
            InputStream resource = getClass().getClassLoader().getResourceAsStream("role_mapping.properties");
            try (InputStreamReader streamReader = new InputStreamReader(resource, StandardCharsets.UTF_8);
                    BufferedReader reader = new BufferedReader(streamReader)) {
                String line;
                lines = new ArrayList<>();
                while ((line = reader.readLine()) != null) {
                    lines.add(line);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            log.info("Role mapping file: {}", roleMappingFilePath);
            File file = new File(roleMappingFilePath);
            Path of = Paths.get(file.getPath());
            if (Files.exists(of)) {
                lines = Files.readAllLines(of);
            }
        }

        lines.forEach(line -> {
            String[] mapping = line.split(KEY_VALUE_SEPARATOR);
            roleMapping.put(KouncilRole.valueOf(mapping[0]), new HashSet<>(Arrays.asList(mapping[1].split(VALUES_SEPARATOR))));
        });

        log.info("Role mapping loaded: {}", roleMapping);
    }

    public Set<GrantedAuthority> mapToKouncilRoles(Set<String> userRoles) {
        Set<GrantedAuthority> collect = new HashSet<>();
        userRoles.forEach(userRole -> roleMapping.forEach((key, value) -> {
            if (value.contains(userRole)) {
                collect.add(new SimpleGrantedAuthority(key.name()));
            }
        }));
        log.info("User roles: {}", collect);
        return collect;
    }
}
