export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
}

export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  maxFiles: number;
  storageProvider: 'local' | 'supabase' | 'cloudinary' | 'aws-s3';
}

export interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<UploadResult[]>;
  onRemove: (url: string) => Promise<void>;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}
