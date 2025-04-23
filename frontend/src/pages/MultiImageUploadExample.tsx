import { useState } from 'react';
import MultiImageUpload from '../components/MultiImageUpload';
import { CloudinaryUploadResponse } from '../utils/cloudinaryUpload';

export default function MultiImageUploadExample() {
  const [uploadedImages, setUploadedImages] = useState<CloudinaryUploadResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Sử dụng biến môi trường từ Vite
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';

  const handleImagesUploaded = (newImages: CloudinaryUploadResponse[]) => {
    setUploadedImages(prev => [...prev, ...newImages]);
    setErrorMessage(null);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    // Tự động xóa thông báo lỗi sau 5 giây
    setTimeout(() => setErrorMessage(null), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ví dụ Upload Nhiều Ảnh</h1>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Upload nhiều ảnh</h2>
          <MultiImageUpload 
            onImagesUploaded={handleImagesUploaded}
            onError={handleError}
            cloudName={CLOUDINARY_CLOUD_NAME}
            uploadPreset={CLOUDINARY_UPLOAD_PRESET}
            maxFiles={5}
            initialImages={uploadedImages}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Thông tin ảnh đã upload ({uploadedImages.length})</h2>
          {uploadedImages.length > 0 ? (
            <div className="border rounded-lg p-4 h-96 overflow-auto">
              {uploadedImages.map((image, index) => (
                <div key={`${image.public_id}-${index}`} className="mb-4 pb-4 border-b last:border-b-0">
                  <img 
                    src={image.secure_url} 
                    alt={`Uploaded ${index}`} 
                    className="max-h-40 mx-auto mb-2"
                  />
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">URL: </span>
                      <a 
                        href={image.secure_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {image.secure_url}
                      </a>
                    </div>
                    
                    <div>
                      <span className="font-medium">Public ID: </span>
                      <span className="break-all">{image.public_id}</span>
                    </div>
                    
                    <div className="flex gap-4">
                      <div>
                        <span className="font-medium">Định dạng: </span>
                        <span>{image.format}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Kích thước: </span>
                        <span>{image.width} x {image.height}px</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
              Chưa có ảnh nào được tải lên
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Cách sử dụng component</h2>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <pre className="overflow-auto text-xs">
            <code>{`
import MultiImageUpload from '../components/MultiImageUpload';
import { CloudinaryUploadResponse } from '../utils/cloudinaryUpload';

// Trong component của bạn
const [uploadedImages, setUploadedImages] = useState<CloudinaryUploadResponse[]>([]);

const handleImagesUploaded = (newImages: CloudinaryUploadResponse[]) => {
  setUploadedImages(prev => [...prev, ...newImages]);
};

// Trong render
<MultiImageUpload 
  onImagesUploaded={handleImagesUploaded}
  onError={(error) => console.error(error)}
  cloudName="dxggv6rnr"
  uploadPreset="upload-preset"
  maxFiles={5}
/>
            `}</code>
          </pre>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Hướng dẫn cấu hình</h2>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="mb-2">Để sử dụng component này, bạn cần:</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Tạo tài khoản <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudinary</a></li>
            <li>Lấy Cloud Name của bạn từ Dashboard</li>
            <li>Tạo Upload Preset (Settings &gt; Upload &gt; Upload presets) và đặt nó là <strong>Unsigned</strong></li>
            <li>Tạo file <code>.env</code> ở thư mục gốc với nội dung:
              <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto text-xs">
                <code>VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset</code>
              </pre>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
} 