package com.fourj.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "product-service")
public interface ProductClient {
    
    @GetMapping("/api/products/{id}")
    ProductDto getProductById(@PathVariable Long id);
    
    @GetMapping("/api/products/batch")
    List<ProductDto> getProductsByIds(@RequestParam List<Long> ids);
    
    @PutMapping("/api/products/{id}/stock")
    void updateStock(@PathVariable Long id, @RequestParam Integer quantity);
} 