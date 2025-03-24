package com.fourj.orderservice.repository;

import com.fourj.orderservice.entity.Order;
import com.fourj.orderservice.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserId(Long userId, Pageable pageable);
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
} 