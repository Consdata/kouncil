package com.consdata.kouncil;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;

@SpringBootApplication(exclude = {LdapAutoConfiguration.class})
public class KouncilApplication {

    public static void main(String[] args) {
        SpringApplication.run(KouncilApplication.class, args);
    }
}
