package pl.ynleborg.websock;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class WebSocketStats {
    private String wsSession;
    private String taskScheduler;
    private String clientInbound;
    private String clientOutbound;
    private Set<String> destinations;
}
