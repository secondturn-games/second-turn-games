"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag, Gavel, Gift, Repeat, Package } from 'lucide-react'
import type { ListingFormData } from '../listing-wizard'

interface ListingTypeStepProps {
  formData: ListingFormData
  updateFormData: (updates: Partial<ListingFormData>) => void
  onNext: () => void
}

const LISTING_TYPES = [
  {
    key: 'fixed-price' as const,
    title: 'Fixed Price',
    description: 'List one game (base or expansion) at a set price',
    icon: Tag
  }
]

const COMING_SOON_FEATURES = [
  {
    title: 'Auction',
    description: 'Let community decide',
    icon: Gavel
  },
  {
    title: 'Bundle',
    description: 'Sell more together',
    icon: Package
  },
  {
    title: 'Trade',
    description: 'Game for game',
    icon: Repeat
  },
  {
    title: 'Giveaway',
    description: 'Pass it forward',
    icon: Gift
  }
]

export function ListingTypeStep({ formData, updateFormData, onNext }: ListingTypeStepProps) {
  const handleListingTypeSelect = (type: 'fixed-price' | 'auction' | 'giveaway' | 'trade') => {
    if (type === 'fixed-price') {
      updateFormData({ listingType: type })
      onNext() // Auto-proceed to step 2 for the only available option
    }
    // Other types are coming soon, so no action needed
  }

  const canContinue = formData.listingType === 'fixed-price'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dark-green text-lg lg:text-xl">Choose Listing Type</CardTitle>
        <p className="text-sm text-gray-600">Select how you want to list your game</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Fixed Price Card - MVP Available */}
          {LISTING_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = formData.listingType === type.key

            return (
                             <Card 
                 key={type.key}
                 className={`border-l-4 transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-white ${
                   isSelected 
                     ? 'border-l-vibrant-orange bg-vibrant-orange/10 hover:bg-vibrant-orange/15 shadow-medium' 
                     : 'border-l-vibrant-orange bg-white hover:bg-vibrant-orange/5 hover:shadow-medium'
                 }`}
                 onClick={() => handleListingTypeSelect(type.key)}
               >
                <CardContent className="p-2 lg:p-3">
                  <div className="flex items-center space-x-2">
                                         <div className={`p-1.5 lg:p-2 rounded-md transition-all duration-200 ${
                       isSelected 
                         ? 'bg-vibrant-orange/20 shadow-soft' 
                         : 'bg-vibrant-orange/15 hover:bg-vibrant-orange/25'
                     }`}>
                       <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${
                         isSelected 
                           ? 'text-vibrant-orange' 
                           : 'text-vibrant-orange-600'
                       }`} />
                     </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                                                 <h3 className={`font-bold text-sm lg:text-base truncate ${
                           isSelected 
                             ? 'text-vibrant-orange' 
                             : 'text-vibrant-orange-600'
                         }`}>
                           {type.title}
                         </h3>
                       </div>
                       <p className={`text-xs mt-1 text-vibrant-orange-500 leading-tight ${
                         isSelected 
                           ? 'text-vibrant-orange-600' 
                           : 'text-vibrant-orange-500'
                       }`}>
                         {type.description}
                       </p>
                    </div>
                                         {isSelected && (
                       <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-vibrant-orange flex items-center justify-center shadow-soft flex-shrink-0">
                         <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white"></div>
                       </div>
                     )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Continue Button - Positioned between cards */}
          <div className="flex justify-end pt-2 lg:pt-3">
            <Button 
              onClick={onNext} 
              disabled={!canContinue}
              variant="default"
              size="default"
              className="w-full sm:w-auto"
            >
              Continue
            </Button>
          </div>

          {/* Coming Soon Features - Combined Card */}
          <Card className="border-l-4 border-l-light-beige-300 bg-light-beige-50 opacity-75">
            <CardContent className="p-2 lg:p-3">
              <div className="mb-2">
                <h3 className="text-xs lg:text-sm font-semibold text-gray-500 mb-1">Coming Soon</h3>
                <p className="text-xs text-gray-400">More listing options are in development</p>
              </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 lg:gap-2">
                 {COMING_SOON_FEATURES.map((feature, index) => {
                   const Icon = feature.icon
                   return (
                     <div key={index} className="flex items-center space-x-2 p-1.5 rounded-md bg-white/60 hover:bg-white/80 transition-all duration-200">
                       <div className="p-1 rounded-sm bg-gray-200 flex-shrink-0">
                         <Icon className="w-3 h-3 text-gray-400" />
                       </div>
                       <div className="min-w-0 flex-1">
                         <h4 className="font-medium text-xs text-gray-500 truncate">{feature.title}</h4>
                         <p className="text-xs text-gray-400 leading-tight">{feature.description}</p>
                       </div>
                     </div>
                   )
                 })}
               </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
