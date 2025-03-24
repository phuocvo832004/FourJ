package com.fourj.payment.infrastructure.payos.model;

import lombok.Data;

@Data
public class PayOSPaymentResponse {
    private String code;
    private String desc;
    private PayOSPaymentData data;
    
    @Data
    public static class PayOSPaymentData {
        private String order;
        private Integer payment;
        private String url;
        private String qrCode;
        private String status;
    }
} 