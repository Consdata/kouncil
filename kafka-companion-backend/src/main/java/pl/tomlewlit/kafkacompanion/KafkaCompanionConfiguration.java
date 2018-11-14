package pl.tomlewlit.kafkacompanion;

import javax.annotation.PostConstruct;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "")
@Slf4j
@Data
public class KafkaCompanionConfiguration {
	private String bootstrapServers;

	@PostConstruct
	public void log() {
		log.info(toString());
	}

}
