# Image Upload System

## Overview

The image upload system provides a flexible, extensible solution for handling user-uploaded images in the game listing flow. It's designed to work with multiple storage providers and can be easily configured for different environments.

## Architecture

### Core Components

1. **Upload Service** (`src/lib/upload/upload-service.ts`)

   - Centralized upload logic
   - File validation
   - Multiple storage provider support
   - Error handling

2. **Image Upload Component** (`src/components/upload/ImageUpload.tsx`)

   - Drag & drop interface
   - File preview
   - Progress indicators
   - Batch upload support

3. **API Endpoints**
   - `/api/upload/local` - Local file storage
   - `/api/upload/delete` - File deletion
   - Extensible for other providers

### Storage Providers

Currently implemented:

- **Local Storage** - Files saved to `public/uploads/` directory
- **Extensible** - Easy to add Supabase, Cloudinary, AWS S3, etc.

## Features

### ✅ Implemented Features

- **Drag & Drop Upload** - Intuitive file selection
- **File Validation** - Size, type, and count limits
- **Image Preview** - Thumbnail grid with remove functionality
- **Progress Indicators** - Upload status feedback
- **Error Handling** - User-friendly error messages
- **Batch Upload** - Multiple files at once
- **File Management** - Add/remove images
- **Responsive Design** - Works on all screen sizes

### 📋 Configuration

```typescript
// src/lib/upload/config.ts
export const UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  maxFiles: 10,
  storageProvider: "local", // Configurable
};
```

## Usage

### Basic Implementation

```tsx
import { ImageUpload } from "@/components/upload/ImageUpload";
import { UploadedImage } from "@/lib/upload/types";

function MyComponent() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  return (
    <ImageUpload
      onImagesChange={setImages}
      maxFiles={10}
      maxFileSize={5 * 1024 * 1024}
      existingImages={images}
    />
  );
}
```

### Integration with Game Condition Form

The image upload is integrated into the "Photos" tab of the Game Condition form:

```tsx
// In GameConditionForm.tsx
case 'photos':
  return (
    <div>
      <ImageUpload
        onImagesChange={(images: UploadedImage[]) => {
          onUpdate({ photos: images.map(img => img.url) })
        }}
        maxFiles={10}
        maxFileSize={5 * 1024 * 1024}
        existingImages={condition.photos?.map((url, index) => ({
          id: `existing-${index}`,
          url,
          filename: `photo-${index + 1}`,
          size: 0,
          mimeType: 'image/jpeg',
          uploadedAt: new Date()
        })) || []}
      />
    </div>
  );
```

## File Structure

```
src/lib/upload/
├── types.ts           # TypeScript interfaces
├── config.ts          # Configuration settings
└── upload-service.ts  # Core upload logic

src/components/upload/
└── ImageUpload.tsx    # React component

src/app/api/upload/
├── local/route.ts     # Local storage endpoint
└── delete/route.ts    # File deletion endpoint

public/uploads/        # Local file storage
└── .gitkeep          # Preserve directory structure
```

## Storage Provider Integration

### Adding New Storage Providers

1. **Create API Endpoint**

   ```typescript
   // src/app/api/upload/[provider]/route.ts
   export async function POST(request: NextRequest) {
     // Provider-specific upload logic
   }
   ```

2. **Update Configuration**

   ```typescript
   // src/lib/upload/config.ts
   export const UPLOAD_ENDPOINTS = {
     local: "/api/upload/local",
     supabase: "/api/upload/supabase",
     cloudinary: "/api/upload/cloudinary",
     "aws-s3": "/api/upload/aws-s3",
   };
   ```

3. **Environment Variables**
   ```env
   UPLOAD_PROVIDER=supabase
   SUPABASE_STORAGE_BUCKET=game-images
   CLOUDINARY_CLOUD_NAME=your-cloud
   AWS_S3_BUCKET=your-bucket
   ```

## Security Considerations

### File Validation

- **MIME Type Checking** - Only allow image files
- **File Size Limits** - Prevent large file uploads
- **File Count Limits** - Prevent abuse
- **Filename Sanitization** - Prevent path traversal

### Storage Security

- **Unique Filenames** - Prevent conflicts and guessing
- **Access Control** - Restrict file access as needed
- **Cleanup** - Remove orphaned files

## Performance Optimizations

### Client-Side

- **Image Preview** - Immediate visual feedback
- **Batch Upload** - Parallel file processing
- **Memory Management** - Revoke object URLs

### Server-Side

- **Streaming Uploads** - Handle large files efficiently
- **Async Processing** - Non-blocking file operations
- **Error Recovery** - Graceful failure handling

## Future Enhancements

### Planned Features

- **Image Compression** - Automatic optimization
- **Thumbnail Generation** - Multiple sizes
- **CDN Integration** - Faster delivery
- **Image Metadata** - EXIF data extraction
- **Duplicate Detection** - Prevent re-uploads

### Storage Providers

- **Supabase Storage** - Integrated with existing auth
- **Cloudinary** - Advanced image processing
- **AWS S3** - Scalable cloud storage
- **Google Cloud Storage** - Alternative cloud option

## Troubleshooting

### Common Issues

1. **Upload Fails**

   - Check file size and type
   - Verify storage permissions
   - Check network connectivity

2. **Images Not Displaying**

   - Verify file paths
   - Check CORS settings
   - Ensure files are accessible

3. **Performance Issues**
   - Reduce file sizes
   - Implement compression
   - Use CDN for delivery

## Testing

### Manual Testing

1. Navigate to `/list-game-version`
2. Go to "Game Condition" → "Photos" tab
3. Test drag & drop functionality
4. Test file validation
5. Test image removal
6. Test batch upload

### Automated Testing

```typescript
// Example test structure
describe("ImageUpload", () => {
  it("should validate file types", () => {
    // Test file type validation
  });

  it("should handle upload errors", () => {
    // Test error scenarios
  });

  it("should manage file state", () => {
    // Test state management
  });
});
```

## Migration Guide

### From Placeholder to Full Implementation

The image upload system replaces the placeholder in the Game Condition form:

**Before:**

```tsx
<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
  <div className="text-gray-500">
    <div className="text-sm font-medium mb-2">Photo upload coming soon</div>
  </div>
</div>
```

**After:**

```tsx
<ImageUpload
  onImagesChange={(images: UploadedImage[]) => {
    onUpdate({ photos: images.map((img) => img.url) });
  }}
  maxFiles={10}
  maxFileSize={5 * 1024 * 1024}
  existingImages={/* existing images */}
/>
```

This provides a complete, production-ready image upload experience for users creating game listings.
