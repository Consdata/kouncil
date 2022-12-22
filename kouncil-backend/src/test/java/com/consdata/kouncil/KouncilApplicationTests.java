package com.consdata.kouncil;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
class KouncilApplicationTests {

    @Autowired
    private InfoController controller;

    @Test
    void contextLoads() {
        assertThat(controller).isNotNull();
    }

}
