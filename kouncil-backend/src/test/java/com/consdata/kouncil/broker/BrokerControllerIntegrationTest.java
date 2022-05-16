package com.consdata.kouncil.broker;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BrokerControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @Disabled
    public void shouldReturnDefaultMessage() throws Exception {
        this.mockMvc.perform(get("/api/brokers?serverId=1"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("brokers")));
    }
}
