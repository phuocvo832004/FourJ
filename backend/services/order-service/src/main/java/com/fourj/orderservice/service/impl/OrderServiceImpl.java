package com.fourj.orderservice.service.impl;


import com.fourj.orderservice.dto.*;
import com.fourj.orderservice.exception.*;
import com.fourj.orderservice.model.*;
import com.fourj.orderservice.repository.OrderRepository;
import com.fourj.orderservice.service.OrderService;
import com.fourj.orderservice.service.client.CartClient;
import com.fourj.orderservice.service.client.ProductClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;
    private final PayOS payOS;

    @Override
    @Transactional
    public OrderDto createOrder(String userId, String token, CreateOrderRequest request) {
        try {
            // Lấy giỏ hàng của người dùng
            CartDto cart = cartClient.getCart(token).block();
            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new EmptyCartException("Giỏ hàng trống, không thể tạo đơn hàng");
            }

            // Kiểm tra giá và tồn kho sản phẩm
            for (CartItemDto item : cart.getItems()) {
                ProductDto productInfo = productClient.getProductById(String.valueOf(item.getProductId())).block();
                if (productInfo == null) {
                    throw new ProductNotFoundException("Không tìm thấy sản phẩm: " + item.getProductId());
                }
                if (!productInfo.getPrice().equals(BigDecimal.valueOf(item.getPrice()))) {
                    throw new PriceDiscrepancyException("Giá sản phẩm " + item.getProductName() + " đã thay đổi");
                }
                if (productInfo.getStock() < item.getQuantity()) {
                    throw new InsufficientStockException("Sản phẩm " + item.getProductName() + " không đủ số lượng");
                }
            }

            // Chuyển đổi CartItemDto sang OrderItem
            List<OrderItem> orderItems = cart.getItems().stream()
                    .map(item -> OrderItem.builder()
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .productImage(item.getProductImage())
                            .price(BigDecimal.valueOf(item.getPrice()))
                            .quantity(item.getQuantity())
                            .order(null)
                            .build())
                    .collect(Collectors.toList());

            // Tạo entity Order
            Order order = new Order();
            order.setUserId(userId);
            order.setOrderNumber(generateOrderNumber());
            order.setStatus(OrderStatus.PENDING);
            order.setTotalAmount(calculateTotalAmount(orderItems));
            order.setItems(orderItems);
            order.setShippingAddress(new ShippingAddress(request.getShippingAddress()));
            order.setPaymentInfo(new PaymentInfo(null, PaymentMethod.valueOf(request.getPaymentMethod()), PaymentStatus.PENDING, null, null, null, null, null));
            order.setNotes(request.getNotes());

            // Gán order cho các OrderItem
            orderItems.forEach(item -> item.setOrder(order));

            // Lưu đơn hàng
            Order savedOrder = orderRepository.save(order);

            // Xử lý thanh toán dựa trên paymentMethod
            PaymentMethod paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod());
            if (paymentMethod == PaymentMethod.COD) {
                // COD: Không cần link thanh toán
                savedOrder.setStatus(OrderStatus.PROCESSING);
                savedOrder.getPaymentInfo().setPaymentStatus(PaymentStatus.PENDING);
                orderRepository.save(savedOrder);
            } else {
                // CREDIT_CARD, BANK_TRANSFER, PAYPAL: Sử dụng payOS
                PaymentData paymentData = createPaymentData(savedOrder);
                CheckoutResponseData response = payOS.createPaymentLink(paymentData);

                // Cập nhật PaymentInfo
                PaymentInfo paymentInfo = savedOrder.getPaymentInfo();
                paymentInfo.setPaymentLinkId(response.getPaymentLinkId());
                paymentInfo.setCheckoutUrl(response.getCheckoutUrl());
                paymentInfo.setPayOsOrderCode(response.getOrderCode());
                orderRepository.save(savedOrder);
            }

            // Xóa giỏ hàng
            cartClient.clearCart(token).block();

            // Trả về OrderDto
            return mapToDto(savedOrder);

        } catch (Exception e) {
            log.error("Lỗi khi tạo đơn hàng cho user {}: {}", userId, e.getMessage());
            throw new OrderCreationException("Tạo đơn hàng thất bại: " + e.getMessage(), e);
        }
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }

    private BigDecimal calculateTotalAmount(List<OrderItem> items) {
        return items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private PaymentData createPaymentData(Order order) {
        List<ItemData> items = order.getItems().stream()
                .map(item -> ItemData.builder()
                        .name(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice().intValue())
                        .build())
                .collect(Collectors.toList());

        return PaymentData.builder()
                .orderCode(order.getPaymentInfo().getPayOsOrderCode() != null ? order.getPaymentInfo().getPayOsOrderCode() : System.currentTimeMillis())
                .amount(order.getTotalAmount().intValue())
                .description("Thanh toán đơn hàng #" + order.getOrderNumber())
                .items(items)
                .cancelUrl("https://your-site.com/api/orders/cancel?orderId=" + order.getId())
                .returnUrl("https://your-site.com/api/orders/success?orderId=" + order.getId())
                .build();
    }

    private OrderDto mapToDto(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems().stream().map(this::mapToOrderItemDto).collect(Collectors.toList()))
                .shippingAddress(new ShippingAddressDto(order.getShippingAddress().getAddress()))
                .paymentInfo(mapToPaymentInfoDto(order.getPaymentInfo()))
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }

    private OrderItemDto mapToOrderItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getProductId(),
                item.getProductName(),
                item.getPrice(),
                item.getQuantity()
        );
    }

    private PaymentInfoDto mapToPaymentInfoDto(PaymentInfo paymentInfo) {
        return new PaymentInfoDto(
                paymentInfo.getId(),
                paymentInfo.getPaymentMethod(),
                paymentInfo.getPaymentStatus(),
                paymentInfo.getTransactionId(),
                paymentInfo.getPaymentLinkId(),
                paymentInfo.getCheckoutUrl(),
                paymentInfo.getPayOsOrderCode(),
                paymentInfo.getPaymentDate()
        );
    }

    @Override
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng: " + id));
        return mapToDto(order);
    }

    @Override
    public OrderDto getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng với số: " + orderNumber));
        return mapToDto(order);
    }

    @Override
    public Page<OrderDto> getOrdersByUserId(String userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(this::mapToDto);
    }

    @Override
    public List<OrderDto> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDto updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng: " + id));
        order.setStatus(request.getStatus());
        return mapToDto(orderRepository.save(order));
    }

    @Override
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng: " + id));
        order.setStatus(OrderStatus.CANCELLED);
        order.getPaymentInfo().setPaymentStatus(PaymentStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    public OrderDto createOrderFromEvent(String userId, CreateOrderRequest request) {
        return null;
    }
}