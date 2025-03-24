package com.fourj.productservice.repository;

import com.fourj.productservice.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductId(Long productId);
    ProductImage findByProductIdAndIsPrimaryTrue(Long productId);
    void deleteByProductId(Long productId);
} 
 