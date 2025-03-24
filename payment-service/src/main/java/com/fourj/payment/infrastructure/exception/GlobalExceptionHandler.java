package com.fourj.payment.infrastructure.exception;

import com.fourj.payment.domain.exception.PaymentException;
import com.fourj.payment.domain.exception.PaymentNotFoundException;
import com.fourj.payment.domain.exception.PayOSPaymentException;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @Data
    public static class ErrorResponse {
        private final String code;
        private final String message;
        private final HttpStatus status;

        public ErrorResponse(String code, String message, HttpStatus status) {
            this.code = code;
            this.message = message;
            this.status = status;
        }
    }

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePaymentNotFoundException(PaymentNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ex.getCode(), ex.getMessage(), HttpStatus.NOT_FOUND));
    }

    @ExceptionHandler(PayOSPaymentException.class)
    public ResponseEntity<ErrorResponse> handlePayOSPaymentException(PayOSPaymentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getCode(), ex.getMessage(), HttpStatus.BAD_REQUEST));
    }

    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorResponse> handlePaymentException(PaymentException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getCode(), ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
    }
} 