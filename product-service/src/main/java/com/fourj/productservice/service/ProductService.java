package com.fourj.productservice.service;

import com.fourj.productservice.dto.ProductRequest;
import com.fourj.productservice.dto.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request, Long userId);
    ProductResponse updateProduct(Long id, ProductRequest request, Long userId);
    ProductResponse getProductById(Long id);
    Page<ProductResponse> getAllProducts(Pageable pageable);
    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);
    Page<ProductResponse> searchProducts(String name, Pageable pageable);
    void deleteProduct(Long id);
    List<ProductResponse> getProductsByIds(List<Long> ids);
    void updateStock(Long id, Integer quantity);
} 