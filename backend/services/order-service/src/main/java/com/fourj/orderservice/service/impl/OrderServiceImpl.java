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
import vn.payos.type.*;
import com.fourj.orderservice.util.DateTimeUtil;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
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
            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new EmptyCartException("Danh sách sản phẩm không được để trống");
            }

            for (OrderItemDto item : request.getItems()) {
                ProductDto productInfo = productClient.getProductById(String.valueOf(item.getProductId())).block();
                if (productInfo == null) {
                    throw new ProductNotFoundException("Không tìm thấy sản phẩm: " + item.getProductId());
                }
                if (!productInfo.getPrice().equals(item.getPrice())) {
                    throw new PriceDiscrepancyException("Giá sản phẩm " + item.getProductName() + " đã thay đổi");
                }

                if (productInfo.getStockQuantity() < item.getQuantity()) {
                    throw new InsufficientStockException("Sản phẩm " + item.getProductName() + " không đủ số lượng");
                }
            }

            List<OrderItem> orderItems = request.getItems().stream()
                    .map(item -> OrderItem.builder()
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .productImage(null) // nếu không có trong request, bạn để null hoặc fetch từ ProductService
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .order(null) // sẽ được set sau khi tạo Order
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
        String orderNumber;
        do {
            orderNumber = generateRandom6Digits();
        } while (orderRepository.findByOrderNumber(orderNumber).isPresent());
        return orderNumber;
    }

    private String generateRandom6Digits() {
        int number = new Random().nextInt(900000) + 100000; // từ 100000 đến 999999
        return String.valueOf(number);
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
                .orderCode(Long.parseLong(order.getOrderNumber()))
                .amount(order.getTotalAmount().intValue())
//                .amount(10000)
                .description("Đơn hàng #" + order.getOrderNumber())
                .items(items)
                .cancelUrl("http://localhost:80/checkout/orders/cancel?orderId=" + order.getId())
                .returnUrl("http://localhost:80/checkout/orders/success?orderId=" + order.getId())
                .expiredAt((System.currentTimeMillis() / 1000) + 5 * 60)
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
                .createdAt(DateTimeUtil.toVietnamDateTime(order.getCreatedAt()))
                .updatedAt(DateTimeUtil.toVietnamDateTime(order.getUpdatedAt()))
                .completedAt(DateTimeUtil.toVietnamDateTime(order.getCompletedAt()))
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
                DateTimeUtil.toVietnamDateTime(paymentInfo.getPaymentDate())
        );
    }

    @Override
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng: " + id));
        return mapToDto(order);
    }

    @Override
    public Order getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng với số: " + orderNumber));
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
    public OrderDto cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng: " + id));
        
        // Nếu đơn hàng có phương thức thanh toán không phải là COD và có paymentLinkId
        // thì cần hủy link thanh toán trên PayOS
        if (order.getPaymentInfo().getPaymentMethod() != PaymentMethod.COD && 
                order.getPaymentInfo().getPaymentLinkId() != null) {
            try {
                // Gọi API hủy link thanh toán trên PayOS
                log.info("Hủy link thanh toán PayOS cho đơn hàng: {}, paymentLinkId: {}", 
                        order.getId(), order.getPaymentInfo().getPaymentLinkId());
                payOS.cancelPaymentLink(Long.parseLong(order.getPaymentInfo().getPaymentLinkId()), "Order cancelled by user");
            } catch (Exception e) {
                log.error("Không thể hủy link thanh toán PayOS: {}", e.getMessage());
                // Vẫn tiếp tục hủy đơn hàng trong hệ thống ngay cả khi không hủy được trên PayOS
            }
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.getPaymentInfo().setPaymentStatus(PaymentStatus.CANCELLED);
        order = orderRepository.save(order);
        return mapToDto(order);
    }

    @Override
    public OrderDto createOrderFromEvent(String userId, CreateOrderRequest request) {
        try {
            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new EmptyCartException("Danh sách sản phẩm không được để trống");
            }

            List<OrderItem> orderItems = request.getItems().stream()
                    .map(item -> OrderItem.builder()
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .build())
                    .collect(Collectors.toList());

            // Tạo entity Order
            Order order = new Order();
            order.setUserId(userId);
            order.setOrderNumber(generateOrderNumber());
            order.setStatus(OrderStatus.PENDING);
            order.setTotalAmount(calculateTotalAmount(orderItems));
            order.setShippingAddress(new ShippingAddress(request.getShippingAddress()));
            order.setPaymentInfo(new PaymentInfo(null, PaymentMethod.valueOf(request.getPaymentMethod()), PaymentStatus.PENDING, null, null, null, null, null));
            order.setNotes(request.getNotes());

            // Gán order cho các OrderItem
            orderItems.forEach(item -> item.setOrder(order));
            order.setItems(orderItems);

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
                // Tạo thanh toán cho các phương thức khác
                PaymentData paymentData = createPaymentData(savedOrder);
                try {
                    CheckoutResponseData response = payOS.createPaymentLink(paymentData);

                    // Cập nhật PaymentInfo
                    PaymentInfo paymentInfo = savedOrder.getPaymentInfo();
                    paymentInfo.setPaymentLinkId(response.getPaymentLinkId());
                    paymentInfo.setCheckoutUrl(response.getCheckoutUrl());
                    paymentInfo.setPayOsOrderCode(response.getOrderCode());
                    orderRepository.save(savedOrder);
                } catch (Exception e) {
                    log.error("Lỗi khi tạo link thanh toán cho đơn hàng: {}", savedOrder.getId(), e);
                    throw new OrderCreationException("Không thể tạo link thanh toán", e);
                }
            }

            // Trả về OrderDto
            return mapToDto(savedOrder);

        } catch (Exception e) {
            log.error("Lỗi khi tạo đơn hàng từ sự kiện cho user {}: {}", userId, e.getMessage());
            throw new OrderCreationException("Tạo đơn hàng thất bại: " + e.getMessage(), e);
        }
    }

    @Override
    public void updateOrder(WebhookData data) {
        try {
            log.info("Đang cập nhật đơn hàng từ webhook PayOS: {}", data.getOrderCode());
            Order order = getOrderByOrderNumber(data.getOrderCode().toString());

            // Lưu trạng thái cũ để ghi log
            OrderStatus oldStatus = order.getStatus();
            PaymentStatus oldPaymentStatus = order.getPaymentInfo().getPaymentStatus();

            // Cập nhật thông tin thanh toán
            PaymentInfo paymentInfo = order.getPaymentInfo();
            paymentInfo.setTransactionId(data.getReference());
            
            // Không cần đặt paymentDate ở đây vì sẽ được đặt trong các phương thức chuyên biệt

            // Xác định trạng thái từ mã code
            String code = data.getCode();
            log.info("Nhận mã code từ PayOS: {} cho đơn hàng {}", code, data.getOrderCode());

            if ("00".equals(code)) {
                // Thanh toán thành công
                paymentInfo.setPaymentComplete(); // Sử dụng phương thức mới
                order.setStatus(OrderStatus.PROCESSING);
                log.info("Thanh toán thành công cho đơn hàng: {}", order.getOrderNumber());
            } else if ("99".equals(code) || "98".equals(code)) {
                // Thanh toán bị hủy (99) hoặc hết hạn (98)
                paymentInfo.setPaymentStatus(PaymentStatus.CANCELLED);
                order.setStatus(OrderStatus.CANCELLED);
                log.info("Thanh toán bị hủy cho đơn hàng: {}", order.getOrderNumber());
            } else {
                // Các mã khác, log để kiểm tra
                log.warn("Nhận mã code không xử lý: {} cho đơn hàng {}", code, data.getOrderCode());
            }

            // Lưu và ghi log chi tiết
            Order savedOrder = orderRepository.save(order);
            log.info("Đã cập nhật đơn hàng #{} từ status={} thành {} và payment từ {} thành {}",
                    order.getOrderNumber(), oldStatus, savedOrder.getStatus(),
                    oldPaymentStatus, savedOrder.getPaymentInfo().getPaymentStatus());
        } catch (OrderNotFoundException e) {
            log.error("Không tìm thấy đơn hàng từ webhook: {}", data.getOrderCode());
        } catch (Exception e) {
            log.error("Lỗi khi xử lý webhook PayOS: {}", e.getMessage(), e);
        }
    }

    @Override
    public Page<OrderDto> getOrdersByUserIdAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Tìm đơn hàng từ {} đến {} cho user {}", startDate, endDate, userId);
        return orderRepository.findByUserIdAndCreatedAtBetween(userId, startDate, endDate, pageable)
                .map(this::mapToDto);
    }
}