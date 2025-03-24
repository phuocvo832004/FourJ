package com.fourj.payment.domain.exception;

public class PaymentNotFoundException extends PaymentException {
    public PaymentNotFoundException(String orderId) {
        super("PAYMENT_NOT_FOUND", "Payment not found for order: " + orderId);
    }

    public PaymentNotFoundException(String orderId, Throwable cause) {
        super("PAYMENT_NOT_FOUND", "Payment not found for order: " + orderId, cause);
    }
} 