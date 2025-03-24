package com.fourj.payment.domain.service;

import com.fourj.payment.domain.model.Payment;
import java.math.BigDecimal;

public interface PaymentService {
    Payment createPayment(String orderId, BigDecimal amount, String currency);
    Payment processPayment(String orderId);
    Payment getPaymentByOrderId(String orderId);
    Payment getPaymentByPayosTransactionId(String payosTransactionId);
    Payment handlePayosCallback(String payosTransactionId, String status);
} 