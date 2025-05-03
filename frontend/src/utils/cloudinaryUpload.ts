import axios from 'axios';

// Các kiểu dữ liệu
export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  url: string;
}

export interface UploadProgress {
  file: File;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'success' | 'error';
  response?: CloudinaryUploadResponse;
  error?: string;
}

// Hàm upload ảnh lên Cloudinary
export const uploadImageToCloudinary = async (
  file: File,
  uploadPreset: string,
  cloudName: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
    throw new Error('Không thể upload ảnh');
  }
};

// Hàm upload nhiều ảnh cùng lúc với theo dõi tiến trình
export const uploadMultipleImages = async (
  files: File[],
  uploadPreset: string,
  cloudName: string,
  onProgressUpdate?: (progressItems: UploadProgress[]) => void
): Promise<CloudinaryUploadResponse[]> => {
  // Khởi tạo mảng theo dõi tiến trình
  const progressItems: UploadProgress[] = files.map(file => ({
    file,
    progress: 0,
    status: 'pending'
  }));
  
  // Function cập nhật tiến trình
  const updateProgress = (index: number, update: Partial<UploadProgress>) => {
    progressItems[index] = { ...progressItems[index], ...update };
    onProgressUpdate?.(progressItems);
  };
  
  // Upload tất cả các file và theo dõi tiến trình
  const uploadPromises = files.map((file, index) => {
    updateProgress(index, { status: 'uploading' });
    
    return uploadImageToCloudinary(
      file, 
      uploadPreset, 
      cloudName,
      (progress) => {
        updateProgress(index, { progress });
      }
    )
    .then(response => {
      updateProgress(index, { status: 'success', response, progress: 100 });
      return response;
    })
    .catch(error => {
      updateProgress(index, { 
        status: 'error', 
        error: error.message || 'Lỗi khi upload ảnh', 
        progress: 0 
      });
      throw error;
    });
  });
  
  try {
    // Sử dụng Promise.allSettled để đảm bảo tất cả các promise đều được xử lý
    const results = await Promise.allSettled(uploadPromises);
    
    // Lọc và trả về các kết quả thành công
    const successResults = results
      .filter((result): result is PromiseFulfilledResult<CloudinaryUploadResponse> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
    
    // Nếu có bất kỳ lỗi nào, ném ra một lỗi tổng hợp
    const failedCount = results.filter(result => result.status === 'rejected').length;
    if (failedCount > 0) {
      console.warn(`${failedCount}/${files.length} ảnh không thể upload`);
    }
    
    return successResults;
  } catch (error) {
    console.error('Lỗi khi upload nhiều ảnh:', error);
    throw new Error('Một số ảnh không thể upload');
  }
};

// Hàm xóa ảnh từ Cloudinary (cần có API key và secret nếu sử dụng từ frontend)
export const deleteImageFromCloudinary = async (
  publicId: string, 
  apiKey: string,
  apiSecret: string,
  cloudName: string
) => {
  try {
    // Lưu ý: Bạn nên thực hiện việc xóa ảnh thông qua backend để bảo mật API key và secret
    // Đây chỉ là ví dụ, không nên sử dụng trực tiếp từ frontend
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const hashSignature = await generateSHA1(signature);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', hashSignature);
    
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      formData
    );
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa ảnh từ Cloudinary:', error);
    throw new Error('Không thể xóa ảnh');
  }
};

// Hàm tạo SHA1 hash (để xóa ảnh)
async function generateSHA1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
} 