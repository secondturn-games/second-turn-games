'use client'

import { useEffect, useState } from 'react'
import { getEnvironmentInfo, shouldEnablePWA } from '@/lib/utils/pwa-utils'
import { Smartphone, Monitor } from 'lucide-react'

export function PWAStatus() {
  const [envInfo, setEnvInfo] = useState<string>('')
  const [isPWAEnabled, setIsPWAEnabled] = useState(false)

  useEffect(() => {
    setEnvInfo(getEnvironmentInfo())
    setIsPWAEnabled(shouldEnablePWA())
  }, [])

  // Only show in development for debugging, but not on localhost
  if (process.env.NODE_ENV !== 'development' || typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs z-50">
      <div className="flex items-center gap-2 mb-2">
        {isPWAEnabled ? (
          <Smartphone className="w-4 h-4 text-green-600" />
        ) : (
          <Monitor className="w-4 h-4 text-gray-600" />
        )}
        <span className="font-medium">
          PWA: {isPWAEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      <div className="text-gray-600">
        <div>{envInfo}</div>
        <div className="text-xs text-gray-500 mt-1">
          {isPWAEnabled 
            ? 'PWA features active' 
            : 'PWA disabled on localhost'
          }
        </div>
      </div>
    </div>
  )
}
