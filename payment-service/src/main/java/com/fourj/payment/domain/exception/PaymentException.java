package com.fourj.payment.domain.exception;

public class PaymentException extends RuntimeException {
    private final String code;
    private final String message;

    public PaymentException(String code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    public PaymentException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
} 