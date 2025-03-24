package com.fourj.productservice.controller;

import com.fourj.productservice.dto.ProductRequest;
import com.fourj.productservice.dto.ProductResponse;
import com.fourj.productservice.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new product", security = @SecurityRequirement(name = "bearerAuth"))
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest request,
                                       @AuthenticationPrincipal Long userId) {
        return productService.createProduct(request, userId);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product", security = @SecurityRequirement(name = "bearerAuth"))
    public ProductResponse updateProduct(@PathVariable Long id,
                                       @Valid @RequestBody ProductRequest request,
                                       @AuthenticationPrincipal Long userId) {
        return productService.updateProduct(id, request, userId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product by ID")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping
    @Operation(summary = "Get all products with pagination")
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productService.getAllProducts(pageable);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public Page<ProductResponse> getProductsByCategory(@PathVariable Long categoryId,
                                                      Pageable pageable) {
        return productService.getProductsByCategory(categoryId, pageable);
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by name")
    public Page<ProductResponse> searchProducts(@RequestParam String name,
                                               Pageable pageable) {
        return productService.searchProducts(name, pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a product", security = @SecurityRequirement(name = "bearerAuth"))
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @PostMapping("/batch")
    @Operation(summary = "Get multiple products by IDs")
    public List<ProductResponse> getProductsByIds(@RequestBody List<Long> ids) {
        return productService.getProductsByIds(ids);
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Update product stock", security = @SecurityRequirement(name = "bearerAuth"))
    public void updateStock(@PathVariable Long id,
                           @RequestParam Integer quantity) {
        productService.updateStock(id, quantity);
    }
} 