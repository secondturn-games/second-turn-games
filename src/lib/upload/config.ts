import { UploadConfig } from './types';

export const UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  maxFiles: 10,
  storageProvider: 'local' // Will be configurable via environment
};

export const UPLOAD_ENDPOINTS = {
  local: '/api/upload/local',
  supabase: '/api/upload/supabase',
  cloudinary: '/api/upload/cloudinary',
  'aws-s3': '/api/upload/aws-s3'
} as const;

export const getUploadEndpoint = (provider: UploadConfig['storageProvider']): string => {
  return UPLOAD_ENDPOINTS[provider];
};
