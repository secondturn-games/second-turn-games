# Conditional PWA Setup

## Overview

This document explains how the PWA (Progressive Web App) features are conditionally enabled based on the environment, specifically disabling PWA features on localhost for better development experience.

## How It Works

### 1. **Environment Detection** (`src/lib/utils/pwa-utils.ts`)

The system automatically detects if the app is running on localhost:

```typescript
export function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.")
  );
}
```

### 2. **Conditional PWA Features**

- **On Localhost**: PWA features are completely disabled
- **On Production/Staging**: PWA features are fully enabled

### 3. **What Gets Disabled on Localhost**

- PWA Install Prompt
- Service Worker Registration
- Offline Caching
- Background Sync
- Push Notifications

## Components

### PWA Installer (`src/components/pwa/pwa-installer.tsx`)

- Automatically hides on localhost
- Shows install prompt on production
- Registers service worker only when enabled

### PWA Status (`src/components/pwa/pwa-status.tsx`)

- **Development Only**: Shows current PWA status
- **Production**: Hidden completely
- Displays environment information for debugging

## Benefits

### **Development (Localhost)**

- ✅ Fast development iteration
- ✅ No service worker caching conflicts
- ✅ Clean browser dev tools
- ✅ Immediate code changes visible
- ✅ No PWA install prompts during development

### **Production/Staging**

- ✅ Full PWA capabilities
- ✅ Offline support
- ✅ Installable app
- ✅ Push notifications
- ✅ Background sync

## Usage Examples

### Basic PWA Check

```typescript
import { shouldEnablePWA } from "@/lib/utils/pwa-utils";

if (shouldEnablePWA()) {
  // Enable PWA features
  registerServiceWorker();
  showInstallPrompt();
}
```

### Service Worker Registration

```typescript
import { shouldRegisterServiceWorker } from "@/lib/utils/pwa-utils";

if (shouldRegisterServiceWorker() && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
```

### Environment Information

```typescript
import { getEnvironmentInfo } from "@/lib/utils/pwa-utils";

console.log(getEnvironmentInfo());
// Output: "http://localhost:3000 (localhost) - development"
```

## Configuration

### Environment Variables

- `NODE_ENV`: Automatically set by Next.js
- No additional configuration needed

### Hostname Detection

The system automatically detects:

- `localhost`
- `127.0.0.1`
- `[::1]` (IPv6 localhost)
- Private network ranges (`192.168.x.x`, `10.x.x.x`, `172.x.x.x`)

## Testing

### Local Development

1. Run `npm run dev`
2. PWA features will be disabled
3. PWA Status component shows "PWA: Disabled"
4. No service worker registration

### Production Testing

1. Deploy to production/staging
2. PWA features will be enabled
3. Install prompt will appear
4. Service worker will register

### Manual Testing

You can test the conditional behavior by:

1. Changing your hosts file to point a domain to localhost
2. Using different network configurations
3. Testing on different devices

## Troubleshooting

### PWA Not Working in Production

1. Check if the domain is not in localhost list
2. Verify service worker file exists at `/public/sw.js`
3. Check browser console for errors

### PWA Working in Development

1. Ensure you're accessing via `localhost` or `127.0.0.1`
2. Check PWA Status component shows "Disabled"
3. Verify no service worker in browser dev tools

## Future Enhancements

- Add more granular control over specific PWA features
- Support for custom environment configurations
- Integration with build-time environment detection
- Support for staging environment detection
