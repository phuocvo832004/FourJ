package com.fourj.productservice.service;

import com.fourj.productservice.entity.ProductComparison;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductComparisonService {
    ProductComparison addToComparison(Long productId, Long userId);
    void removeFromComparison(Long productId, Long userId);
    Page<ProductComparison> getUserComparisons(Long userId, Pageable pageable);
    List<ProductComparison> getUserComparisons(Long userId);
    boolean isInComparison(Long productId, Long userId);
} 