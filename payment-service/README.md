# Payment Service

Service xử lý thanh toán tích hợp với cổng thanh toán PayOS.

## Cấu hình

Service sử dụng các biến môi trường sau:

- `PAYOS_CLIENT_ID`: Client ID từ PayOS
- `PAYOS_API_KEY`: API key từ PayOS
- `PAYOS_CHECKSUM_KEY`: Checksum key từ PayOS

## API Endpoints

### Tạo thanh toán mới
```
POST /api/v1/payments
Request Body:
{
  "orderId": "ID của đơn hàng",
  "amount": "Số tiền thanh toán",
  "currency": "Loại tiền tệ"
}
```

### Xử lý thanh toán
```
POST /api/v1/payments/{orderId}/process
```

### Lấy thông tin thanh toán theo Order ID
```
GET /api/v1/payments/order/{orderId}
```

### Lấy thông tin thanh toán theo PayOS Transaction ID
```
GET /api/v1/payments/payos/{payosTransactionId}
```

### Callback từ PayOS
```
POST /api/v1/payments/payos/callback
Query Parameters:
- paymentId: ID giao dịch từ PayOS
- status: Trạng thái thanh toán (COMPLETED/FAILED/CANCELLED)
```

## Các trạng thái thanh toán

- `PENDING`: Chờ xử lý
- `PROCESSING`: Đang xử lý
- `COMPLETED`: Hoàn thành
- `FAILED`: Thất bại
- `REFUNDED`: Đã hoàn tiền

## Cài đặt và chạy

1. Cài đặt các dependencies:
```bash
mvn clean install
```

2. Cấu hình các biến môi trường trong file `application.yml`

3. Chạy service:
```bash
mvn spring-boot:run
```

Service sẽ chạy trên port 8082. 