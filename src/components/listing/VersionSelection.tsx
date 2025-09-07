"use client"

import Image from 'next/image'
import { Package, Languages, Building2, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { LanguageMatchedVersion } from '@/lib/bgg'

interface VersionSelectionProps {
  versions: LanguageMatchedVersion[]
  selectedVersion: LanguageMatchedVersion | null
  selectedLanguage: string
  onVersionSelect: (version: LanguageMatchedVersion) => void
  onLanguageChange: (language: string) => void
}

export function VersionSelection({
  versions,
  selectedVersion,
  selectedLanguage,
  onVersionSelect,
  onLanguageChange
}: VersionSelectionProps) {
  // Filter and sort versions based on selected language
  const filteredAndSortedVersions = versions
    .filter(version => {
      if (selectedLanguage === 'all') return true
      return version.version.languages?.some(lang => 
        lang.toLowerCase().includes(selectedLanguage.toLowerCase())
      )
    })
    .sort((a, b) => {
      // Sort by year (most recent first)
      const yearA = parseInt(a.version.yearpublished || '0')
      const yearB = parseInt(b.version.yearpublished || '0')
      return yearB - yearA
    })

  // Get unique languages from all versions
  const availableLanguages = Array.from(
    new Set(
      versions.flatMap(v => v.version.languages || [])
    )
  ).sort()

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-dark-green">Select Version</h4>
        <span className="text-xs text-gray-500">
          {filteredAndSortedVersions.length} of {versions.length} versions
        </span>
      </div>
      
      <p className="text-xs text-gray-600 mb-4">
        Board games travel the world — and so do their editions! Pick the exact version you own so buyers know what to expect. You can filter by language to make sure the right rulebook and components are included.
      </p>
      
      {/* Language Filter Options */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onLanguageChange('all')}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              selectedLanguage === 'all'
                ? 'bg-vibrant-orange text-white border-vibrant-orange'
                : 'bg-white text-gray-600 border-gray-300 hover:border-vibrant-orange hover:text-vibrant-orange'
            }`}
          >
            All Languages
          </button>
          {availableLanguages.map((language) => (
            <button
              key={language}
              onClick={() => onLanguageChange(language)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                selectedLanguage === language
                  ? 'bg-vibrant-orange text-white border-vibrant-orange'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-vibrant-orange hover:text-vibrant-orange'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
        {selectedLanguage !== 'all' && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <span>Filtering by:</span>
            <span className="px-2 py-0.5 bg-vibrant-orange/20 text-vibrant-orange rounded-full">
              {selectedLanguage}
            </span>
          </div>
        )}
      </div>
      
      {/* Version Cards */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredAndSortedVersions.map((version) => (
          <Card
            key={version.version.id}
            className={`cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange ${
              selectedVersion?.version.id === version.version.id
                ? 'border-2 border-vibrant-orange bg-vibrant-orange/5 shadow-md'
                : 'border border-gray-200 hover:border-vibrant-orange'
            }`}
            onClick={() => onVersionSelect(version)}
          >
            <CardContent className="p-3">
              <div className="flex items-start space-x-3">
                {/* Version Image */}
                <div className="flex-shrink-0">
                  {version.version.image || version.version.thumbnail ? (
                    <Image 
                      src={version.version.image || version.version.thumbnail || ''} 
                      alt={version.version.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain rounded-lg bg-light-beige"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-light-beige rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-dark-green" />
                    </div>
                  )}
                </div>
                
                {/* Version Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <h4 className={`font-medium text-sm leading-tight ${
                    selectedVersion?.version.id === version.version.id ? 'text-vibrant-orange' : 'text-dark-green'
                  }`}>
                    {version.version.name}
                  </h4>
                  
                  {/* Mobile Layout: Separate lines */}
                  <div className="block sm:hidden space-y-1">
                    {version.version.yearpublished && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {version.version.yearpublished}
                      </div>
                    )}
                    {version.version.languages && version.version.languages.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Languages className="w-3 h-3" />
                        <span className="truncate">{version.version.languages.join(', ')}</span>
                      </div>
                    )}
                    {version.version.publishers && version.version.publishers.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{version.version.publishers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop Layout: One line */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600">
                    {version.version.yearpublished && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {version.version.yearpublished}
                      </div>
                    )}
                    {version.version.languages && version.version.languages.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        <span className="truncate">{version.version.languages.join(', ')}</span>
                      </div>
                    )}
                    {version.version.publishers && version.version.publishers.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{version.version.publishers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedVersions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No versions found for the selected language.</p>
        </div>
      )}
    </div>
  )
}

