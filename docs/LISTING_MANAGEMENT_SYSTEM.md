# Listing Management System

## Overview

The listing management system provides comprehensive CRUD (Create, Read, Update, Delete) operations for user game listings. It includes edit functionality, delete operations, status toggling, and duplicate capabilities, all integrated into the user profile dashboard.

## Architecture

### Core Components

1. **API Endpoints**

   - `/api/listings/get` - Fetch single listing for editing
   - `/api/listings/update` - Update existing listing
   - `/api/listings/delete` - Delete listing and associated files

2. **React Hooks**

   - `useListingManagement` - Centralized state management for listing operations

3. **UI Components**
   - Enhanced `UserListings` component with action dropdowns
   - Edit mode in main listing page
   - Loading and error states

### Data Flow

```
User Profile → UserListings → Action Dropdown → API Call → State Update
     ↓
Edit Mode → Pre-populated Form → Update API → Success Redirect
     ↓
Delete Action → Confirmation → Delete API → Remove from UI
```

## Features

### ✅ Implemented Features

**Edit Functionality:**

- **Pre-populated Forms** - All existing data loaded into edit mode
- **URL-based Edit Mode** - `/list-game-version?edit={listingId}`
- **Form Validation** - Same validation as create mode
- **Success Handling** - Redirect to success page after update

**Delete Functionality:**

- **Confirmation Dialog** - Prevents accidental deletions
- **File Cleanup** - Removes associated images from storage
- **UI Updates** - Real-time removal from listing grid
- **Error Handling** - Graceful failure with user feedback

**Status Management:**

- **Toggle Active/Inactive** - One-click status changes
- **Visual Indicators** - Clear status badges and icons
- **Real-time Updates** - Immediate UI feedback

**User Experience:**

- **Action Dropdowns** - Clean, organized action menus
- **Loading States** - Visual feedback during operations
- **Error Messages** - Clear, actionable error information
- **Responsive Design** - Works on all screen sizes

## API Endpoints

### GET /api/listings/get

Fetches a single listing for editing.

**Parameters:**

- `id` (query) - Listing ID to fetch

**Response:**

```json
{
  "success": true,
  "listing": {
    "id": "uuid",
    "title": "Game Title",
    "price": 25.0,
    "negotiable": true,
    "game_condition": {
      /* ... */
    },
    "shipping": {
      /* ... */
    }
    // ... all listing fields
  }
}
```

**Security:**

- User authentication required
- Users can only access their own listings
- 404 for non-existent or unauthorized listings

### PUT /api/listings/update

Updates an existing listing.

**Parameters:**

- `id` (query) - Listing ID to update

**Request Body:**

```json
{
  "title": "Updated Title",
  "price": 30.0,
  "negotiable": false,
  "game_condition": {
    /* updated condition */
  },
  "shipping": {
    /* updated shipping */
  }
  // ... any fields to update
}
```

**Response:**

```json
{
  "success": true,
  "listing": {
    /* updated listing object */
  }
}
```

**Features:**

- Partial updates supported (only send changed fields)
- Validation using same schema as create
- Automatic `updated_at` timestamp
- User ownership verification

### DELETE /api/listings/delete

Deletes a listing and associated files.

**Parameters:**

- `id` (query) - Listing ID to delete

**Response:**

```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

**Features:**

- File cleanup for associated images
- User ownership verification
- Graceful error handling
- Immediate UI updates

## React Hook: useListingManagement

Centralized state management for all listing operations.

```typescript
const {
  updateListing,
  deleteListing,
  toggleListingStatus,
  duplicateListing,
  isLoading,
  error,
  clearError,
} = useListingManagement({
  onSuccess: (message) => console.log("Success:", message),
  onError: (error) => console.error("Error:", error),
});
```

**Methods:**

- `updateListing(id, data)` - Update listing with new data
- `deleteListing(id)` - Delete listing and cleanup files
- `toggleListingStatus(id, isActive)` - Toggle active/inactive status
- `duplicateListing()` - Navigate to create page (future: pre-fill data)

**State:**

- `isLoading` - Boolean indicating if any operation is in progress
- `error` - String with current error message
- `clearError()` - Function to clear current error

## UI Components

### Enhanced UserListings Component

**Action Dropdown Menu:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <MoreVertical className="w-4 h-4" />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => handleEdit(listing.id)}>
      <Edit3 className="w-4 h-4 mr-2" />
      Edit Listing
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDuplicate}>
      <Copy className="w-4 h-4 mr-2" />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => handleDelete(listing.id)}>
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Status Toggle Button:**

```tsx
<button
  onClick={() => handleToggleActive(listing.id, listing.is_active)}
  disabled={isLoading}
  className="p-2 rounded-full bg-white/90 hover:bg-white"
>
  {listing.is_active ? (
    <EyeOff className="w-4 h-4" />
  ) : (
    <EyeIcon className="w-4 h-4" />
  )}
</button>
```

### Edit Mode Integration

**URL Detection:**

```typescript
const searchParams = useSearchParams();
const editId = searchParams.get("edit");
```

**Data Loading:**

```typescript
useEffect(() => {
  const loadListingForEdit = async () => {
    if (!editId || !user?.id) return;

    const response = await fetch(`/api/listings/get?id=${editId}`);
    const result = await response.json();

    // Populate form data with existing listing
    update({
      bggGameId: listing.bgg_game_id,
      gameName: listing.game_name,
      // ... all other fields
    });
  };

  loadListingForEdit();
}, [editId, user?.id, update]);
```

**Form Submission:**

```typescript
const url = isEditMode
  ? `/api/listings/update?id=${editId}`
  : "/api/listings/create";
const method = isEditMode ? "PUT" : "POST";

const response = await fetch(url, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestData),
});
```

## Security Considerations

### Authentication & Authorization

- **Clerk Authentication** - All operations require valid user session
- **Ownership Verification** - Users can only access their own listings
- **Database RLS** - Row-level security policies enforce data isolation

### Data Validation

- **Zod Schemas** - Server-side validation for all updates
- **Type Safety** - TypeScript interfaces prevent data corruption
- **Input Sanitization** - All user inputs are validated and sanitized

### File Management

- **Secure Deletion** - Associated files are properly cleaned up
- **Path Validation** - File paths are validated before deletion
- **Error Handling** - Graceful handling of file system errors

## Error Handling

### Client-Side Error States

```tsx
{
  error && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 text-red-700">
        <span className="text-sm">{error}</span>
        <button onClick={clearError}>×</button>
      </div>
    </div>
  );
}
```

### Server-Side Error Responses

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "price",
      "message": "Price must be a positive number",
      "code": "invalid_type"
    }
  ]
}
```

### Loading States

```tsx
{
  deletingId === listing.id && (
    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
      <div className="animate-spin rounded-full h-3 w-3 border-b border-vibrant-orange"></div>
      Deleting...
    </div>
  );
}
```

## Performance Optimizations

### State Management

- **Local State Updates** - Immediate UI updates without server round-trips
- **Optimistic Updates** - UI updates before server confirmation
- **Error Rollback** - Revert changes if server operations fail

### API Efficiency

- **Partial Updates** - Only send changed fields to server
- **Batch Operations** - Multiple operations can be queued
- **Caching** - Listing data cached in component state

### UI Responsiveness

- **Loading Indicators** - Visual feedback for all operations
- **Disabled States** - Prevent multiple simultaneous operations
- **Error Boundaries** - Graceful error handling without crashes

## Usage Examples

### Editing a Listing

1. Navigate to `/profile`
2. Find listing in "My Listings" section
3. Click "⋮" menu → "Edit Listing"
4. Form pre-populated with existing data
5. Make changes and click "💾 Update Listing"
6. Redirected to success page

### Deleting a Listing

1. Navigate to `/profile`
2. Find listing in "My Listings" section
3. Click "⋮" menu → "Delete"
4. Confirm deletion in dialog
5. Listing removed from UI immediately
6. Associated files cleaned up automatically

### Toggling Status

1. Navigate to `/profile`
2. Find listing in "My Listings" section
3. Click eye icon (👁️/👁️‍🗨️) to toggle active/inactive
4. Status updates immediately in UI
5. Badge color changes to reflect new status

## Future Enhancements

### Planned Features

- **Bulk Operations** - Select multiple listings for batch actions
- **Advanced Filtering** - Filter by status, date, price range
- **Export Functionality** - Export listings to CSV/PDF
- **Duplicate with Pre-fill** - Duplicate listing with all data pre-filled
- **Version History** - Track changes to listings over time
- **Analytics Dashboard** - View listing performance metrics

### Technical Improvements

- **Real-time Updates** - WebSocket integration for live updates
- **Offline Support** - PWA capabilities for offline editing
- **Advanced Search** - Full-text search across listing content
- **Image Optimization** - Automatic image compression and resizing
- **Backup/Restore** - Export/import listing data

## Testing

### Manual Testing Checklist

- [ ] Edit mode loads with correct data
- [ ] Form validation works in edit mode
- [ ] Update operations complete successfully
- [ ] Delete operations remove listing and files
- [ ] Status toggle updates immediately
- [ ] Error states display correctly
- [ ] Loading states show during operations
- [ ] Responsive design works on mobile

### Automated Testing

```typescript
describe("Listing Management", () => {
  it("should load listing for edit", async () => {
    // Test edit mode data loading
  });

  it("should update listing successfully", async () => {
    // Test update operations
  });

  it("should delete listing and cleanup files", async () => {
    // Test delete operations
  });

  it("should handle errors gracefully", async () => {
    // Test error scenarios
  });
});
```

## Migration Guide

### From Basic to Full Management

**Before:**

- Static listing display
- No edit/delete capabilities
- Basic CRUD operations

**After:**

- Full CRUD operations
- Edit mode with pre-populated forms
- Delete with file cleanup
- Status management
- Action dropdowns
- Error handling
- Loading states

This provides a complete, production-ready listing management system that gives users full control over their game listings with a professional, intuitive interface.
