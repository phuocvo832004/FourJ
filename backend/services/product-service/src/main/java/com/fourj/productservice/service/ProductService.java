package com.fourj.productservice.service;

import com.fourj.productservice.dto.ProductCreateDto;
import com.fourj.productservice.dto.ProductDto;
import com.fourj.productservice.dto.ProductUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductDto createProduct(ProductCreateDto productCreateDto);
    ProductDto getProductById(Long id);
    Page<ProductDto> getAllProducts(Pageable pageable);
    Page<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable);
    Page<ProductDto> searchProducts(String keyword, Pageable pageable);
    ProductDto updateProduct(Long id, ProductUpdateDto productUpdateDto);
    void deleteProduct(Long id);
}