package com.fourj.payment.infrastructure.momo.util;

import org.apache.commons.codec.digest.HmacUtils;

import java.nio.charset.StandardCharsets;

public class MomoSignatureUtil {
    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";

    public static String generateSignature(String data, String secretKey) {
        return HmacUtils.hmacSha256Hex(secretKey.getBytes(StandardCharsets.UTF_8), data.getBytes(StandardCharsets.UTF_8));
    }

    public static String generateRequestSignature(String partnerCode, String accessKey, String requestId, String amount, String orderId, String orderInfo, String redirectUrl, String ipnUrl, String extraData, String requestType, String secretKey) {
        String rawHash = String.format("accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType);
        return generateSignature(rawHash, secretKey);
    }
} 