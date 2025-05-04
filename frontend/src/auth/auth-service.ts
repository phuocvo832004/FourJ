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
    console.log("Exchanging code for token...");
    
    // Gọi API cụ thể không dùng biến config
    const response = await axios.post(`http://localhost/api/iam/auth/callback`, {
      code,
      redirect_uri: auth0Config.redirectUri,
      client_id: auth0Config.clientId
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log("Token exchange response:", response.data);
    
    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      
      if (response.data.expires_in) {
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);
      } else {
        tokenExpiryTime = Date.now() + 60 * 60 * 1000;
      }
      
      return accessToken;
    }
    return null;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    // Thêm thông tin chi tiết về lỗi
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        url: error.config?.url
      });
    }
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