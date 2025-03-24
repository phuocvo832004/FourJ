package com.fourj.payment.infrastructure.payos.model;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class PayOSPaymentRequest {
    private Integer amount;
    private String description;
    private String orderCode;
    private String returnUrl;
    private String cancelUrl;
    private String signature;
    private Map<String, Object> extraData;
} 