package com.fourj.productservice.service;

import com.fourj.productservice.dto.ProductImageRequest;
import com.fourj.productservice.entity.ProductImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    ProductImage uploadImage(ProductImageRequest request);
    List<ProductImage> getProductImages(Long productId);
    ProductImage getPrimaryImage(Long productId);
    void deleteImage(Long id);
    void deleteProductImages(Long productId);
} 