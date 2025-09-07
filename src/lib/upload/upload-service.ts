import { UploadResult, UploadConfig, UploadedImage } from './types';
import { UPLOAD_CONFIG, getUploadEndpoint } from './config';

export class UploadService {
  private config: UploadConfig;

  constructor(config: UploadConfig = UPLOAD_CONFIG) {
    this.config = config;
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(this.config.maxFileSize / 1024 / 1024)}MB`
      };
    }

    // Check MIME type
    if (!this.config.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Upload single file
   */
  async uploadFile(file: File): Promise<UploadResult> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type);
      formData.append('size', file.size.toString());

      const endpoint = getUploadEndpoint(this.config.storageProvider);
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Upload failed'
        };
      }

      return {
        success: true,
        url: result.url,
        filename: result.filename,
        size: file.size,
        mimeType: file.type
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[]): Promise<UploadResult[]> {
    // Check file count
    if (files.length > this.config.maxFiles) {
      return files.map(() => ({
        success: false,
        error: `Maximum ${this.config.maxFiles} files allowed`
      }));
    }

    // Upload files in parallel
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Delete failed'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Generate preview URL for file
   */
  generatePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const uploadService = new UploadService();
