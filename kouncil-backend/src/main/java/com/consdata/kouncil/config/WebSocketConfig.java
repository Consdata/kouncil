package com.consdata.kouncil.config;

import com.consdata.kouncil.track.DestinationStore;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@SuppressWarnings("java:S6212") //val
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final DestinationStore destinationStore;
    @Value("${allowedOrigins:*}")
    private List<String> allowedOrigins = new ArrayList<>();

    public WebSocketConfig(DestinationStore destinationStore) {
        this.destinationStore = destinationStore;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/notifications");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.debug("allowedOrigins={}", allowedOrigins);
        if (allowedOrigins.contains("*")) {
            log.warn("Allowed origin pattern set to *. Consider narrowing down.");
        }
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.toArray(String[]::new));
    }

    @EventListener
    public void onSocketConnected(SessionConnectedEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        log.debug("[Connected] {}", sha.getSessionId());
    }

    @EventListener
    public void onSocketDisconnected(SessionDisconnectEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        log.debug("[Disconnected] {}", sha.getSessionId());
    }

    @EventListener
    public void onSubscribed(SessionSubscribeEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        log.debug("[Subscribed] {}, {}", sha.getSessionId(), sha.getDestination());
        destinationStore.registerDestination(sha.getSessionId(), sha.getDestination());
    }

    @EventListener
    public void onUnsubscribed(SessionUnsubscribeEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        log.debug("[Unsubscribed] {}", sha.getSessionId());
        destinationStore.unregisterDestination(sha.getSessionId());
    }
}
