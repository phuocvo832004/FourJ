// src/types/auth.ts

// ---- IAM Service DTOs ----

// DTO cho Role (GET /auth/roles, GET /auth/admin/roles)
export interface Role {
  id: string; // Hoặc number?
  name: string; // Ví dụ: "ADMIN", "SELLER", "CUSTOMER"
  description?: string;
  // Có thể có danh sách permissions liên quan
}

// DTO cho Permission (GET /auth/permissions, GET /auth/admin/permissions)
export interface Permission {
  id: string; // Hoặc number?
  name: string; // Ví dụ: "product:create", "order:read", "user:manage"
  description?: string;
}

// DTO cho User Permission (GET /auth/user-roles/me/user-permissions, ...)
export interface UserPermission {
  permissionName: string;
  resourceId?: string; // ID của tài nguyên cụ thể nếu có (ví dụ: orderId)
  resourceType?: string; // Loại tài nguyên (ví dụ: "Order", "Product")
}

// DTO cho User trong Auth Service (GET /auth/users/me, GET /auth/users, ...)
// Khác với UserProfile ở User Service, có thể chỉ chứa thông tin cơ bản từ provider
export interface AuthUser {
  id: string; // User ID trong hệ thống của bạn
  auth0Id: string; // ID từ Auth0 (subject)
  email: string;
  emailVerified?: boolean;
  name?: string; // Full name
  nickname?: string; // Username/nickname
  picture?: string; // URL ảnh đại diện
  createdAt?: string; // Thời gian tạo user trong Auth0/hệ thống
  updatedAt?: string; // Thời gian cập nhật user trong Auth0/hệ thống
  // Có thể có thêm custom metadata từ Auth0
}

// DTO cho gán Role (POST /auth/role-assignments)
export interface AssignRoleRequest {
  userId: string; // User ID trong hệ thống
  roleName: string; // Tên role cần gán
}

// DTO cho xóa Role (DELETE /auth/role-assignments)
// Backend yêu cầu payload thế nào? Chỉ userId và roleName?
export interface DeleteRoleAssignmentRequest {
  userId: string;
  roleName: string;
}

// DTO cho yêu cầu xác minh quyền (POST /auth/user-roles/verify-permissions)
export interface VerifyPermissionsRequest {
  permissions: string[]; // Danh sách tên quyền cần kiểm tra
  resourceId?: string; // Optional: ID tài nguyên cụ thể
  resourceType?: string; // Optional: Loại tài nguyên
}

// DTO cho kết quả xác minh quyền (POST /auth/user-roles/verify-permissions)
export interface VerifyPermissionsResponse {
  hasPermission: boolean; // User có đủ quyền không?
  missingPermissions?: string[]; // Danh sách quyền bị thiếu (nếu có)
} 