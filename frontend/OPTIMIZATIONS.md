# Tối ưu hóa Codebase Frontend

## Các cải tiến đã thực hiện

### 1. Tái cấu trúc và loại bỏ code trùng lặp

- **Components Fragments**: Tạo thư mục `components/fragments` để tái sử dụng các UI fragments thường xuyên sử dụng.
  - `ButtonVariants.tsx`: Cung cấp các biến thể button khác nhau (Primary, Secondary, Ghost, v.v.)
  - `InputVariants.tsx`: Cung cấp các biến thể input khác nhau (Labeled, Quantity, Price, Search)
  - `CardVariants.tsx`: Cung cấp các biến thể card khác nhau (ProductCard, InfoCard, ActionCard, v.v.)

- **Card Component**: Cải tiến Card component để hỗ trợ composition pattern với các subcomponents (Header, Body, Footer)

### 2. Quản lý log và debug

- **Logger Service**: Tạo một lớp `Logger` trong `utils/logger.ts` để thay thế tất cả các console.log trực tiếp, giúp:
  - Kiểm soát xuất hiện của log dựa trên môi trường (dev/prod)
  - Dễ dàng lọc và tìm kiếm log
  - Định dạng log nhất quán
  - Bổ sung thông tin ngữ cảnh (module gọi log)

- **Loại bỏ Debug Log**: Đã loại bỏ các debug log không cần thiết trong `apiClient.ts`

### 3. Mock API Management

- **MockService**: Tạo service quản lý mock API trong `api/mock/MockService.ts`
  - Kiểm soát việc sử dụng mock data thông qua config
  - Hỗ trợ mô phỏng độ trễ và lỗi
  - Có thể bật/tắt mock API từ browser console
  - Tách biệt dữ liệu mock khỏi code logic

- **Mock Data**: Tập trung dữ liệu mock trong `api/mock/mockData.ts` thay vì rải rác trong các components

### 4. Service Layers

- **HTTP Service**: Tạo lớp `HttpService` để xử lý các request HTTP, hỗ trợ:
  - Error handling nhất quán
  - Refresh token tự động
  - Interceptors
  - Type safety với TypeScript
  - Chuẩn hóa API responses

- **Notification Service**: Tạo service `NotificationService` thống nhất cách hiển thị thông báo
  - Sử dụng Adapter pattern để dễ dàng thay đổi thư viện hiển thị
  - Singleton để đảm bảo quản lý thống nhất
  - Cung cấp các helper methods để xử lý các trường hợp thông báo phổ biến

### 5. Design Patterns

- **Adapter Pattern**: Sử dụng trong NotificationService để trừu tượng hóa cách hiển thị thông báo
- **Singleton Pattern**: Áp dụng cho các services để đảm bảo chỉ một instance tồn tại
- **Composition Pattern**: Sử dụng trong Card component để tạo UI linh hoạt
- **Factory Pattern**: Áp dụng trong Logger để tạo các instance logger
- **Repository Pattern**: Tái cấu trúc các API calls để trừu tượng hóa nguồn dữ liệu

### 6. Tối ưu Performance

- **Lazy Loading**: Tạo utility (`src/utils/lazyLoad.tsx`) để lazy load components:
  - Cải thiện tải trang lần đầu
  - Tránh tải code không cần thiết
  - Hỗ trợ code splitting

- **Caching Mechanism**: Cải thiện cơ chế caching với custom hook (`src/hooks/useCachingQuery.ts`):
  - Tích hợp với React Query để quản lý cache
  - Kiểm soát stale time và cache time
  - Hỗ trợ prefetching và pagination

### 7. Quản lý State và API

- **Repository Pattern**: Tạo layer trung gian giữa API và UI components:
  - Đóng gói logic truy cập dữ liệu
  - Chuẩn hóa việc gọi API
  - Dễ dàng mock dữ liệu cho testing

- **Custom Hooks**: Tạo các hooks như `useRepository` để đơn giản hóa việc tương tác với API:
  - Xử lý loading states
  - Xử lý errors
  - Cung cấp data cần thiết theo format UI cần

- **Error Boundary**: Thêm ErrorBoundary component (`src/components/common/ErrorBoundary.tsx`):
  - Bắt và xử lý lỗi React
  - Hiển thị UI fallback thân thiện với người dùng
  - Cung cấp chức năng thử lại (retry)

### 8. Sử dụng dữ liệu thống nhất

- **Domain Models**: Tạo BaseModel và các model cụ thể:
  - Chuẩn hóa dữ liệu trong toàn bộ ứng dụng
  - Phân tách concerns giữa dữ liệu API và dữ liệu UI
  - Thêm business logic vào model

- **Type Safety**: Cải thiện type safety với TypeScript:
  - Explicit types cho API responses
  - Generic types cho repositories và hooks
  - Type checking chặt chẽ để tránh bugs

- **Mappers**: Tạo mappers để chuyển đổi dữ liệu API thành domain models:
  - Chuẩn hóa dữ liệu từ các endpoints khác nhau
  - Xử lý thiếu sót dữ liệu
  - Định dạng dữ liệu phức tạp (dates, currency, etc.)

## Cải tiến tiếp theo

### 1. Testing và Documentation

- Unit tests cho các components và services
- Storybook cho UI components
- End-to-end tests cho các flow quan trọng
- API documentation

### 2. Accessibility và Internationalization

- Audit và cải thiện accessibility
- I18n support
- RTL support cho các ngôn ngữ đọc từ phải sang trái
- Color contrast và keyboard navigation

### 3. Build Optimization

- Bundle size analysis và optimization
- Tree shaking
- Code splitting theo functionality
- Service worker và offline support 