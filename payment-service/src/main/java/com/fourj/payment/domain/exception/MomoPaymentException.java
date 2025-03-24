package com.fourj.payment.domain.exception;

public class MomoPaymentException extends PaymentException {
    public MomoPaymentException(String message) {
        super("MOMO_PAYMENT_ERROR", message);
    }

    public MomoPaymentException(String message, Throwable cause) {
        super("MOMO_PAYMENT_ERROR", message, cause);
    }
} 