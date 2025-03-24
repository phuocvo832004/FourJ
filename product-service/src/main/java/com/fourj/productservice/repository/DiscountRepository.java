package com.fourj.productservice.repository;

import com.fourj.productservice.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {
    List<Discount> findByProductId(Long productId);
    
    Optional<Discount> findByProductIdAndStartDateBeforeAndEndDateAfter(Long productId, 
                                                                      LocalDateTime startDate, 
                                                                      LocalDateTime endDate);
    
    void deleteByProductId(Long productId);
} 