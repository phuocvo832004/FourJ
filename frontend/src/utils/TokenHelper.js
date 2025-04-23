const showTokenHelper = async (forceLog = false) => {
  try {
    // Nếu không yêu cầu log, không làm gì
    if (!forceLog) return;

    const keys = Object.keys(localStorage);
    const auth0Keys = keys.filter(key => key.includes('auth0'));

    if (auth0Keys.length === 0) {
      console.warn('⚠️ Không tìm thấy dữ liệu Auth0 trong localStorage. Bạn cần đăng nhập trước.');
      return;
    }

    // Tìm access token trong key có chứa @@auth0spajs@@ (cách Auth0 lưu token)
    const tokenKey = keys.find(key => key.includes('@@auth0spajs@@'));
    if (tokenKey) {
      const tokenDataRaw = localStorage.getItem(tokenKey);
      if (!tokenDataRaw) {
        console.warn('⚠️ Không tìm thấy dữ liệu token.');
        return;
      }

      const tokenData = JSON.parse(tokenDataRaw);

      const token = tokenData?.body?.access_token;
      if (token) {
        const bearerToken = 'Bearer ' + token;

        // Log ra console
        console.log('%c🔑 Access Token:', 'color: green; font-weight: bold');
        console.log(bearerToken);

        // Copy vào clipboard
        try {
          await navigator.clipboard.writeText(bearerToken);
          console.info('📋 Token đã được copy vào clipboard!');
        } catch (copyErr) {
          console.warn('⚠️ Không thể copy vào clipboard:', copyErr);
        }

        return;
      }
    }

    console.warn('⚠️ Không tìm thấy access_token trong localStorage.');
  } catch (e) {
    console.error('❌ Lỗi khi lấy token:', e);
  }
};

showTokenHelper(true);