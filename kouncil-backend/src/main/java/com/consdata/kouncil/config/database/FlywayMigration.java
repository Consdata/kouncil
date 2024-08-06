package com.consdata.kouncil.config.database;

import lombok.RequiredArgsConstructor;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class FlywayMigration {

    @Value("${spring.jpa.hibernate.default_schema:#{null}}")
    private String defaultSchema;

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            flyway = Flyway.configure()
                    .configuration(flyway.getConfiguration())
                    .baselineOnMigrate(true)
                    .defaultSchema(defaultSchema)
                    .load();

            flyway.migrate();
        };
    }
}
