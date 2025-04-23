import React, { useState, useRef } from 'react';
import { 
  uploadMultipleImages, 
  CloudinaryUploadResponse, 
  UploadProgress 
} from '../utils/cloudinaryUpload';

interface MultiImageUploadProps {
  onImagesUploaded: (imageDataList: CloudinaryUploadResponse[]) => void;
  className?: string;
  uploadPreset: string;
  cloudName: string;
  maxFiles?: number;
  initialImages?: CloudinaryUploadResponse[];
  onError?: (error: string) => void;
}

export default function MultiImageUpload({
  onImagesUploaded,
  className = '',
  uploadPreset,
  cloudName,
  maxFiles = 10,
  initialImages = [],
  onError
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [previewImages, setPreviewImages] = useState<CloudinaryUploadResponse[]>(initialImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    
    // Kiểm tra giới hạn số lượng file
    if (previewImages.length + files.length > maxFiles) {
      const errorMsg = `Tối đa ${maxFiles} ảnh được phép tải lên`;
      onError?.(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload files và theo dõi tiến trình
      const responses = await uploadMultipleImages(
        files,
        uploadPreset,
        cloudName,
        (progressItems) => {
          setUploadProgress([...progressItems]);
        }
      );
      
      // Cập nhật danh sách ảnh đã upload
      setPreviewImages(prev => [...prev, ...responses]);
      
      // Gửi kết quả đến component cha
      onImagesUploaded(responses);
      
      // Reset input file để có thể chọn lại cùng file nếu cần
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Lỗi khi tải nhiều ảnh:', error);
      onError?.(error instanceof Error ? error.message : 'Lỗi khi tải ảnh');
    } finally {
      setIsUploading(false);
      setUploadProgress([]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...previewImages];
    newImages.splice(index, 1);
    setPreviewImages(newImages);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      
      {/* Preview các ảnh đã upload */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {previewImages.map((image, index) => (
            <div 
              key={`${image.public_id}-${index}`} 
              className="relative rounded-lg overflow-hidden border border-gray-200 group"
            >
              <img 
                src={image.secure_url}
                alt={`Uploaded ${index}`}
                className="w-full h-24 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Hiển thị tiến trình upload */}
      {uploadProgress.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploadProgress.map((item, index) => (
            <div key={index} className="border rounded-md p-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="truncate">{item.file.name}</span>
                <span className="ml-2">{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    item.status === 'error' 
                      ? 'bg-red-500' 
                      : item.status === 'success' 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              {item.status === 'error' && (
                <p className="text-xs text-red-500 mt-1">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Button để thêm ảnh */}
      <button
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className={`
          w-full mt-2 border-2 border-dashed rounded-lg p-4 text-center 
          ${isUploading ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} 
          transition-colors border-gray-300
        `}
      >
        {isUploading ? (
          <span className="flex items-center justify-center text-gray-500">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tải ảnh...
          </span>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Click để tải ảnh lên {maxFiles > 0 && `(tối đa ${maxFiles} ảnh)`}
            </p>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF lên đến 10MB</p>
          </>
        )}
      </button>
    </div>
  );
} 