package com.consdata.kouncil.config.security.sso;

import com.consdata.kouncil.config.security.sso.github.GithubGraphQLService;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final GithubGraphQLService githubGraphQLService;
    private static final String GITHUB_SSO_TYPE = "github";
    private static final String LOGIN_ATTRIBUTE = "login";

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        if (GITHUB_SSO_TYPE.equals(registrationId)) {
            String username = (String) oAuth2User.getAttributes().get(LOGIN_ATTRIBUTE);
            String accessToken = userRequest.getAccessToken().getTokenValue();

            Set<String> userTeams = githubGraphQLService.fetchTeamsForUser(username, accessToken);

            List<GrantedAuthority> newAuthorities = new ArrayList<>(oAuth2User.getAuthorities());
            userTeams.forEach(userTeam -> newAuthorities.add(new SimpleGrantedAuthority(userTeam)));

            oAuth2User = new DefaultOAuth2User(newAuthorities, oAuth2User.getAttributes(), LOGIN_ATTRIBUTE);
        }
        return oAuth2User;
    }
}
