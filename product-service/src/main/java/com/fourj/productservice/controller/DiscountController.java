package com.fourj.productservice.controller;

import com.fourj.productservice.dto.DiscountRequest;
import com.fourj.productservice.entity.Discount;
import com.fourj.productservice.service.DiscountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new discount", security = @SecurityRequirement(name = "bearerAuth"))
    public Discount createDiscount(@Valid @RequestBody DiscountRequest request) {
        return discountService.createDiscount(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing discount", security = @SecurityRequirement(name = "bearerAuth"))
    public Discount updateDiscount(@PathVariable Long id,
                                  @Valid @RequestBody DiscountRequest request) {
        return discountService.updateDiscount(id, request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a discount by ID")
    public Discount getDiscount(@PathVariable Long id) {
        return discountService.getDiscountById(id);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get all discounts for a product")
    public List<Discount> getProductDiscounts(@PathVariable Long productId) {
        return discountService.getProductDiscounts(productId);
    }

    @GetMapping("/product/{productId}/active")
    @Operation(summary = "Get active discount for a product")
    public Discount getActiveDiscount(@PathVariable Long productId) {
        return discountService.getActiveDiscount(productId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a discount", security = @SecurityRequirement(name = "bearerAuth"))
    public void deleteDiscount(@PathVariable Long id) {
        discountService.deleteDiscount(id);
    }

    @DeleteMapping("/product/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete all discounts for a product", security = @SecurityRequirement(name = "bearerAuth"))
    public void deleteProductDiscounts(@PathVariable Long productId) {
        discountService.deleteProductDiscounts(productId);
    }
} 