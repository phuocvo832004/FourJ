/**
 * Định dạng số thành string với 2 chữ số thập phân và phân cách hàng nghìn sử dụng dấu chấm
 * @param value - Số cần định dạng
 * @returns Chuỗi đã định dạng (ví dụ: 1,234.56)
 */

export const formatCurrency = (value: number): string => {
  // Đảm bảo luôn có 2 chữ số sau dấu chấm
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Định dạng số thành số với 2 chữ số thập phân
 * @param value - Số cần định dạng
 * @returns Số đã định dạng với 2 chữ số thập phân
 */
export const formatDecimal = (value: number): number => {
  return Number(value.toFixed(2));
};

/**
 * Định dạng ngày giờ theo format Việt Nam, sử dụng ngày giờ chính xác từ database
 * @param dateString - Chuỗi ngày cần định dạng
 * @returns Chuỗi ngày giờ đã định dạng (ví dụ: 31/12/2023 23:59)
 */
export const formatDateTime = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    // Tạo đối tượng Date từ chuỗi ISO
    const date = new Date(dateString);
    
    // Bù 7 giờ cho múi giờ Việt Nam (UTC+7)
    const vietnamDate = new Date(date.getTime() - (7 * 60 * 60 * 1000));
    
    return vietnamDate.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Lỗi định dạng ngày:', error);
    return dateString || '';
  }
};

/**
 * Định dạng ngày theo format Việt Nam
 * @param dateString - Chuỗi ngày cần định dạng
 * @returns Chuỗi ngày đã định dạng (ví dụ: 31/12/2023)
 */
export const formatDate = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    // Tạo đối tượng Date từ chuỗi ISO
    const date = new Date(dateString);
    
    // Bù 7 giờ cho múi giờ Việt Nam (UTC+7)
    const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    return vietnamDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Lỗi định dạng ngày:', error);
    return dateString || '';
  }
}; 