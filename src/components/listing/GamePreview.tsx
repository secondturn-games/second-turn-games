"use client"

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  Users, 
  Clock, 
  Cake, 
  Package, 
  Type, 
  Languages, 
  Building2, 
  ExternalLink 
} from 'lucide-react'
import type { ListingFormData } from './types'
import type { BGGGameDetails, LanguageMatchedVersion } from '@/lib/bgg'

interface GamePreviewProps {
  formData: ListingFormData
  selectedGame: BGGGameDetails | null
  selectedVersion: LanguageMatchedVersion | null
  versions: LanguageMatchedVersion[]
  activeSection: 'versions' | 'condition' | 'price' | 'shipping' | null
  onToggleSection: (section: 'versions' | 'condition' | 'price' | 'shipping') => void
  onReset: () => void
}

export function GamePreview({
  formData,
  selectedGame,
  selectedVersion,
  versions,
  activeSection,
  onToggleSection,
  onReset
}: GamePreviewProps) {
  if (!selectedGame || !selectedVersion) return null

  return (
    <Card className="border-2 border-vibrant-orange bg-gradient-to-br from-orange-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Game Image */}
          <div className="flex-shrink-0">
            {formData.gameImage ? (
              <Image 
                src={formData.gameImage} 
                alt={formData.gameName || 'Game'} 
                width={120} 
                height={120} 
                className="w-30 h-30 object-contain rounded-lg bg-light-beige border border-gray-200"
              />
            ) : (
              <div className="w-30 h-30 bg-light-beige rounded-lg flex items-center justify-center border border-gray-200">
                <Package className="w-12 h-12 text-dark-green" />
              </div>
            )}
          </div>

          {/* Game Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-dark-green mb-2">
                  {formData.gameName}
                </h3>
                
                {formData.gameDetails && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{formData.gameDetails.minPlayers}-{formData.gameDetails.maxPlayers} players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formData.gameDetails.playingTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cake className="w-3 h-3" />
                      <span>Age {formData.gameDetails.minAge}+</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formData.gameDetails.yearPublished}</span>
                    </div>
                  </div>
                )}

                {/* Version Info */}
                <div className="text-sm text-gray-700 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Type className="w-4 h-4" />
                    <span className="font-medium">Version:</span>
                    <span>{formData.versionName}</span>
                  </div>
                  
                  {selectedVersion.version.languages && selectedVersion.version.languages.length > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <Languages className="w-4 h-4" />
                      <span className="font-medium">Languages:</span>
                      <span>{selectedVersion.version.languages.join(', ')}</span>
                    </div>
                  )}
                  
                  {selectedVersion.version.publishers && selectedVersion.version.publishers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">Publisher:</span>
                      <span>{selectedVersion.version.publishers.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* BGG Link */}
              <a
                href={`https://boardgamegeek.com/boardgame/${formData.bggGameId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-vibrant-orange hover:text-vibrant-orange/80 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                BGG
              </a>
            </div>

            {/* Edit Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {/* Other Versions Button - Only show when multiple versions available */}
                {versions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleSection('versions')}
                    className={`text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 ${
                      activeSection === 'versions' ? 'bg-gray-100 border-gray-400' : ''
                    }`}
                    aria-expanded={activeSection === 'versions'}
                    aria-label="Toggle other versions section"
                  >
                    Other Versions ⌵
                  </Button>
                )}
                
                {/* Game Condition Button - Always visible */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleSection('condition')}
                  className={`text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 ${
                    activeSection === 'condition' ? 'bg-gray-100 border-gray-400' : ''
                  }`}
                  aria-expanded={activeSection === 'condition'}
                  aria-label="Toggle game condition section"
                >
                  Game Condition ⌵
                </Button>
                
                {/* Price Button - Always visible */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleSection('price')}
                  className={`text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 ${
                    activeSection === 'price' ? 'bg-gray-100 border-gray-400' : ''
                  }`}
                  aria-expanded={activeSection === 'price'}
                  aria-label="Toggle price section"
                >
                  Price ⌵
                </Button>
                
                {/* Shipping Button - Always visible */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleSection('shipping')}
                  className={`text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 ${
                    activeSection === 'shipping' ? 'bg-gray-100 border-gray-400' : ''
                  }`}
                  aria-expanded={activeSection === 'shipping'}
                  aria-label="Toggle shipping section"
                >
                  Shipping ⌵
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
