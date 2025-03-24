package com.fourj.productservice.service;

import com.fourj.productservice.dto.ReviewRequest;
import com.fourj.productservice.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    Review createReview(ReviewRequest request, Long userId);
    Review updateReview(Long id, ReviewRequest request);
    Review getReviewById(Long id);
    Page<Review> getProductReviews(Long productId, Pageable pageable);
    void deleteReview(Long id);
    double getAverageRating(Long productId);
} 