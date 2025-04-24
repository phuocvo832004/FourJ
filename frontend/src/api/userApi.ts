import apiClient from './apiClient';
// import { UserProfile, SellerProfile, AdminUserView } from '../types/user'; // Tạm comment lại
import { PageResponse } from '../types/api'; // Giả sử type này đã có

// Tạm định nghĩa type ở đây, sẽ chuyển sang src/types/user.ts sau
type UserProfile = unknown;
type SellerProfile = unknown;
type AdminUserView = unknown;
type SellerRegistrationData = { [key: string]: unknown }; // Dùng unknown cho value
type UserSearchParams = { [key: string]: unknown }; // Dùng unknown cho value


// User Profile Endpoints
const userProfileEndpoints = {
  getMyProfile: '/users/profile/me',
  updateMyProfile: '/users/profile/me',
  getUserProfile: (auth0Id: string) => `/users/profile/${auth0Id}`,
  getAllProfiles: '/users/profile', // Có thể cần pagination
  deleteProfile: (auth0Id: string) => `/users/profile/${auth0Id}`,
};

// Seller Profile Endpoints
const sellerProfileEndpoints = {
  getSellerProfile: '/users/seller/profile',
  updateSellerProfile: '/users/seller/profile',
  registerSeller: '/users/seller/register',
  getVerificationStatus: '/users/seller/verification-status',
};

// Admin User Endpoints
const adminUserEndpoints = {
  getAllUsers: '/users/admin', // Cần pagination
  searchUsers: '/users/admin/search', // Cần params
  getUserById: (id: string) => `/users/admin/${id}`,
  getUserByAuth0Id: (auth0Id: string) => `/users/admin/auth0/${auth0Id}`,
  getAllSellers: '/users/admin/sellers', // Cần pagination
  getPendingSellers: '/users/admin/sellers/pending-verification', // Cần pagination
  verifySellerById: (id: string) => `/users/admin/sellers/${id}/verify`,
  verifySellerByAuth0Id: (auth0Id: string) => `/users/admin/sellers/auth0/${auth0Id}/verify`,
  deleteUser: (auth0Id: string) => `/users/admin/${auth0Id}`,
};

// --- User Profile API Functions ---
export const userProfileApi = {
  getMyProfile: async () => {
    return apiClient.get<UserProfile>(userProfileEndpoints.getMyProfile);
  },
  updateMyProfile: async (profileData: Partial<UserProfile>) => {
    return apiClient.put<UserProfile>(userProfileEndpoints.updateMyProfile, profileData);
  },
  getUserProfile: async (auth0Id: string) => {
    return apiClient.get<UserProfile>(userProfileEndpoints.getUserProfile(auth0Id));
  },
  getAllProfiles: async (page = 0, size = 20) => { // Thêm pagination
    return apiClient.get<PageResponse<UserProfile>>(userProfileEndpoints.getAllProfiles, { params: { page, size } });
  },
  deleteProfile: async (auth0Id: string) => { // Endpoint này có vẻ trùng với admin delete? Xác nhận lại
    return apiClient.delete<void>(userProfileEndpoints.deleteProfile(auth0Id));
  },
};

// --- Seller Profile API Functions ---
export const sellerProfileApi = {
  getSellerProfile: async () => {
    // GET /api/users/seller/profile - Lấy thông tin hồ sơ người bán
    return apiClient.get<SellerProfile>(sellerProfileEndpoints.getSellerProfile);
  },
  updateSellerProfile: async (profileData: Partial<SellerProfile>) => {
    // PUT /api/users/seller/profile - Cập nhật thông tin hồ sơ người bán
    return apiClient.put<SellerProfile>(sellerProfileEndpoints.updateSellerProfile, profileData);
  },
  registerSeller: async (registrationData: SellerRegistrationData) => { // Sử dụng type object
    // POST /api/users/seller/register - Đăng ký làm người bán
    return apiClient.post<SellerProfile>(sellerProfileEndpoints.registerSeller, registrationData);
  },
  getVerificationStatus: async () => {
    // GET /api/users/seller/verification-status - Kiểm tra trạng thái xác minh
    return apiClient.get<{ status: string }>(sellerProfileEndpoints.getVerificationStatus); // Giả sử trả về { status: 'PENDING' | 'VERIFIED' | ... }
  },
};

// --- Admin User API Functions ---
export const adminUserApi = {
  getAllUsers: async (page = 0, size = 20) => {
    // GET /api/users/admin - Lấy danh sách người dùng (dành cho admin)
    return apiClient.get<PageResponse<AdminUserView>>(adminUserEndpoints.getAllUsers, { params: { page, size } });
  },
  searchUsers: async (queryParams: UserSearchParams, page = 0, size = 20) => { // Sử dụng type object
    // GET /api/users/admin/search - Tìm kiếm người dùng
    // Giờ đây có thể spread queryParams một cách an toàn
    return apiClient.get<PageResponse<AdminUserView>>(adminUserEndpoints.searchUsers, { params: { ...queryParams, page, size } });
  },
  getUserById: async (id: string) => {
    // GET /api/users/admin/{id} - Lấy thông tin người dùng theo ID
    return apiClient.get<AdminUserView>(adminUserEndpoints.getUserById(id));
  },
  getUserByAuth0Id: async (auth0Id: string) => {
    // GET /api/users/admin/auth0/{auth0Id} - Lấy thông tin người dùng theo auth0Id
    return apiClient.get<AdminUserView>(adminUserEndpoints.getUserByAuth0Id(auth0Id));
  },
  getAllSellers: async (page = 0, size = 20) => {
    // GET /api/users/admin/sellers - Lấy danh sách người bán
    return apiClient.get<PageResponse<AdminUserView>>(adminUserEndpoints.getAllSellers, { params: { page, size } }); // Giả sử trả về cùng kiểu AdminUserView
  },
  getPendingSellers: async (page = 0, size = 20) => {
    // GET /api/users/admin/sellers/pending-verification - Lấy danh sách người bán đang chờ xác minh
    return apiClient.get<PageResponse<AdminUserView>>(adminUserEndpoints.getPendingSellers, { params: { page, size } }); // Giả sử trả về cùng kiểu AdminUserView
  },
  verifySellerById: async (id: string) => {
    // PUT /api/users/admin/sellers/{id}/verify - Xác minh người bán theo ID
    return apiClient.put<void>(adminUserEndpoints.verifySellerById(id));
  },
  verifySellerByAuth0Id: async (auth0Id: string) => {
    // PUT /api/users/admin/sellers/auth0/{auth0Id}/verify - Xác minh người bán theo auth0Id
    return apiClient.put<void>(adminUserEndpoints.verifySellerByAuth0Id(auth0Id));
  },
  deleteUser: async (auth0Id: string) => {
    // DELETE /api/users/admin/{auth0Id} - Xóa người dùng
    return apiClient.delete<void>(adminUserEndpoints.deleteUser(auth0Id));
  },
}; 