package com.fourj.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;

@FeignClient(name = "payment-service")
public interface PaymentClient {
    
    @PostMapping("/api/payments")
    PaymentDto createPayment(@RequestBody CreatePaymentRequest request);
    
    @GetMapping("/api/payments/order/{orderId}")
    PaymentDto getPaymentByOrderId(@PathVariable String orderId);
} 