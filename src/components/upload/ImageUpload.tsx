'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadService } from '@/lib/upload/upload-service';
import { UploadResult, UploadedImage } from '@/lib/upload/types';

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
  existingImages?: UploadedImage[];
}

export function ImageUpload({
  onImagesChange,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  disabled = false,
  className = '',
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled || uploading) return;

    const fileArray = Array.from(files);
    
    // Check file count
    if (images.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);
    setUploadResults([]);

    try {
      const results = await uploadService.uploadFiles(fileArray);
      setUploadResults(results);

      // Process successful uploads
      const successfulUploads = results
        .filter(result => result.success)
        .map((result, index) => ({
          id: `upload-${Date.now()}-${index}`,
          url: result.url!,
          filename: result.filename || `image-${index}`,
          size: result.size || 0,
          mimeType: result.mimeType || 'image/jpeg',
          uploadedAt: new Date()
        }));

      const newImages = [...images, ...successfulUploads];
      setImages(newImages);
      onImagesChange(newImages);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [images, maxFiles, disabled, uploading, onImagesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, uploading, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeImage = useCallback(async (imageId: string, imageUrl: string) => {
    if (disabled) return;

    try {
      await uploadService.deleteFile(imageUrl);
      const newImages = images.filter(img => img.id !== imageId);
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Delete error:', error);
      // Still remove from UI even if delete fails
      const newImages = images.filter(img => img.id !== imageId);
      setImages(newImages);
      onImagesChange(newImages);
    }
  }, [images, disabled, onImagesChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-vibrant-orange bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-orange"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drop images here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP, GIF up to {Math.round(maxFileSize / 1024 / 1024)}MB
                </p>
                <p className="text-xs text-gray-500">
                  {images.length}/{maxFiles} images
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="space-y-2">
          {uploadResults.map((result, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded text-sm ${
                result.success
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="flex-1">
                {result.success ? 'Uploaded successfully' : result.error}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove Button */}
              {!disabled && (
                <button
                  onClick={() => removeImage(image.id, image.url)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Image Info */}
              <div className="mt-1 text-xs text-gray-500 truncate">
                {image.filename}
              </div>
              <div className="text-xs text-gray-400">
                {formatFileSize(image.size)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
