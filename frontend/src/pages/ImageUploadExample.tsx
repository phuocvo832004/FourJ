import { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import { CloudinaryUploadResponse } from '../utils/cloudinaryUpload';

export default function ImageUploadExample() {
  const [uploadedImage, setUploadedImage] = useState<CloudinaryUploadResponse | null>(null);
  
  // Sử dụng biến môi trường từ Vite
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';

  const handleImageUploaded = (imageData: CloudinaryUploadResponse) => {
    setUploadedImage(imageData);
    console.log('Ảnh đã được tải lên:', imageData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ví dụ Upload Ảnh lên Cloudinary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Upload ảnh</h2>
          <ImageUpload 
            onImageUploaded={handleImageUploaded} 
            cloudName={CLOUDINARY_CLOUD_NAME}
            uploadPreset={CLOUDINARY_UPLOAD_PRESET}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Thông tin ảnh đã upload</h2>
          {uploadedImage ? (
            <div className="border rounded-lg p-4">
              <img 
                src={uploadedImage.secure_url} 
                alt="Uploaded" 
                className="max-h-64 mx-auto mb-4"
              />
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">URL: </span>
                  <a 
                    href={uploadedImage.secure_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {uploadedImage.secure_url}
                  </a>
                </div>
                
                <div>
                  <span className="font-medium">Public ID: </span>
                  <span className="break-all">{uploadedImage.public_id}</span>
                </div>
                
                <div>
                  <span className="font-medium">Định dạng: </span>
                  <span>{uploadedImage.format}</span>
                </div>
                
                <div>
                  <span className="font-medium">Kích thước: </span>
                  <span>{uploadedImage.width} x {uploadedImage.height}px</span>
                </div>
                
                <div>
                  <span className="font-medium">Cách sử dụng: </span>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                    <code>{`<img src="${uploadedImage.secure_url}" alt="Uploaded image" />`}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
              Chưa có ảnh nào được tải lên
            </div>
          )}
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