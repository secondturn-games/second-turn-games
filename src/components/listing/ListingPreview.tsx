"use client"

import Image from 'next/image'
import { 
  Package, 
  ExternalLink, 
  Globe, 
  Languages, 
  Calendar, 
  Building2, 
  Users, 
  Clock, 
  Cake,
  Euro,
  Handshake,
  Container,
  CheckCircle,
  Gift,
  Type,
  Cog,
  Lock,
  PackageCheck,
  PackageX,
  Puzzle,
  MessageCircleQuestion
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ListingFormData } from './types'
import type { BGGGameDetails, LanguageMatchedVersion } from '@/lib/bgg'

interface ListingPreviewProps {
  formData: ListingFormData
  selectedGame: BGGGameDetails | null
  selectedVersion: LanguageMatchedVersion | null
  versions: LanguageMatchedVersion[]
  activeSection: 'versions' | 'condition' | 'price' | 'shipping' | null
  onToggleSection: (section: 'versions' | 'condition' | 'price' | 'shipping') => void
}

export function ListingPreview({ formData, selectedGame, selectedVersion, versions, activeSection, onToggleSection }: ListingPreviewProps) {
  if (!selectedGame) return null

  return (
    <div className="space-y-4">
      {/* Live Preview Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Preview Header */}
        <div className="bg-gradient-to-r from-dark-green-50 to-light-beige-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-medium text-dark-green text-sm">Listing Preview</h4>
          <p className="text-xs text-gray-600">
            {versions.length === 1 
              ? 'Add condition, photos, set price and shipping options to make it shine.'
              : 'If you have a different version, change it - then add condition, photos, set price and shipping options to make it shine.'
            }
          </p>
        </div>
        
        {/* Preview Content */}
        <div className="p-4">
          {/* Mobile Layout: Vertical sections */}
          <div className="block sm:hidden space-y-4">
            {/* Section 1: Game Image */}
            <div className="flex justify-center">
              <div className="w-40 h-40 rounded-lg overflow-hidden bg-light-beige relative">
                {formData.versionImage || formData.gameImage ? (
                  <Image 
                    src={formData.versionImage || formData.gameImage || ''} 
                    alt={selectedGame.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-light-beige rounded flex items-center justify-center">
                    <Package className="w-16 h-16 text-dark-green" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Section 2: Game Details (BGG Info) */}
            <div className="text-center">
              {/* Game Title */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <h3 className="font-game-titles font-semibold text-dark-green-600 text-2xl leading-tight">
                  {selectedGame.name}
                </h3>
                
                {/* BGG Link Icon */}
                <a 
                  href={`https://boardgamegeek.com/boardgame/${selectedGame.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vibrant-orange hover:text-vibrant-orange/80 transition-colors"
                  title="View on BoardGameGeek"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              {/* Version Details */}
              {selectedVersion && formData.gameDetails && (
                <div className="space-y-1 text-xs text-gray-600">
                  {/* Version Info */}
                  {selectedVersion && (
                    <div className="flex items-center justify-center gap-1">
                      <Globe className="w-3 h-3 text-vibrant-orange" />
                      <span>{selectedVersion.version.name}</span>
                    </div>
                  )}
                  
                  {/* Alternate Name */}
                  {formData.customTitle && formData.customTitle !== selectedGame.name && (
                    <div className="flex items-center justify-center gap-1">
                      <Type className="w-3 h-3 text-vibrant-orange" />
                      <span className="italic">{formData.customTitle}</span>
                    </div>
                  )}
                  {/* Languages */}
                  {formData.gameDetails.languages && formData.gameDetails.languages.length > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <Languages className="w-3 h-3 text-vibrant-orange" />
                      <span>{formData.gameDetails.languages.join(', ')}</span>
                    </div>
                  )}
                  
                  {/* Publishing Year */}
                  {formData.gameDetails.yearPublished && (
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-vibrant-orange" />
                      <span>{formData.gameDetails.yearPublished}</span>
                    </div>
                  )}
                  
                  {/* Publishers */}
                  {formData.gameDetails.publishers && formData.gameDetails.publishers.length > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <Building2 className="w-3 h-3 text-vibrant-orange" />
                      <span>{formData.gameDetails.publishers.join(', ')}</span>
                    </div>
                  )}
                  
                  {/* Designers */}
                  {formData.gameDetails.designers && formData.gameDetails.designers.length > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <Cog className="w-3 h-3 text-vibrant-orange" />
                      <span>{formData.gameDetails.designers.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Section 3: User-Provided Game Condition */}
            {formData.gameCondition && (
              <div className="border-t border-gray-100 pt-4 text-center">
                <div className="text-xs text-gray-600 space-y-1">
                  {(() => {
                    const conditions = []
                    
                    // Box Condition - Only show if explicitly selected
                    if (formData.gameCondition.boxCondition && formData.gameCondition.boxCondition !== null) {
                      const boxMap = {
                        'new': { icon: Lock, label: 'Sealed' },
                        'like-new': { icon: PackageCheck, label: 'Like New' },
                        'lightly-worn': { icon: Package, label: 'Lightly Worn' },
                        'damaged': { icon: PackageX, label: 'Damaged' }
                      }
                      const box = boxMap[formData.gameCondition.boxCondition as keyof typeof boxMap]
                      if (box) {
                        const IconComponent = box.icon
                        conditions.push(
                          <div key="box" className="flex items-center justify-center gap-1">
                            <IconComponent className="w-3 h-3 text-vibrant-orange" />
                            <span>{box.label}</span>
                          </div>
                        )
                      }
                    }
                    
                    // Components - Only show if box is not "new" (sealed)
                    if (formData.gameCondition.boxCondition !== 'new' && 
                        (formData.gameCondition.completeness || formData.gameCondition.componentCondition)) {
                      const completenessMap = {
                        'complete': 'Complete',
                        'incomplete': 'Incomplete'
                      }
                      const componentMap = {
                        'like-new': 'Like New',
                        'lightly-used': 'Lightly Used',
                        'well-played': 'Well Played',
                        'damaged': 'Damaged'
                      }
                      
                      const completeness = formData.gameCondition.completeness ? 
                        completenessMap[formData.gameCondition.completeness as keyof typeof completenessMap] : null
                      const component = formData.gameCondition.componentCondition ? 
                        componentMap[formData.gameCondition.componentCondition as keyof typeof componentMap] : null
                      
                      if (completeness || component) {
                        const parts = []
                        if (completeness) parts.push(completeness)
                        if (component) parts.push(component)
                        
                        conditions.push(
                          <div key="components" className="flex items-center justify-center gap-1">
                            <Puzzle className="w-3 h-3 text-vibrant-orange" />
                            <span>{parts.join(' / ')}</span>
                          </div>
                        )
                      }
                    }
                    
                    // Rulebook - Only show if box is not "new" (sealed)
                    
                    // Extras
                    if (formData.gameCondition.extras && formData.gameCondition.extras.length > 0) {
                      const firstExtra = formData.gameCondition.extras[0]
                      const remainingCount = formData.gameCondition.extras.length - 1
                      const moreText = remainingCount > 0 ? ` +${remainingCount} more` : ''
                      conditions.push(
                        <div key="extras" className="flex items-center justify-center gap-1">
                          <Gift className="w-3 h-3 text-vibrant-orange" />
                          <span>{firstExtra}{moreText}</span>
                        </div>
                      )
                    }
                    
                    return conditions
                  })()}
                </div>
              </div>
            )}
            
            {/* Section 4: Price Information */}
            {formData.price && formData.price.amount && (
              <div className="border-t border-gray-100 pt-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display font-semibold text-dark-green-600 text-2xl leading-tight">
                    €{parseFloat(formData.price.amount).toFixed(2)}
                  </span>
                  {formData.price.negotiable && (
                    <MessageCircleQuestion className="w-4 h-4 text-vibrant-orange" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Layout: Image in first column, title spans columns 2+3, details below */}
          <div className="hidden sm:block">
            <div className="flex items-start space-x-6">
              {/* Column 1: Game Image + Game Stats + BGG Info */}
              <div className="w-40 flex-shrink-0 space-y-3">
                {/* Game Image */}
                <div className="w-40 h-40 rounded-lg overflow-hidden bg-light-beige relative">
                  {formData.versionImage || formData.gameImage ? (
                    <Image 
                      src={formData.versionImage || formData.gameImage || ''} 
                      alt={selectedGame.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-light-beige rounded flex items-center justify-center">
                      <Package className="w-16 h-16 text-dark-green" />
                    </div>
                  )}
                </div>
                
                {/* Game Stats - First line */}
                {formData.gameDetails && (
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                    {formData.gameDetails.minPlayers && formData.gameDetails.maxPlayers && (
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.minPlayers}-{formData.gameDetails.maxPlayers}</span>
                      </div>
                    )}
                    {formData.gameDetails.playingTime && (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.playingTime}</span>
                      </div>
                    )}
                    {formData.gameDetails.minAge && (
                      <div className="flex items-center">
                        <Cake className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.minAge}+</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Columns 2+3: Content area */}
              <div className="flex-1 min-w-0">
                {/* Row 1: Game Title spans both columns 2+3 */}
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="font-game-titles font-semibold text-dark-green-600 text-2xl leading-tight">
                    {selectedGame.name}
                  </h3>
                  
                  {/* BGG Link Icon */}
                  <a 
                    href={`https://boardgamegeek.com/boardgame/${selectedGame.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-vibrant-orange hover:text-vibrant-orange/80 transition-colors"
                    title="View on BoardGameGeek"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                {/* Row 2: Two columns for details */}
                <div className="flex space-x-6">
                  {/* Column 2: Game Details (BGG Info) */}
                  <div className="flex-1 min-w-0">
                    {/* Version Details */}
                    {selectedVersion && formData.gameDetails && (
                      <div className="space-y-1 text-xs text-gray-600">
                        {/* Version Info */}
                        {selectedVersion && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-vibrant-orange" />
                            <span>{selectedVersion.version.name}</span>
                          </div>
                        )}
                        
                        {/* Alternate Name */}
                        {formData.customTitle && formData.customTitle !== selectedGame.name && (
                          <div className="flex items-center gap-1">
                            <Type className="w-3 h-3 text-vibrant-orange" />
                            <span className="italic">{formData.customTitle}</span>
                          </div>
                        )}
                        {/* Languages */}
                        {formData.gameDetails.languages && formData.gameDetails.languages.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Languages className="w-3 h-3 text-vibrant-orange" />
                            <span>{formData.gameDetails.languages.join(', ')}</span>
                          </div>
                        )}
                        
                        {/* Publishing Year */}
                        {formData.gameDetails.yearPublished && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-vibrant-orange" />
                            <span>{formData.gameDetails.yearPublished}</span>
                          </div>
                        )}
                        
                        {/* Publishers */}
                        {formData.gameDetails.publishers && formData.gameDetails.publishers.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-vibrant-orange" />
                            <span>{formData.gameDetails.publishers.join(', ')}</span>
                          </div>
                        )}
                        
                        {/* Designers */}
                        {formData.gameDetails.designers && formData.gameDetails.designers.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Cog className="w-3 h-3 text-vibrant-orange" />
                            <span>{formData.gameDetails.designers.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Column 3: User-Provided Game Condition & Price */}
                  {(formData.gameCondition || formData.price) && (
                    <div className="w-56 flex-shrink-0">
                      <div className="text-xs text-gray-600 space-y-1">
                        {(() => {
                          const conditions = []
                          
                          // Box Condition - Only show if explicitly selected
                          if (formData.gameCondition?.boxCondition && formData.gameCondition.boxCondition !== null) {
                            const boxMap = {
                              'new': { icon: Lock, label: 'Sealed' },
                              'like-new': { icon: PackageCheck, label: 'Like New' },
                              'lightly-worn': { icon: Package, label: 'Lightly Worn' },
                              'damaged': { icon: PackageX, label: 'Damaged' }
                            }
                            const box = boxMap[formData.gameCondition.boxCondition as keyof typeof boxMap]
                            if (box) {
                              const IconComponent = box.icon
                              conditions.push(
                                <div key="box" className="flex items-center gap-1">
                                  <IconComponent className="w-3 h-3 text-vibrant-orange" />
                                  <span>{box.label}</span>
                                </div>
                              )
                            }
                          }
                          
                          // Components - Only show if box is not "new" (sealed)
                          if (formData.gameCondition?.boxCondition !== 'new' && 
                              (formData.gameCondition?.completeness || formData.gameCondition?.componentCondition)) {
                            const completenessMap = {
                              'complete': 'Complete',
                              'incomplete': 'Incomplete'
                            }
                            const componentMap = {
                              'like-new': 'Like New',
                              'lightly-used': 'Lightly Used',
                              'well-played': 'Well Played',
                              'damaged': 'Damaged'
                            }
                            
                            const completeness = formData.gameCondition.completeness ? 
                              completenessMap[formData.gameCondition.completeness as keyof typeof completenessMap] : null
                            const component = formData.gameCondition.componentCondition ? 
                              componentMap[formData.gameCondition.componentCondition as keyof typeof componentMap] : null
                            
                            if (completeness || component) {
                              const parts = []
                              if (completeness) parts.push(completeness)
                              if (component) parts.push(component)
                              
                              conditions.push(
                                <div key="components" className="flex items-center gap-1">
                                  <Puzzle className="w-3 h-3 text-vibrant-orange" />
                                  <span>{parts.join(' / ')}</span>
                                </div>
                              )
                            }
                          }
                          
                          
                          // Extras
                          if (formData.gameCondition?.extras && formData.gameCondition.extras.length > 0) {
                            const firstExtra = formData.gameCondition.extras[0]
                            const remainingCount = formData.gameCondition.extras.length - 1
                            const moreText = remainingCount > 0 ? ` +${remainingCount} more` : ''
                            conditions.push(
                              <div key="extras" className="flex items-center gap-1">
                                <Gift className="w-3 h-3 text-vibrant-orange" />
                                <span>{firstExtra}{moreText}</span>
                              </div>
                            )
                          }
                          
                          // Price
                          if (formData.price?.amount) {
                            conditions.push(
                              <div key="price" className="flex items-center gap-2">
                                <span className="font-display font-semibold text-dark-green-600 text-2xl leading-tight">
                                  €{parseFloat(formData.price.amount).toFixed(2)}
                                </span>
                                {formData.price.negotiable && (
                                  <MessageCircleQuestion className="w-4 h-4 text-vibrant-orange" />
                                )}
                              </div>
                            )
                          }
                          
                          return conditions
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
    </div>
  )
}