package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.model.datamasking.Policy;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataMaskingService {

    public String maskTopicMessage(String message, List<Policy> policies) {
        if (StringUtils.hasLength(message)) {
            for (Policy policy : policies) {
                message = PolicyApplier.apply(policy, message);
            }
        }
        return message;
    }
}
