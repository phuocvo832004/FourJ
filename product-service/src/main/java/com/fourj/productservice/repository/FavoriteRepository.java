package com.fourj.productservice.repository;

import com.fourj.productservice.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Page<Favorite> findByUserId(Long userId, Pageable pageable);
    List<Favorite> findByUserId(Long userId);
    boolean existsByProductIdAndUserId(Long productId, Long userId);
    void deleteByProductIdAndUserId(Long productId, Long userId);
} 