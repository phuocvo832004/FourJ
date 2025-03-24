package com.fourj.productservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductImageRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Image file is required")
    private MultipartFile imageFile;

    private boolean isPrimary;
} 