package com.fourj.orderservice.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {
    private Long id;
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String momoTransactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 