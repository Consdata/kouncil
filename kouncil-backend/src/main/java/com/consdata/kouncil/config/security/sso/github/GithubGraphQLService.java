package com.consdata.kouncil.config.security.sso.github;

import com.consdata.kouncil.config.security.sso.github.dto.GraphQLWrapper;
import com.consdata.kouncil.config.security.sso.github.dto.TeamNode;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GithubGraphQLService {

    private final RestClient restClient = RestClient.create("https://api.github.com/graphql");

    @Value("${spring.security.oauth2.client.registration.github.organizations:}")
    private List<String> organizations;

    public Set<String> fetchTeamsForUser(String githubLogin, String token) {
        GraphQLWrapper response = restClient.post()
                .headers(httpHeaders -> {
                    httpHeaders.setBearerAuth(token);
                    httpHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));
                })
                .body(getGraphqlQueryBody(githubLogin))
                .retrieve()
                .body(GraphQLWrapper.class);

        return response != null ? response.getData().getViewer()
                .getOrganizations()
                .getNodes().stream()
                .filter(org-> organizations.isEmpty() || organizations.contains(org.getLogin()))
                .flatMap(org -> org.getTeams().getNodes().stream())
                .map(TeamNode::getName)
                .collect(Collectors.toSet()) : Collections.emptySet();
    }

    @NotNull
    private static Map<String, String> getGraphqlQueryBody(String githubLogin) {
        String graphqlQuery = """
                    {
                      viewer {
                        organizations(first: 100) {
                          nodes {
                            login
                            teams(first: 50, userLogins: ["%s"]) {
                              nodes {
                                name
                                slug
                              }
                            }
                          }
                        }
                      }
                    }
                """.formatted(githubLogin);

        return Map.of("query", graphqlQuery);
    }
}
