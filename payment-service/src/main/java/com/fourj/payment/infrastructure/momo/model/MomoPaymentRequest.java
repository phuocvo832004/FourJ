package com.fourj.payment.infrastructure.momo.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MomoPaymentRequest {
    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String orderId;
    private String orderInfo;
    private String redirectUrl;
    private String ipnUrl;
    private String amount;
    private String orderType;
    private String requestId;
    private String requestType;
    private String extraData;
    private String lang;
    private String signature;
} 