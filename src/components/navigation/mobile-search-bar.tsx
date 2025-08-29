"use client"

import { usePathname } from 'next/navigation'

export function MobileSearchBar() {
  const pathname = usePathname()
  
  // Hide mobile search bar on listing wizard pages to save screen space
  const isListingWizard = pathname?.startsWith('/list-game')
  
  if (isListingWizard) {
    return null
  }
  
  return (
    <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-light-beige-200 transition-all duration-200">
      <div className="mx-auto max-w-6xl px-3 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for games..."
            className="w-full px-3 py-2.5 pl-10 rounded-lg border-2 border-light-beige-200 bg-white text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 shadow-sm text-sm"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-green-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
