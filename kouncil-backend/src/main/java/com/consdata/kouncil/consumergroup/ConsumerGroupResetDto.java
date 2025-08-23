package com.consdata.kouncil.consumergroup;

public record ConsumerGroupResetDto(String serverId,
                                    ConsumerGroupResetType resetType,
                                    Long offsetNo,
                                    Long timestampMillis) {
}
