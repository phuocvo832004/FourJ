package com.fourj.payment.application.controller;

import com.fourj.payment.application.dto.CreatePaymentRequest;
import com.fourj.payment.domain.model.Payment;
import com.fourj.payment.domain.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(
                request.getOrderId(),
                request.getAmount(),
                request.getCurrency()
        ));
    }

    @PostMapping("/{orderId}/process")
    public ResponseEntity<Payment> processPayment(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.processPayment(orderId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    @GetMapping("/payos/{payosTransactionId}")
    public ResponseEntity<Payment> getPaymentByPayosTransactionId(@PathVariable String payosTransactionId) {
        return ResponseEntity.ok(paymentService.getPaymentByPayosTransactionId(payosTransactionId));
    }

    @PostMapping("/payos/callback")
    public ResponseEntity<Payment> handlePayosCallback(
            @RequestParam String paymentId,
            @RequestParam String status) {
        return ResponseEntity.ok(paymentService.handlePayosCallback(paymentId, status));
    }
} 