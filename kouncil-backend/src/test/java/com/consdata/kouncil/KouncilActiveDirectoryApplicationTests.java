package com.consdata.kouncil;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-ad.yaml")
class KouncilActiveDirectoryApplicationTests {

    @Autowired
    private InfoController controller;

    @Test
    void contextLoads() {
        assertThat(controller).isNotNull();
    }

}
