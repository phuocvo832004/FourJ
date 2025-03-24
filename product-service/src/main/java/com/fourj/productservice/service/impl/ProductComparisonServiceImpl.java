package com.fourj.productservice.service.impl;

import com.fourj.productservice.entity.ProductComparison;
import com.fourj.productservice.repository.ProductComparisonRepository;
import com.fourj.productservice.service.ProductComparisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductComparisonServiceImpl implements ProductComparisonService {

    private final ProductComparisonRepository productComparisonRepository;

    @Override
    @Transactional
    public ProductComparison addToComparison(Long productId, Long userId) {
        if (productComparisonRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalArgumentException("Product is already in comparison list");
        }

        ProductComparison comparison = ProductComparison.builder()
                .productId(productId)
                .userId(userId)
                .build();

        return productComparisonRepository.save(comparison);
    }

    @Override
    @Transactional
    public void removeFromComparison(Long productId, Long userId) {
        productComparisonRepository.deleteByProductIdAndUserId(productId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductComparison> getUserComparisons(Long userId, Pageable pageable) {
        return productComparisonRepository.findByUserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductComparison> getUserComparisons(Long userId) {
        return productComparisonRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInComparison(Long productId, Long userId) {
        return productComparisonRepository.existsByUserIdAndProductId(userId, productId);
    }
} 