package com.fourj.payment.domain.service.impl;

import com.fourj.payment.domain.exception.PaymentNotFoundException;
import com.fourj.payment.domain.model.Payment;
import com.fourj.payment.domain.model.PaymentStatus;
import com.fourj.payment.domain.repository.PaymentRepository;
import com.fourj.payment.domain.service.PaymentService;
import com.fourj.payment.infrastructure.payos.PayOSPaymentGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final PayOSPaymentGateway payosPaymentGateway;

    @Override
    @Transactional
    public Payment createPayment(String orderId, BigDecimal amount, String currency) {
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setStatus(PaymentStatus.PENDING);
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment processPayment(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        payment.setStatus(PaymentStatus.PROCESSING);
        payment = paymentRepository.save(payment);

        String payosTransactionId = payosPaymentGateway.createPayment(payment);
        payment.setPayosTransactionId(payosTransactionId);
        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));
    }

    @Override
    public Payment getPaymentByPayosTransactionId(String payosTransactionId) {
        return paymentRepository.findByPayosTransactionId(payosTransactionId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for PayOS transaction: " + payosTransactionId));
    }

    @Override
    @Transactional
    public Payment handlePayosCallback(String payosTransactionId, String status) {
        Payment payment = getPaymentByPayosTransactionId(payosTransactionId);
        
        switch (status.toUpperCase()) {
            case "COMPLETED" -> payment.setStatus(PaymentStatus.COMPLETED);
            case "FAILED" -> payment.setStatus(PaymentStatus.FAILED);
            case "CANCELLED" -> payment.setStatus(PaymentStatus.FAILED);
            default -> throw new RuntimeException("Invalid payment status: " + status);
        }
        
        return paymentRepository.save(payment);
    }
} 