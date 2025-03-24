package com.fourj.orderservice.controller;

import com.fourj.orderservice.dto.OrderRequest;
import com.fourj.orderservice.dto.OrderResponse;
import com.fourj.orderservice.entity.OrderStatus;
import com.fourj.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order API", description = "API để quản lý đơn hàng")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(request, userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin đơn hàng theo ID")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(orderService.getOrderById(id, userId));
    }

    @GetMapping("/user")
    @Operation(summary = "Lấy danh sách đơn hàng của người dùng hiện tại")
    public ResponseEntity<Page<OrderResponse>> getUserOrders(
            Pageable pageable,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(orderService.getUserOrders(userId, pageable));
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả đơn hàng (chỉ admin)")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy danh sách đơn hàng theo trạng thái (chỉ admin)")
    public ResponseEntity<Page<OrderResponse>> getOrdersByStatus(
            @PathVariable OrderStatus status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status, pageable));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn hàng (chỉ admin)")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hủy đơn hàng")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        orderService.cancelOrder(id, userId);
        return ResponseEntity.noContent().build();
    }
} 