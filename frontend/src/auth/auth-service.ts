// Auth Service - Singleton để quản lý token và trạng thái auth
// Được thiết kế để làm cầu nối giữa Auth0 SDK (React hooks) và các service khác như apiClient
import axios from 'axios';
import { auth0Config } from './auth0-config';

let accessToken: string | null = null;
let tokenExpiryTime: number | null = null;

// Thời gian buffer trước khi token hết hạn (30 giây)
const TOKEN_EXPIRY_BUFFER = 30 * 1000;

// Callback để lấy token mới từ Auth0 SDK
let getAccessTokenCallback: (() => Promise<string | null>) | null = null;

// Function để đăng ký callback từ auth-hooks.ts
export const registerAuthCallback = (callback: () => Promise<string | null>) => {
  getAccessTokenCallback = callback;
};

// Hàm trao đổi code với token thông qua backend
export const exchangeCodeForToken = async (code: string): Promise<string | null> => {
  try {
    // Gọi API của backend để trao đổi code lấy token
    const response = await axios.post(`${auth0Config.audience}${auth0Config.kongAuthEndpoint}/token`, {
      code,
      redirect_uri: auth0Config.redirectUri,
      client_id: auth0Config.clientId
    });
    
    if (response.data && response.data.access_token) {
      // Lưu token và thời gian hết hạn
      accessToken = response.data.access_token;
      
      // Tính toán thời gian hết hạn từ expires_in (số giây)
      if (response.data.expires_in) {
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);
      } else {
        // Mặc định 1 giờ nếu không có expires_in
        tokenExpiryTime = Date.now() + 60 * 60 * 1000;
      }
      
      return accessToken;
    }
    return null;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
};

// Function để kiểm tra và lấy token hiện tại hoặc lấy token mới nếu cần
export const getToken = async (): Promise<string | null> => {
  // Kiểm tra xem token có tồn tại và còn hạn không
  const now = Date.now();
  if (accessToken && tokenExpiryTime && now < tokenExpiryTime - TOKEN_EXPIRY_BUFFER) {
    return accessToken;
  }

  // Nếu không có callback đăng ký, không thể lấy token
  if (!getAccessTokenCallback) {
    console.error('No auth callback registered. Call registerAuthCallback first.');
    return null;
  }

  try {
    // Lấy token mới
    const token = await getAccessTokenCallback();
    if (token) {
      accessToken = token;
      // Giả định token có thời hạn 1 giờ từ thời điểm hiện tại
      // Trong thực tế, bạn nên decode JWT để lấy thời gian hết hạn chính xác
      tokenExpiryTime = now + 60 * 60 * 1000; 
    }
    return token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    // Xóa token cũ nếu có lỗi
    accessToken = null;
    tokenExpiryTime = null;
    return null;
  }
};

// Xóa token khi người dùng đăng xuất
export const clearToken = () => {
  accessToken = null;
  tokenExpiryTime = null;
};

// Kiểm tra xem đã có token hay chưa (không kiểm tra tính hợp lệ)
export const hasToken = (): boolean => {
  return !!accessToken;
}; 