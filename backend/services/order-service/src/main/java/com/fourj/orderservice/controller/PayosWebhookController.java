package com.fourj.orderservice.controller;

import com.fourj.orderservice.OrderServiceApplication;
import com.fourj.orderservice.model.Order;
import com.fourj.orderservice.repository.OrderRepository;
import com.fourj.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PayosWebhookController {

    private final PayOS payOS; // Được khởi tạo ở cấu hình
    private OrderService orderService;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Webhook webhookBody) {
        log.info("webhook body: {}", webhookBody);
        try {
            // ✅ Xác thực payload từ PayOS
            WebhookData data = payOS.verifyPaymentWebhookData(webhookBody);
            log.info("webhook data: {}", toString(data));
//            orderService.updateOrder(data);
            // ✅ Lấy thông tin đơn hàng
//            Long orderCode = data.getOrderCode();
//            String status = data.getStatus(); // PAID, CANCELLED, etc.


            // 📝 Gọi Order Service để cập nhật trạng thái đơn hàng
            // orderService.updateOrderStatus(orderCode, status); // Tùy bạn triển khai

            return ResponseEntity.ok("Webhook received");
        } catch (Exception e) {
            System.out.println("❌ Webhook không hợp lệ: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid webhook");
        }
    }
    public String toString(WebhookData webhookData) {
        return "WebhookData(" + "orderCode=" + webhookData.getOrderCode() + ", amount=" + webhookData.getAmount() + ", description=" + webhookData.getDescription() + ", accountNumber=" + webhookData.getAccountNumber() + ", reference=" + webhookData.getReference() + ", transactionDateTime=" + webhookData.getTransactionDateTime() + ", currency=" + webhookData.getCurrency() + ", paymentLinkId=" + webhookData.getPaymentLinkId() + ", code=" + webhookData.getCode() + ", desc=" + webhookData.getDesc() + ", counterAccountBankId=" + webhookData.getCounterAccountBankId() + ", counterAccountBankName=" + webhookData.getCounterAccountBankName() + ", counterAccountName=" + webhookData.getCounterAccountName() + ", counterAccountNumber=" + webhookData.getCounterAccountNumber() + ", virtualAccountName=" + webhookData.getVirtualAccountName() + ", virtualAccountNumber=" + webhookData.getVirtualAccountNumber() + ")";
    }
}
