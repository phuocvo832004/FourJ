package com.fourj.orderservice.service.impl;

import com.fourj.orderservice.dto.*;
import com.fourj.orderservice.exception.EmptyCartException;
import com.fourj.orderservice.exception.OrderCreationException;
import com.fourj.orderservice.exception.ResourceNotFoundException;
import com.fourj.orderservice.exception.ProductNotFoundException;
import com.fourj.orderservice.exception.PriceDiscrepancyException;
import com.fourj.orderservice.exception.InsufficientStockException;
import com.fourj.orderservice.model.*;
import com.fourj.orderservice.repository.OrderRepository;
import com.fourj.orderservice.service.OrderService;
import com.fourj.orderservice.service.client.CartClient;
import com.fourj.orderservice.service.client.ProductClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, CartClient cartClient, ProductClient productClient) {
        this.orderRepository = orderRepository;
        this.cartClient = cartClient;
        this.productClient = productClient;
    }

    @Override
    @Transactional
    public OrderDto createOrder(String userId, String token, CreateOrderRequest request) {
        CartDto cartBackup = null;
        
        try {
            // Lấy giỏ hàng của người dùng
            CartDto cart = cartClient.getCart(token).block();

            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new EmptyCartException("Giỏ hàng trống, không thể tạo đơn hàng");
            }
            
            // Lưu backup của giỏ hàng
            cartBackup = cart;
            
            // Kiểm tra giá sản phẩm trước khi tạo đơn hàng
            for (CartItemDto item : cart.getItems()) {
                ProductDto productInfo = productClient.getProductById(String.valueOf(item.getProductId())).block();
                if (productInfo == null) {
                    throw new ProductNotFoundException("Không tìm thấy sản phẩm: " + item.getProductId());
                }
                
                // Kiểm tra giá có thay đổi không
                if (!productInfo.getPrice().equals(BigDecimal.valueOf(item.getPrice()))) {
                    throw new PriceDiscrepancyException("Giá sản phẩm " + item.getProductName() + " đã thay đổi");
                }
                
                // Kiểm tra số lượng tồn kho
                if (productInfo.getStock() < item.getQuantity()) {
                    throw new InsufficientStockException("Sản phẩm " + item.getProductName() + " không đủ số lượng");
                }
            }

            // Chuyển đổi từ CartItemDto sang OrderItemDto
            List<OrderItemDto> orderItems = cart.getItems().stream()
                .map(item -> OrderItemDto.builder()
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .productImage(item.getProductImage())
                    .price(BigDecimal.valueOf(item.getPrice()))
                    .quantity(item.getQuantity())
                    .build())
                .collect(Collectors.toList());
            
            // Sử dụng phương thức chung
            Order order = createOrderEntity(userId, orderItems, request.getShippingAddress(), request.getPaymentMethod(), request.getNotes());
            Order savedOrder = orderRepository.save(order);
            
            // Xóa giỏ hàng sau khi tạo đơn hàng thành công
            cartClient.clearCart(token).block();

            return mapToDto(savedOrder);
        } catch (Exception e) {
            log.error("Lỗi khi tạo đơn hàng cho user {}: {}", userId, e.getMessage());
            
            // Nếu giỏ hàng đã bị xóa, khôi phục lại từ backup
            if (cartBackup != null) {
                try {
                    // Gọi API để khôi phục giỏ hàng
                    cartClient.restoreCart(token, cartBackup).block();
                    log.info("Đã khôi phục giỏ hàng sau khi tạo đơn hàng thất bại");
                } catch (Exception restoreEx) {
                    log.error("Không thể khôi phục giỏ hàng: {}", restoreEx.getMessage());
                }
            }
            
            throw new OrderCreationException("Tạo đơn hàng thất bại: " + e.getMessage(), e);
        }
    }

    @Override
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại với id: " + id));
        return mapToDto(order);
    }

    @Override
    public OrderDto getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại với số: " + orderNumber));
        return mapToDto(order);
    }

    @Override
    public Page<OrderDto> getOrdersByUserId(String userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(this::mapToDto);
    }

    @Override
    public List<OrderDto> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại với id: " + id));

        order.setStatus(request.getStatus());

        // Cập nhật trạng thái thanh toán nếu đơn hàng đã hoàn thành
        if (request.getStatus() == OrderStatus.COMPLETED) {
            PaymentInfo paymentInfo = order.getPaymentInfo();
            paymentInfo.setPaymentStatus(PaymentStatus.COMPLETED);
            paymentInfo.setPaymentDate(LocalDateTime.now());
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToDto(updatedOrder);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại với id: " + id));

        // Chỉ cho phép hủy đơn hàng ở trạng thái PENDING hoặc PROCESSING
        if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.PROCESSING) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
        } else {
            throw new IllegalStateException("Không thể hủy đơn hàng ở trạng thái " + order.getStatus());
        }
    }

    @Override
    @Transactional
    public OrderDto createOrderFromEvent(String userId, CreateOrderRequest request) {
        try {
            log.info("Creating order from checkout event for userId: {}", userId);
            
            // Sử dụng phương thức chung
            Order order = createOrderEntity(userId, request.getItems(), request.getShippingAddress(), request.getPaymentMethod(), request.getNotes());
            Order savedOrder = orderRepository.save(order);
            
            log.info("Order created successfully with order number: {}", savedOrder.getOrderNumber());
            return mapToDto(savedOrder);
        } catch (Exception e) {
            log.error("Error creating order from event for userId: {}", userId, e);
            throw new OrderCreationException("Failed to create order from checkout event: " + e.getMessage(), e);
        }
    }

    // Tạo số đơn hàng ngẫu nhiên
    private String generateOrderNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf(new Random().nextInt(1000));
        return "ORD-" + timestamp.substring(timestamp.length() - 6) + "-" + random;
    }
    
    // Phương thức chung để tạo đối tượng Order
    private Order createOrderEntity(String userId, List<OrderItemDto> items, String shippingAddress, String paymentMethod, String notes) {
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setNotes(notes);
        
        // Xử lý shipping address
        ShippingAddress addressEntity = new ShippingAddress();
        addressEntity.setFullAddress(shippingAddress);
        addressEntity.setOrder(order);
        order.setShippingAddress(addressEntity);
        
        // Xử lý payment info
        PaymentInfo paymentInfo = new PaymentInfo();
        paymentInfo.setPaymentMethod(PaymentMethod.valueOf(paymentMethod));
        paymentInfo.setPaymentStatus(PaymentStatus.PENDING);
        paymentInfo.setTransactionId(UUID.randomUUID().toString());
        order.setPaymentInfo(paymentInfo);
        
        // Tính toán tổng giá trị đơn hàng
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemDto itemDto : items) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(itemDto.getProductId());
            orderItem.setProductName(itemDto.getProductName());
            orderItem.setProductImage(itemDto.getProductImage());
            orderItem.setPrice(itemDto.getPrice());
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setSubtotal(itemDto.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
            orderItems.add(orderItem);
            
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }
        
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        
        return order;
    }

    private OrderDto mapToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productImage(item.getProductImage())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        ShippingAddressDto shippingAddressDto = null;
        if (order.getShippingAddress() != null) {
            shippingAddressDto = ShippingAddressDto.builder()
                    .id(order.getShippingAddress().getId())
                    .fullAddress(order.getShippingAddress().getFullAddress())
                    .build();
        }

        PaymentInfoDto paymentInfoDto = null;
        if (order.getPaymentInfo() != null) {
            paymentInfoDto = PaymentInfoDto.builder()
                    .id(order.getPaymentInfo().getId())
                    .paymentMethod(order.getPaymentInfo().getPaymentMethod())
                    .paymentStatus(order.getPaymentInfo().getPaymentStatus())
                    .transactionId(order.getPaymentInfo().getTransactionId())
                    .paymentDate(order.getPaymentInfo().getPaymentDate())
                    .build();
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(itemDtos)
                .shippingAddress(shippingAddressDto)
                .paymentInfo(paymentInfoDto)
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }

    // Method chuyển đổi entity sang DTO - phải phù hợp với code hiện tại
    private OrderDto mapToOrderDto(Order order) {
        PaymentInfoDto paymentInfoDto = new PaymentInfoDto(
                order.getPaymentInfo().getId(),
                order.getPaymentInfo().getPaymentMethod(),
                order.getPaymentInfo().getPaymentStatus(),
                order.getPaymentInfo().getTransactionId(),
                order.getPaymentInfo().getPaymentDate()
        );
        
        ShippingAddressDto shippingAddressDto = new ShippingAddressDto(
                order.getShippingAddress().getId(),
                order.getShippingAddress().getFullAddress()
        );
        
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setOrderNumber(order.getOrderNumber());
        orderDto.setUserId(order.getUserId());
        orderDto.setStatus(order.getStatus());
        orderDto.setTotalAmount(order.getTotalAmount());
        orderDto.setShippingAddress(shippingAddressDto);
        orderDto.setPaymentInfo(paymentInfoDto);
        orderDto.setCreatedAt(order.getCreatedAt());
        orderDto.setUpdatedAt(order.getUpdatedAt());

        // Chuyển đổi các OrderItem sang OrderItemDto
        if (order.getItems() != null) {
            List<OrderItemDto> itemDtos = order.getItems().stream()
                    .map(item -> {
                        OrderItemDto dto = new OrderItemDto();
                        dto.setId(item.getId());
                        dto.setProductId(item.getProductId());
                        dto.setProductName(item.getProductName());
                        dto.setPrice(item.getPrice());
                        dto.setQuantity(item.getQuantity());
                        return dto;
                    })
                    .collect(Collectors.toList());
            orderDto.setItems(itemDtos);
        }

        return orderDto;
    }
}