package pl.tomlewlit.kafkacompanion;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.DescribeClusterResult;
import org.apache.kafka.common.Node;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@RestController
public class BrokersController {

    private AdminClient adminClient;

    public BrokersController(AdminClient adminClient) {
        this.adminClient = adminClient;
    }

    @GetMapping("/api/brokers")
    public Brokers getBrokers() {
        try {
            DescribeClusterResult describeClusterResult = adminClient.describeCluster();
            Collection<Node> nodes = describeClusterResult.nodes().get();
            List<Broker> brokers = new ArrayList<>();
            nodes.forEach(node -> brokers.add(Broker.builder()
                    .host(node.host())
                    .port(node.port())
                    .id(node.idString())
                    .rack(node.rack())
                    .build()));
            Collections.sort(brokers);
            return Brokers.builder().brokers(brokers).build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
