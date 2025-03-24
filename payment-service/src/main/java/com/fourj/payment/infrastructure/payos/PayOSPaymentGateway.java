package com.fourj.payment.infrastructure.payos;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fourj.payment.domain.exception.PayOSPaymentException;
import com.fourj.payment.domain.model.Payment;
import com.fourj.payment.infrastructure.payos.model.PayOSPaymentRequest;
import com.fourj.payment.infrastructure.payos.model.PayOSPaymentResponse;
import com.fourj.payment.infrastructure.payos.util.PayOSSignatureUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PayOSPaymentGateway {
    private final RestTemplate restTemplate;

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.endpoint}")
    private String endpoint;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    public String createPayment(Payment payment) {
        try {
            int amount = payment.getAmount().intValue();
            String orderCode = payment.getOrderId();
            String description = "Thanh toán đơn hàng " + orderCode;
            
            Map<String, Object> extraData = new HashMap<>();
            extraData.put("paymentId", payment.getId());
            
            String signature = PayOSSignatureUtil.generateSignature(
                    amount,
                    description,
                    orderCode,
                    extraData,
                    checksumKey
            );
            
            PayOSPaymentRequest request = PayOSPaymentRequest.builder()
                    .amount(amount)
                    .description(description)
                    .orderCode(orderCode)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .signature(signature)
                    .extraData(extraData)
                    .build();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);
            
            HttpEntity<PayOSPaymentRequest> entity = new HttpEntity<>(request, headers);
            
            PayOSPaymentResponse response = restTemplate.postForObject(
                    endpoint,
                    entity,
                    PayOSPaymentResponse.class
            );
            
            if (response == null || !"00".equals(response.getCode())) {
                throw new PayOSPaymentException("Failed to create PayOS payment: " + 
                        (response != null ? response.getDesc() : "No response"));
            }
            
            return response.getData().getPayment().toString();
        } catch (JsonProcessingException e) {
            throw new PayOSPaymentException("Error creating PayOS payment signature", e);
        }
    }
} 