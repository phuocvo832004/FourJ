package com.fourj.orderservice.service;

import com.fourj.orderservice.dto.CreateOrderRequest;
import com.fourj.orderservice.dto.OrderDto;
import com.fourj.orderservice.dto.UpdateOrderStatusRequest;
import com.fourj.orderservice.model.Order;
import com.fourj.orderservice.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import java.util.List;

public interface OrderService {
    OrderDto createOrder(String userId, String token, CreateOrderRequest request);
    OrderDto getOrderById(Long id);
    Order getOrderByOrderNumber(String orderNumber);
    OrderDto getOrderByNumber(String orderNumber);
    Page<OrderDto> getOrdersByUserId(String userId, Pageable pageable);
    List<OrderDto> getOrdersByStatus(OrderStatus status);
    OrderDto updateOrderStatus(Long id, UpdateOrderStatusRequest request);
    OrderDto cancelOrder(Long id);
    OrderDto createOrderFromEvent(String userId, CreateOrderRequest request);
    void updateOrder(WebhookData data);
}