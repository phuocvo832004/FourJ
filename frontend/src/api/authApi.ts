import apiClient from './apiClient';
import { PageResponse } from '../types/api'; // Import PageResponse

// Tạm định nghĩa các type, sẽ chuyển sang src/types/auth.ts sau
type Role = { id: string; name: string; description?: string };
type Permission = { id: string; name: string; description?: string };
type UserPermission = { permissionName: string; resource?: string };
type AuthUser = { id: string; auth0Id: string; email: string; name?: string; /* các trường khác */ };
type AssignRoleRequest = { userId: string; roleName: string; };
type DeleteRoleRequest = { userId: string; roleName: string; }; // Cần xác nhận payload
type VerifyPermissionsRequest = { permissions: string[] }; // Cần xác nhận payload
type VerifyPermissionsResponse = { hasPermission: boolean };

// --- Authorization Controller ---
const authEndpoints = {
  getRoles: '/iam/roles', // Có thể là roles của user hiện tại? Hay tất cả?
  getPermissions: '/iam/permissions', // Tương tự roles
};

// --- Admin Permission Controller ---
const adminPermissionEndpoints = {
  getAllPermissions: '/iam/admin/permissions',
  createPermission: '/iam/admin/permissions',
};

// --- Admin Role Controller ---
const adminRoleEndpoints = {
  getAllRoles: '/iam/admin/roles',
  createRole: '/iam/admin/roles',
};

// --- Role Assignment Controller ---
const roleAssignmentEndpoints = {
  assignRole: '/iam/role-assignments',
  deleteRoleAssignment: '/iam/role-assignments',
};

// --- User Role Controller ---
const userRoleEndpoints = {
  getMyPermissions: '/iam/user-roles/me/user-permissions',
  getUserPermissions: (userId: string) => `/iam/user-roles/${userId}/permissions`,
  addUserRole: (userId: string, roleName: string) => `/iam/user-roles/${userId}/roles/${roleName}`,
  verifyPermissions: '/iam/user-roles/verify-permissions',
};

// --- User Controller (Auth Service) ---
const authUserEndpoints = {
  getAuthMe: '/iam/users/me',
  updateAuthMe: '/iam/users/me',
  getAuthUsers: '/iam/users', // Cần pagination
  getAuthUserByAuth0Id: (auth0Id: string) => `/iam/users/${auth0Id}`,
  deleteAuthUser: (auth0Id: string) => `/iam/users/${auth0Id}`,
};

// --- Health Controller ---
const healthEndpoints = {
  getAuthHealth: '/iam/health',
};

// --- API Functions ---

export const authApi = {
  // Authorization
  getRoles: async () => {
    // GET /api/iam/roles - Lấy danh sách vai trò
    return apiClient.get<Role[]>(authEndpoints.getRoles);
  },
  getPermissions: async () => {
    // GET /api/iam/permissions - Lấy danh sách quyền
    return apiClient.get<Permission[]>(authEndpoints.getPermissions);
  },

  // Admin Permissions
  getAllAdminPermissions: async () => {
    // GET /api/iam/admin/permissions - Lấy danh sách quyền (admin)
    return apiClient.get<Permission[]>(adminPermissionEndpoints.getAllPermissions);
  },
  createAdminPermission: async (permissionData: Omit<Permission, 'id'>) => {
    // POST /api/iam/admin/permissions - Tạo quyền mới
    return apiClient.post<Permission>(adminPermissionEndpoints.createPermission, permissionData);
  },

  // Admin Roles
  getAllAdminRoles: async () => {
    // GET /api/iam/admin/roles - Lấy danh sách vai trò (admin)
    return apiClient.get<Role[]>(adminRoleEndpoints.getAllRoles);
  },
  createAdminRole: async (roleData: Omit<Role, 'id'>) => {
    // POST /api/iam/admin/roles - Tạo vai trò mới
    return apiClient.post<Role>(adminRoleEndpoints.createRole, roleData);
  },

  // Role Assignment
  assignRoleToUser: async (assignmentData: AssignRoleRequest) => {
    // POST /api/iam/role-assignments - Gán vai trò cho người dùng
    return apiClient.post<void>(roleAssignmentEndpoints.assignRole, assignmentData);
  },
  deleteUserRoleAssignment: async (deleteData: DeleteRoleRequest) => {
    // DELETE /api/iam/role-assignments - Xóa vai trò của người dùng
    // Cần kiểm tra phương thức và payload có đúng là DELETE không
    return apiClient.delete<void>(roleAssignmentEndpoints.deleteRoleAssignment, { data: deleteData }); // Giả sử payload trong data cho DELETE
  },

  // User Roles
  getMyPermissions: async () => {
    // GET /api/iam/user-roles/me/user-permissions - Lấy quyền của người dùng hiện tại
    return apiClient.get<UserPermission[]>(userRoleEndpoints.getMyPermissions);
  },
  getUserPermissions: async (userId: string) => {
    // GET /api/iam/user-roles/{userId}/permissions - Lấy quyền của người dùng theo ID
    return apiClient.get<UserPermission[]>(userRoleEndpoints.getUserPermissions(userId));
  },
  addUserRole: async (userId: string, roleName: string) => {
    // POST /api/iam/user-roles/{userId}/roles/{roleName} - Thêm vai trò cho người dùng
    return apiClient.post<void>(userRoleEndpoints.addUserRole(userId, roleName));
  },
  verifyPermissions: async (permissions: string[]) => {
    // POST /api/iam/user-roles/verify-permissions - Xác minh quyền
    const payload: VerifyPermissionsRequest = { permissions };
    return apiClient.post<VerifyPermissionsResponse>(userRoleEndpoints.verifyPermissions, payload);
  },

  // Auth Users
  getAuthMe: async () => {
    // GET /api/iam/users/me - Lấy thông tin người dùng hiện tại (Auth Service)
    return apiClient.get<AuthUser>(authUserEndpoints.getAuthMe);
  },
  updateAuthMe: async (userData: Partial<AuthUser>) => {
    // PUT /api/iam/users/me - Cập nhật thông tin người dùng hiện tại (Auth Service)
    return apiClient.put<AuthUser>(authUserEndpoints.updateAuthMe, userData);
  },
  getAuthUsers: async (page = 0, size = 20) => { // Thêm pagination
    // GET /api/iam/users - Lấy danh sách người dùng (Auth Service)
    return apiClient.get<PageResponse<AuthUser>>(authUserEndpoints.getAuthUsers, { params: { page, size } });
  },
  getAuthUserByAuth0Id: async (auth0Id: string) => {
    // GET /api/iam/users/{auth0Id} - Lấy thông tin người dùng theo auth0Id (Auth Service)
    return apiClient.get<AuthUser>(authUserEndpoints.getAuthUserByAuth0Id(auth0Id));
  },
  deleteAuthUser: async (auth0Id: string) => {
    // DELETE /api/iam/users/{auth0Id} - Xóa người dùng (Auth Service)
    return apiClient.delete<void>(authUserEndpoints.deleteAuthUser(auth0Id));
  },

  // Health
  getAuthHealth: async () => {
    // GET /api/iam/health - Kiểm tra trạng thái hoạt động
    return apiClient.get<unknown>(healthEndpoints.getAuthHealth); // Kiểu trả về chưa rõ
  },
};

export default authApi; // Export default để tiện sử dụng 