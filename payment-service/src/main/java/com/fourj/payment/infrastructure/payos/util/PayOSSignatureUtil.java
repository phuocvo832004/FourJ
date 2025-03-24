package com.fourj.payment.infrastructure.payos.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.codec.digest.HmacUtils;

import java.nio.charset.StandardCharsets;
import java.util.Map;

public class PayOSSignatureUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String generateSignature(Integer amount, String description, String orderCode, Map<String, Object> extraData, String checksumKey) throws JsonProcessingException {
        String extraDataStr = objectMapper.writeValueAsString(extraData);
        String plainText = amount + orderCode + description + extraDataStr;
        return HmacUtils.hmacSha256Hex(checksumKey.getBytes(StandardCharsets.UTF_8), plainText.getBytes(StandardCharsets.UTF_8));
    }

    public static boolean verifySignature(String signature, Integer amount, String orderCode, String description, Map<String, Object> extraData, String checksumKey) throws JsonProcessingException {
        String calculatedSignature = generateSignature(amount, description, orderCode, extraData, checksumKey);
        return calculatedSignature.equals(signature);
    }
} 