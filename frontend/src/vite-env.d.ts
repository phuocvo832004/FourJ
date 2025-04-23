/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  // thêm các biến môi trường khác tại đây
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
