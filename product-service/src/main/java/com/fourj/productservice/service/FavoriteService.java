package com.fourj.productservice.service;

import com.fourj.productservice.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FavoriteService {
    Favorite addToFavorites(Long productId, Long userId);
    void removeFromFavorites(Long productId, Long userId);
    Page<Favorite> getUserFavorites(Long userId, Pageable pageable);
    List<Favorite> getUserFavorites(Long userId);
    boolean isFavorite(Long productId, Long userId);
} 