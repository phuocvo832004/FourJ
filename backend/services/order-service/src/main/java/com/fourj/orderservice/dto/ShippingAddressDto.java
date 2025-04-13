package com.fourj.orderservice.dto;

import lombok.*;

@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressDto {
    private Long id;
    private String fullAddress;
}