package com.fourj.orderservice.service.impl;

import com.fourj.orderservice.client.CreatePaymentRequest;
import com.fourj.orderservice.client.PaymentClient;
import com.fourj.orderservice.client.ProductClient;
import com.fourj.orderservice.client.ProductDto;
import com.fourj.orderservice.dto.OrderItemDto;
import com.fourj.orderservice.dto.OrderItemResponse;
import com.fourj.orderservice.dto.OrderRequest;
import com.fourj.orderservice.dto.OrderResponse;
import com.fourj.orderservice.entity.Order;
import com.fourj.orderservice.entity.OrderItem;
import com.fourj.orderservice.entity.OrderStatus;
import com.fourj.orderservice.repository.OrderItemRepository;
import com.fourj.orderservice.repository.OrderRepository;
import com.fourj.orderservice.service.OrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductClient productClient;
    private final PaymentClient paymentClient;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, Long userId) {
        // Lấy danh sách ID sản phẩm từ request
        List<Long> productIds = request.getItems().stream()
                .map(OrderItemDto::getProductId)
                .collect(Collectors.toList());
        
        // Lấy thông tin sản phẩm từ product-service
        List<ProductDto> products = productClient.getProductsByIds(productIds);
        
        // Kiểm tra số lượng sản phẩm trả về có đúng không
        if (products.size() != productIds.size()) {
            throw new EntityNotFoundException("Không tìm thấy một số sản phẩm");
        }
        
        // Chuyển danh sách sản phẩm thành map để dễ truy cập
        Map<Long, ProductDto> productMap = products.stream()
                .collect(Collectors.toMap(ProductDto::getId, Function.identity()));
                
        // Tính tổng giá trị đơn hàng và kiểm tra số lượng
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemDto itemDto : request.getItems()) {
            ProductDto product = productMap.get(itemDto.getProductId());
            
            // Kiểm tra số lượng trong kho
            if (product.getStock() < itemDto.getQuantity()) {
                throw new IllegalArgumentException(
                        "Sản phẩm " + product.getName() + " không đủ số lượng trong kho");
            }
            
            // Tính giá trị của item
            BigDecimal price = product.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            totalAmount = totalAmount.add(subtotal);
        }
        
        // Tạo mới order
        Order order = Order.builder()
                .userId(userId)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .build();
        
        order = orderRepository.save(order);
        final Long orderId = order.getId();
        
        // Tạo order items
        for (OrderItemDto itemDto : request.getItems()) {
            ProductDto product = productMap.get(itemDto.getProductId());
            
            BigDecimal price = product.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            
            OrderItem orderItem = OrderItem.builder()
                    .orderId(orderId)
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(price)
                    .quantity(itemDto.getQuantity())
                    .subtotal(subtotal)
                    .build();
            
            orderItems.add(orderItem);
            
            // Cập nhật số lượng sản phẩm trong kho
            productClient.updateStock(product.getId(), -itemDto.getQuantity());
        }
        
        orderItemRepository.saveAll(orderItems);
        
        // Tạo thanh toán qua payment-service
        CreatePaymentRequest paymentRequest = CreatePaymentRequest.builder()
                .orderId(orderId.toString())
                .amount(totalAmount)
                .currency("VND")
                .build();
        
        paymentClient.createPayment(paymentRequest);
        
        return mapToOrderResponse(order, orderItems);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
                
        // Kiểm tra quyền truy cập
        if (!order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Không có quyền truy cập đơn hàng này");
        }
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        return mapToOrderResponse(order, orderItems);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    return mapToOrderResponse(order, items);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    return mapToOrderResponse(order, items);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable)
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    return mapToOrderResponse(order, items);
                });
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        
        order.setStatus(status);
        order = orderRepository.save(order);
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        return mapToOrderResponse(order, orderItems);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        
        // Kiểm tra quyền truy cập
        if (!order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Không có quyền hủy đơn hàng này");
        }
        
        // Chỉ cho phép hủy đơn hàng ở trạng thái PENDING hoặc CONFIRMED
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalArgumentException("Không thể hủy đơn hàng ở trạng thái hiện tại");
        }
        
        // Cập nhật trạng thái đơn hàng
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        // Hoàn trả số lượng sản phẩm vào kho
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        for (OrderItem item : orderItems) {
            productClient.updateStock(item.getProductId(), item.getQuantity());
        }
    }
    
    private OrderResponse mapToOrderResponse(Order order, List<OrderItem> orderItems) {
        List<OrderItemResponse> itemResponses = orderItems.stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());
        
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .build();
    }
} 