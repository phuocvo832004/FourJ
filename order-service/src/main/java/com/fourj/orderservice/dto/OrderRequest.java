package com.fourj.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String note;

    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    private List<OrderItemDto> items;
} 