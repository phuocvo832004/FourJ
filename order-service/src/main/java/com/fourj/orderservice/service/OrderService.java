package com.fourj.orderservice.service;

import com.fourj.orderservice.dto.OrderDto;
import com.fourj.orderservice.dto.OrderSearchDto;
import com.fourj.orderservice.dto.PageResponse;
import com.fourj.orderservice.entity.Order;
import com.fourj.orderservice.exception.OrderNotFoundException;
import com.fourj.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderDto createOrder(OrderDto orderDto) {
        Order order = new Order();
        order.setOrderNumber(UUID.randomUUID().toString());
        order.setUserId(orderDto.getUserId());
        order.setTotalAmount(orderDto.getTotalAmount());
        order.setStatus("PENDING");
        
        Order savedOrder = orderRepository.save(order);
        return convertToDto(savedOrder);
    }

    public OrderDto getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
        return convertToDto(order);
    }

    public PageResponse<OrderDto> searchOrders(OrderSearchDto searchDto, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Order> orderPage = orderRepository.searchOrders(
                searchDto.getUserId(),
                searchDto.getStatus(),
                searchDto.getMinAmount(),
                searchDto.getMaxAmount(),
                searchDto.getFromDate(),
                searchDto.getToDate(),
                pageRequest
        );

        List<OrderDto> orderDtos = orderPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new PageResponse<>(
                orderDtos,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast(),
                orderPage.isFirst()
        );
    }

    public OrderDto updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return convertToDto(updatedOrder);
    }

    private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }
} 