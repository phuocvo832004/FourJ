package com.fourj.orderservice.controller;

import com.fourj.orderservice.dto.OrderDto;
import com.fourj.orderservice.dto.OrderSearchDto;
import com.fourj.orderservice.dto.PageResponse;
import com.fourj.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "APIs for managing orders")
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create a new order", description = "Creates a new order with the provided details")
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody OrderDto orderDto) {
        return ResponseEntity.ok(orderService.createOrder(orderDto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieves an order by its ID")
    public ResponseEntity<OrderDto> getOrder(
            @Parameter(description = "ID of the order to retrieve") @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search orders", description = "Search orders with various criteria and pagination")
    public ResponseEntity<PageResponse<OrderDto>> searchOrders(
            @Parameter(description = "Search criteria") @ModelAttribute OrderSearchDto searchDto,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.searchOrders(searchDto, page, size));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Updates the status of an existing order")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @Parameter(description = "ID of the order to update") @PathVariable Long id,
            @Parameter(description = "New status for the order") @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
} 