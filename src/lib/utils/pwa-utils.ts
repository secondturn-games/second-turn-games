/**
 * Utility functions for PWA functionality
 */

/**
 * Check if the app is running on localhost
 * @returns boolean - true if running on localhost
 */
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  
  const hostname = window.location.hostname
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  )
}

/**
 * Check if the app is running in development mode
 * @returns boolean - true if in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if the app is running in production mode
 * @returns boolean - true if in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if PWA features should be enabled
 * @returns boolean - true if PWA should be enabled
 */
export function shouldEnablePWA(): boolean {
  // Enable PWA everywhere except localhost
  return !isLocalhost()
}

/**
 * Check if service worker should be registered
 * @returns boolean - true if service worker should be registered
 */
export function shouldRegisterServiceWorker(): boolean {
  return shouldEnablePWA()
}

/**
 * Check if PWA install prompt should be shown
 * @returns boolean - true if install prompt should be shown
 */
export function shouldShowPWAInstallPrompt(): boolean {
  return shouldEnablePWA()
}

/**
 * Get the current environment for debugging
 * @returns string - current environment info
 */
export function getEnvironmentInfo(): string {
  if (typeof window === 'undefined') {
    return `Server: ${process.env.NODE_ENV}`
  }
  
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  const isLocal = isLocalhost()
  
  return `${protocol}//${hostname} (${isLocal ? 'localhost' : 'production'}) - ${process.env.NODE_ENV}`
}
