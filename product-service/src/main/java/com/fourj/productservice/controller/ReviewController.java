package com.fourj.productservice.controller;

import com.fourj.productservice.dto.ReviewRequest;
import com.fourj.productservice.entity.Review;
import com.fourj.productservice.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new review", security = @SecurityRequirement(name = "bearerAuth"))
    public Review createReview(@Valid @RequestBody ReviewRequest request,
                              @AuthenticationPrincipal Long userId) {
        return reviewService.createReview(request, userId);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing review", security = @SecurityRequirement(name = "bearerAuth"))
    public Review updateReview(@PathVariable Long id,
                              @Valid @RequestBody ReviewRequest request) {
        return reviewService.updateReview(id, request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a review by ID")
    public Review getReview(@PathVariable Long id) {
        return reviewService.getReviewById(id);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get all reviews for a product")
    public Page<Review> getProductReviews(@PathVariable Long productId,
                                        Pageable pageable) {
        return reviewService.getProductReviews(productId, pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a review", security = @SecurityRequirement(name = "bearerAuth"))
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }

    @GetMapping("/product/{productId}/average-rating")
    @Operation(summary = "Get average rating for a product")
    public double getAverageRating(@PathVariable Long productId) {
        return reviewService.getAverageRating(productId);
    }
} 