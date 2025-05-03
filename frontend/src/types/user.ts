// src/types/user.ts

// ---- User Service DTOs ----

// DTO cho User Profile (GET /users/profile/me, GET /users/profile/{auth0Id})
export interface UserProfile {
  id: string; // Hoặc number? Kiểm tra backend
  auth0Id: string;
  email: string;
  name?: string;
  givenName?: string; // Từ Auth0
  familyName?: string; // Từ Auth0
  picture?: string; // Từ Auth0
  phoneNumber?: string;
  address?: string; // Địa chỉ đầy đủ? Hay cần tách?
  // Thêm các trường profile khác nếu có
  createdAt?: string;
  updatedAt?: string;
}

// DTO cho cập nhật User Profile (PUT /users/profile/me)
// Thường chỉ chứa các trường có thể cập nhật
export interface UpdateUserProfileDto {
  name?: string;
  phoneNumber?: string;
  address?: string;
  picture?: string; // Có cho cập nhật ảnh đại diện không?
}

// DTO cho Seller Profile (GET /users/seller/profile)
export interface SellerProfile {
  id: string; // ID của seller profile, khác với user ID
  userId: string; // ID user tương ứng
  auth0Id: string; // Auth0 ID của user
  shopName: string;
  description?: string;
  logoUrl?: string;
  address: string; // Địa chỉ shop
  phoneNumber: string; // SĐT shop
  email: string; // Email liên hệ shop
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'; // Trạng thái xác minh
  rating?: number; // Điểm đánh giá trung bình
  // Thêm các trường seller profile khác nếu có
  createdAt?: string;
  updatedAt?: string;
}

// DTO cho cập nhật Seller Profile (PUT /users/seller/profile)
export interface UpdateSellerProfileDto {
  shopName?: string;
  description?: string;
  logoUrl?: string; // Hoặc gửi File?
  address?: string;
  phoneNumber?: string;
  email?: string;
}

// DTO cho đăng ký Seller (POST /users/seller/register)
export interface SellerRegistrationData {
  shopName: string;
  description?: string;
  address: string;
  phoneNumber: string;
  email: string; // Nên lấy từ user hiện tại?
  // Thông tin bổ sung có thể cần: businessLicense, taxId, bankAccount...
  logoFile?: File; // Nếu cho upload logo khi đăng ký
}

// DTO cho trạng thái xác minh Seller (GET /users/seller/verification-status)
export interface SellerVerificationStatusDto {
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_REGISTERED';
  message?: string; // Lý do từ chối (nếu có)
}

// DTO hiển thị User cho Admin (GET /users/admin, GET /users/admin/{id}, ...)
// Thường chứa thông tin tổng hợp từ User Profile và có thể cả Seller Profile
export interface AdminUserView {
  id: string; // User ID
  auth0Id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  address?: string;
  roles?: string[]; // Danh sách role của user
  isSeller: boolean;
  sellerVerificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'; // Nếu là seller
  createdAt?: string;
  lastLogin?: string; // Nếu có
  isActive?: boolean; // Trạng thái user (active/inactive)
}

// DTO cho tìm kiếm User (GET /users/admin/search)
export interface UserSearchParams {
  query?: string; // Tìm theo email, name, phone?
  role?: string;
  isSeller?: boolean;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isActive?: boolean;
  // Thêm các tham số tìm kiếm khác
} 