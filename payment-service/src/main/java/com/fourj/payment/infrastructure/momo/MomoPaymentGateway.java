package com.fourj.payment.infrastructure.momo;

import com.fourj.payment.domain.model.Payment;
import com.fourj.payment.infrastructure.momo.model.MomoPaymentRequest;
import com.fourj.payment.infrastructure.momo.model.MomoPaymentResponse;
import com.fourj.payment.infrastructure.momo.util.MomoSignatureUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MomoPaymentGateway {
    private final RestTemplate restTemplate;

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    public String createPayment(Payment payment) {
        String requestId = UUID.randomUUID().toString();
        String amount = payment.getAmount().toString();
        String orderId = payment.getOrderId();
        String orderInfo = "Payment for order " + orderId;
        String extraData = "";
        String requestType = "captureWallet";

        String signature = MomoSignatureUtil.generateRequestSignature(
                partnerCode,
                accessKey,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                extraData,
                requestType,
                secretKey
        );

        MomoPaymentRequest request = MomoPaymentRequest.builder()
                .partnerCode(partnerCode)
                .accessKey(accessKey)
                .secretKey(secretKey)
                .orderId(orderId)
                .orderInfo(orderInfo)
                .redirectUrl(redirectUrl)
                .ipnUrl(ipnUrl)
                .amount(amount)
                .orderType("momo_wallet")
                .requestId(requestId)
                .requestType(requestType)
                .extraData(extraData)
                .lang("vi")
                .signature(signature)
                .build();

        MomoPaymentResponse response = restTemplate.postForObject(
                endpoint,
                request,
                MomoPaymentResponse.class
        );

        if (response == null || !"0".equals(response.getResultCode())) {
            throw new RuntimeException("Failed to create Momo payment: " + 
                    (response != null ? response.getMessage() : "No response"));
        }

        return response.getOrderId();
    }
} 