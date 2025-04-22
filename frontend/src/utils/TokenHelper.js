// Chuyển từ IIFE sang export function để có thể gọi khi cần
export const showTokenHelper = async (forceLog = false) => {
  try {
    // Nếu không yêu cầu log, không thực hiện gì cả
    if (!forceLog) return;
    
    // Kiểm tra xem đã đăng nhập chưa bằng cách tìm key Auth0 trong localStorage
    const keys = Object.keys(localStorage);
    const auth0Keys = keys.filter(key => key.includes('auth0'));
    
    if (auth0Keys.length > 0) {
      // Đối với Auth0 React SDK phiên bản mới, token thường được lưu với key có dạng auth0.{clientId}.is.authenticated
      const accessTokenKey = keys.find(key => key.includes('@@auth0spajs@@'));
      
      if (accessTokenKey) {
        const tokenData = JSON.parse(localStorage.getItem(accessTokenKey));
        
        if (tokenData && tokenData.body && tokenData.body.access_token) {
          const token = tokenData.body.access_token;
          
          // Copy vào clipboard
          await navigator.clipboard.writeText('Bearer ' + token);
          return;
        }
      }
      
      // Thử một cách khác
      for (const key of auth0Keys) {
        const value = localStorage.getItem(key);
        try {
          JSON.parse(value);
        } catch (e) {
          // Không làm gì
        }
      }
    } else {
      console.log('Không tìm thấy dữ liệu Auth0 trong localStorage. Bạn cần đăng nhập trước.');
    }
  } catch (e) {
    console.error('Lỗi:', e);
  }
};

// Không tự động thực thi khi import
// Sử dụng: import { showTokenHelper } from './utils/TokenHelper'; showTokenHelper(true);