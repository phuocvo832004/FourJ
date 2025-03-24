package com.fourj.payment.domain.exception;

public class PayOSPaymentException extends PaymentException {
    public PayOSPaymentException(String message) {
        super("PAYOS_PAYMENT_ERROR", message);
    }

    public PayOSPaymentException(String message, Throwable cause) {
        super("PAYOS_PAYMENT_ERROR", message, cause);
    }
} 