package com.fourj.orderservice.service;

import com.fourj.orderservice.dto.OrderRequest;
import com.fourj.orderservice.dto.OrderResponse;
import com.fourj.orderservice.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request, Long userId);
    OrderResponse getOrderById(Long id, Long userId);
    Page<OrderResponse> getUserOrders(Long userId, Pageable pageable);
    Page<OrderResponse> getAllOrders(Pageable pageable);
    Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable);
    OrderResponse updateOrderStatus(Long id, OrderStatus status);
    void cancelOrder(Long id, Long userId);
} 