package com.fourj.payment.infrastructure.momo.model;

import lombok.Data;

@Data
public class MomoPaymentResponse {
    private String partnerCode;
    private String orderId;
    private String requestId;
    private String amount;
    private String responseTime;
    private String message;
    private String resultCode;
    private String payUrl;
    private String deeplink;
    private String qrCodeUrl;
    private String applink;
} 