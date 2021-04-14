package com.consdata.kouncil.consumergroup;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConsumerGroup {
    private String groupId;
    private String status;
}
