(async function() {
    try {
      // Kiểm tra xem đã đăng nhập chưa bằng cách tìm key Auth0 trong localStorage
      const keys = Object.keys(localStorage);
      const auth0Keys = keys.filter(key => key.includes('auth0'));
      
      if (auth0Keys.length > 0) {
        console.log('Các key Auth0 trong localStorage:', auth0Keys);
        
        // Đối với Auth0 React SDK phiên bản mới, token thường được lưu với key có dạng auth0.{clientId}.is.authenticated
        const accessTokenKey = keys.find(key => key.includes('@@auth0spajs@@'));
        
        if (accessTokenKey) {
          const tokenData = JSON.parse(localStorage.getItem(accessTokenKey));
          console.log('Đã tìm thấy dữ liệu token:', tokenData);
          
          if (tokenData && tokenData.body && tokenData.body.access_token) {
            const token = tokenData.body.access_token;
            
            console.log('%c===== JWT TOKEN FOR POSTMAN =====', 'background: #222; color: #bada55; font-size: 16px; font-weight: bold;');
            console.log('%cToken:', 'color: #bada55; font-weight: bold;');
            console.log(token);
            console.log('%cAuthorization header:', 'color: #bada55; font-weight: bold;');
            console.log('%cBearer ' + token, 'color: #bada55;');
            console.log('%c=================================', 'background: #222; color: #bada55; font-size: 16px; font-weight: bold;');
            
            // Copy vào clipboard
            await navigator.clipboard.writeText('Bearer ' + token);
            console.log('Đã copy token vào clipboard!');
            return;
          }
        }
        
        // Thử một cách khác
        console.log('Không tìm thấy token trực tiếp, hãy kiểm tra từng key');
        for (const key of auth0Keys) {
          const value = localStorage.getItem(key);
          try {
            const parsed = JSON.parse(value);
            console.log(`Key: ${key}`, parsed);
          } catch (e) {
            console.log(`Key: ${key}`, value);
          }
        }
      } else {
        console.log('Không tìm thấy dữ liệu Auth0 trong localStorage. Bạn cần đăng nhập trước.');
      }
    } catch (e) {
      console.error('Lỗi:', e);
    }
  })();