"use client"

import { CONDITION_FILTERS, BOX_CONDITIONS, COMPLETENESS_OPTIONS, COMPONENT_CONDITIONS, EXTRAS_OPTIONS } from './config'
import { ImageUpload } from '@/components/upload/ImageUpload'
import { UploadedImage } from '@/lib/upload/types'

interface GameConditionFormProps {
  condition: NonNullable<import('./types').ListingFormData['gameCondition']>
  onUpdate: (updates: Partial<NonNullable<import('./types').ListingFormData['gameCondition']>>) => void
}

export function GameConditionForm({ condition, onUpdate }: GameConditionFormProps) {
  const renderConditionOptions = (options: typeof BOX_CONDITIONS, selectedValue: string | null, onSelect: (id: string) => void) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option) => {
        const IconComponent = option.icon
        const isSelected = selectedValue === option.id
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              isSelected 
                ? 'border-vibrant-orange bg-orange-50' 
                : 'border-gray-200 hover:border-vibrant-orange hover:text-vibrant-orange'
            }`}
          >
            <div className="flex items-start gap-3">
              <IconComponent className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-vibrant-orange' : 'text-gray-400'}`} />
              <div>
                <h6 className={`font-medium text-sm ${isSelected ? 'text-vibrant-orange' : 'text-gray-900'}`}>{option.title}</h6>
                <p className={`text-xs mt-1 ${isSelected ? 'text-gray-600' : 'text-gray-600'}`}>{option.description}</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )

  const renderFilterTabs = () => {
    const isNewBox = condition.boxCondition === 'new'
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {CONDITION_FILTERS.map((filter) => {
          const IconComponent = filter.icon
          const isSelected = condition.activeFilter === filter.id
          const isDisabled = isNewBox && filter.id === 'components'
          
          return (
            <button
              key={filter.id}
              onClick={() => {
                if (!isDisabled) {
                  onUpdate({ activeFilter: filter.id as 'box' | 'components' | 'extras' | 'photos' })
                }
              }}
              disabled={isDisabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs border transition-all ${
                isSelected 
                  ? 'border-vibrant-orange bg-vibrant-orange text-white' 
                  : isDisabled
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-vibrant-orange hover:text-vibrant-orange'
              }`}
              title={isDisabled ? 'Not available for sealed games' : undefined}
            >
              <IconComponent className="w-4 h-4" />
              {filter.label}
            </button>
          )
        })}
      </div>
    )
  }

  const renderActiveFilterContent = () => {
    if (!condition.activeFilter) return null

    switch (condition.activeFilter) {
      case 'box':
        return (
          <div>
            <p className="text-xs text-gray-600 mb-4">
              Tell buyers about the game&apos;s outer box — is it fresh and sturdy, or has it seen a few gaming nights?
            </p>
            
            {renderConditionOptions(
              BOX_CONDITIONS,
              condition.boxCondition,
              (id) => {
                const updates: Partial<NonNullable<import('./types').ListingFormData['gameCondition']>> = { boxCondition: id }
                
                // If selecting "new", switch to box tab and clear component data
                if (id === 'new') {
                  updates.activeFilter = 'box'
                  updates.completeness = null
                  updates.componentCondition = null
                  updates.componentConditionDescription = null
                  updates.missingDescription = null
                }
                
                onUpdate(updates)
              }
            )}
            
            {/* Optional text field */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Box condition details (optional)
              </label>
              <textarea
                placeholder="Anything else about the box condition?"
                value={condition.boxDescription || ''}
                onChange={(e) => onUpdate({ boxDescription: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                rows={2}
              />
            </div>
          </div>
        )

      case 'components':
        return (
          <div>
            <p className="text-xs text-gray-600 mb-4">
              How complete is your game? Missing pieces can affect the playing experience.
            </p>
            
            {/* Step 1: Completeness */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Completeness</h5>
              {renderConditionOptions(
                COMPLETENESS_OPTIONS,
                condition.completeness,
                (id) => onUpdate({ completeness: id })
              )}
              
              {condition.completeness && condition.completeness !== 'complete' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What&apos;s missing? *
                  </label>
                  <textarea
                    placeholder="Describe what components are missing..."
                    value={condition.missingDescription || ''}
                    onChange={(e) => onUpdate({ missingDescription: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>
            
            {/* Step 2: Component Condition */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Component Condition</h5>
              <p className="text-xs text-gray-600 mb-3">
                What&apos;s the condition of the components that are present?
              </p>
              {renderConditionOptions(
                COMPONENT_CONDITIONS,
                condition.componentCondition,
                (id) => onUpdate({ componentCondition: id })
              )}
              
              {condition.componentCondition && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Component condition details (optional)
                  </label>
                  <textarea
                    placeholder="Any specific details about the component condition?"
                    value={condition.componentConditionDescription || ''}
                    onChange={(e) => onUpdate({ componentConditionDescription: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>
        )


      case 'extras':
        return (
          <div>
            <p className="text-xs text-gray-600 mb-4">
              Sometimes games come with a little extra magic. Mention anything special that makes your copy unique.
            </p>
            
            {/* Extras Options */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {EXTRAS_OPTIONS.map((extra) => {
                  const isSelected = condition.extras?.includes(extra) || false
                  return (
                    <button
                      key={extra}
                      onClick={() => {
                        const currentExtras = condition.extras || []
                        const newExtras = isSelected 
                          ? currentExtras.filter(e => e !== extra)
                          : [...currentExtras, extra]
                        onUpdate({ extras: newExtras })
                      }}
                      className={`px-3 py-2 rounded-md text-xs border transition-all ${
                        isSelected 
                          ? 'border-vibrant-orange bg-vibrant-orange text-white' 
                          : 'border-gray-300 bg-white text-gray-700 hover:border-vibrant-orange hover:text-vibrant-orange'
                      }`}
                    >
                      {extra}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Optional text field */}
            <div>
              <textarea
                placeholder="Describe any extras or modifications."
                value={condition.extrasDescription || ''}
                onChange={(e) => onUpdate({ extrasDescription: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                rows={2}
              />
            </div>
          </div>
        )

      case 'photos':
        return (
          <div>
            <p className="text-xs text-gray-600 mb-4">
              Photos help buyers see exactly what they&apos;re getting. Upload clear images of the game components.
            </p>
            
            <ImageUpload
              onImagesChange={(images: UploadedImage[]) => {
                onUpdate({ photos: images.map(img => img.url) })
              }}
              maxFiles={10}
              maxFileSize={5 * 1024 * 1024} // 5MB
              existingImages={condition.photos?.map((url, index) => ({
                id: `existing-${index}`,
                url,
                filename: `photo-${index + 1}`,
                size: 0,
                mimeType: 'image/jpeg',
                uploadedAt: new Date()
              })) || []}
            />
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo notes
              </label>
              <textarea
                placeholder="Describe what the photos show..."
                value={condition.photoNotes || ''}
                onChange={(e) => onUpdate({ photoNotes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                rows={2}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <h4 className="font-medium text-dark-green">Game Condition</h4>
        <p className="text-xs text-gray-600 mt-1">
          Every game tells a story — some are fresh from the shelf, others have been on many adventures. 
          Let buyers know what kind of journey your copy has had. The more detail you share, the easier 
          it is for someone else to make their next move with confidence.
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {renderFilterTabs()}
        {renderActiveFilterContent()}
      </div>
    </div>
  )
}
