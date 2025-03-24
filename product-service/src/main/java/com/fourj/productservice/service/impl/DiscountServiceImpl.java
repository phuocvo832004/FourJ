package com.fourj.productservice.service.impl;

import com.fourj.productservice.dto.DiscountRequest;
import com.fourj.productservice.entity.Discount;
import com.fourj.productservice.repository.DiscountRepository;
import com.fourj.productservice.service.DiscountService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final DiscountRepository discountRepository;

    @Override
    @Transactional
    public Discount createDiscount(DiscountRequest request) {
        Discount discount = Discount.builder()
                .productId(request.getProductId())
                .percentage(request.getPercentage())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        return discountRepository.save(discount);
    }

    @Override
    @Transactional
    public Discount updateDiscount(Long id, DiscountRequest request) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Discount not found"));

        discount.setPercentage(request.getPercentage());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());

        return discountRepository.save(discount);
    }

    @Override
    @Transactional(readOnly = true)
    public Discount getDiscountById(Long id) {
        return discountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Discount not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Discount> getProductDiscounts(Long productId) {
        return discountRepository.findByProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public Discount getActiveDiscount(Long productId) {
        LocalDateTime now = LocalDateTime.now();
        return discountRepository.findByProductIdAndStartDateBeforeAndEndDateAfter(productId, now, now)
                .orElse(null);
    }

    @Override
    @Transactional
    public void deleteDiscount(Long id) {
        if (!discountRepository.existsById(id)) {
            throw new EntityNotFoundException("Discount not found");
        }
        discountRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteProductDiscounts(Long productId) {
        discountRepository.deleteByProductId(productId);
    }
} 