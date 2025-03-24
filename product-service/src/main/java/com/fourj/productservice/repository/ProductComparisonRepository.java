package com.fourj.productservice.repository;

import com.fourj.productservice.entity.ProductComparison;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductComparisonRepository extends JpaRepository<ProductComparison, Long> {
    Page<ProductComparison> findByUserId(Long userId, Pageable pageable);
    
    List<ProductComparison> findByUserId(Long userId);
    
    Optional<ProductComparison> findByUserIdAndProductId(Long userId, Long productId);
    
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserId(Long userId);

    void deleteByProductIdAndUserId(Long productId, Long userId);
} 