package com.fourj.productservice.service;

import com.fourj.productservice.dto.DiscountRequest;
import com.fourj.productservice.entity.Discount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DiscountService {
    Discount createDiscount(DiscountRequest request);
    Discount updateDiscount(Long id, DiscountRequest request);
    Discount getDiscountById(Long id);
    List<Discount> getProductDiscounts(Long productId);
    Discount getActiveDiscount(Long productId);
    void deleteDiscount(Long id);
    void deleteProductDiscounts(Long productId);
} 