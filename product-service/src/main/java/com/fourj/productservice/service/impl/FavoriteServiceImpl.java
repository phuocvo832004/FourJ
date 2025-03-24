package com.fourj.productservice.service.impl;

import com.fourj.productservice.entity.Favorite;
import com.fourj.productservice.repository.FavoriteRepository;
import com.fourj.productservice.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;

    @Override
    @Transactional
    public Favorite addToFavorites(Long productId, Long userId) {
        if (favoriteRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new IllegalArgumentException("Product is already in favorites");
        }

        Favorite favorite = Favorite.builder()
                .productId(productId)
                .userId(userId)
                .build();

        return favoriteRepository.save(favorite);
    }

    @Override
    @Transactional
    public void removeFromFavorites(Long productId, Long userId) {
        favoriteRepository.deleteByProductIdAndUserId(productId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Favorite> getUserFavorites(Long userId, Pageable pageable) {
        return favoriteRepository.findByUserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(Long productId, Long userId) {
        return favoriteRepository.existsByProductIdAndUserId(productId, userId);
    }
} 