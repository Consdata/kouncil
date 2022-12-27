package com.consdata.kouncil;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.valves.rewrite.RewriteValve;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class CustomTomcatConfiguration implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        final RewriteValve valve = new RewriteValve() {

            @Override
            protected synchronized void startInternal() throws LifecycleException {
                super.startInternal();
                try {
                    InputStream resource = new ClassPathResource("rewrite.config").getInputStream();

                    InputStreamReader resourceReader = new InputStreamReader(resource);
                    BufferedReader buffer = new BufferedReader(resourceReader);

                    parse(buffer);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        };
        valve.setEnabled(true);
        factory.addContextValves(valve);
    }
}
