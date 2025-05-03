import { useState, useRef, ChangeEvent } from 'react';
import { uploadImageToCloudinary, CloudinaryUploadResponse } from '../utils/cloudinaryUpload';

interface ImageUploadProps {
  onImageUploaded: (imageData: CloudinaryUploadResponse) => void;
  className?: string;
  uploadPreset: string;
  cloudName: string;
}

export default function ImageUpload({ 
  onImageUploaded, 
  className = '',
  uploadPreset,
  cloudName
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hiển thị preview
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);

    // Upload ảnh lên Cloudinary
    try {
      setIsUploading(true);
      const response = await uploadImageToCloudinary(file, uploadPreset, cloudName);
      onImageUploaded(response);
    } catch (error) {
      console.error('Lỗi upload ảnh:', error);
      // Xử lý lỗi tại đây
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div 
        onClick={triggerFileInput}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
      >
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white">Đổi ảnh</span>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Click để tải ảnh lên
            </p>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF lên đến 10MB</p>
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
} 