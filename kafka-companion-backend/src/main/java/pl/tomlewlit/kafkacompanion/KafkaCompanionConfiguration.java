package pl.tomlewlit.kafkacompanion;

import javax.annotation.PostConstruct;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

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

	@Bean
	public CommonsRequestLoggingFilter logFilter() {
		CommonsRequestLoggingFilter filter
				= new CommonsRequestLoggingFilter();
		filter.setIncludeQueryString(true);
		filter.setIncludePayload(true);
		filter.setMaxPayloadLength(10000);
		filter.setIncludeClientInfo(true);
		filter.setIncludeHeaders(true);
		filter.setBeforeMessagePrefix(">>> ");
		filter.setAfterMessagePrefix("<<< ");
		return filter;
	}

}
