"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Euro, Gavel, Package, RefreshCw, Gift, Heart } from 'lucide-react'
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
    description: 'Set your price and sell directly',
    icon: Euro,
    available: true,
    color: 'vibrant-orange',
  },
  {
    key: 'auction' as const,
    title: 'Auction',
    description: 'Let the community decide the price',
    icon: Gavel,
    available: false,
    color: 'gray',
  },
  {
    key: 'bundle' as const,
    title: 'Bundle',
    description: 'Sell multiple games together',
    icon: Package,
    available: false,
    color: 'gray',
  },
  {
    key: 'trade' as const,
    title: 'Trade / Swap',
    description: 'Exchange games with other users',
    icon: RefreshCw,
    available: false,
    color: 'gray',
  },
  {
    key: 'giveaway' as const,
    title: 'Giveaway',
    description: 'Pass your game forward for free',
    icon: Gift,
    available: false,
    color: 'gray',
  },
]

export function ListingTypeStep({ formData, updateFormData, onNext }: ListingTypeStepProps) {
  const handleListingTypeSelect = (listingType: ListingFormData['listingType']) => {
    updateFormData({ listingType })
  }

  const canContinue = !!formData.listingType

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dark-green text-lg lg:text-xl">Choose Listing Type</CardTitle>
        <p className="text-sm text-gray-600">Set the stage for your game's next adventure</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {LISTING_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = formData.listingType === type.key
            const isAvailable = type.available

            return (
              <Card 
                key={type.key}
                className={`border-l-4 transition-colors cursor-pointer ${
                  isSelected 
                    ? `border-l-${type.color} bg-${type.color}/5 hover:bg-${type.color}/10` 
                    : isAvailable
                      ? 'border-l-gray-200 hover:border-l-gray-300 hover:bg-gray-50'
                      : 'border-l-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                onClick={() => isAvailable && handleListingTypeSelect(type.key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? `bg-${type.color}/10` 
                        : isAvailable 
                          ? 'bg-gray-100' 
                          : 'bg-gray-200'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isSelected 
                          ? `text-${type.color}` 
                          : isAvailable 
                            ? 'text-gray-600' 
                            : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${
                          isSelected 
                            ? 'text-dark-green' 
                            : isAvailable 
                              ? 'text-gray-700' 
                              : 'text-gray-500'
                        }`}>
                          {type.title}
                        </h3>
                        {!isAvailable && (
                          <Badge variant="outline" className="text-xs border-vibrant-orange text-vibrant-orange">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isSelected 
                          ? 'text-gray-700' 
                          : isAvailable 
                            ? 'text-gray-600' 
                            : 'text-gray-400'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                    {isSelected && isAvailable && (
                      <div className="w-4 h-4 rounded-full bg-vibrant-orange flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onNext} 
            disabled={!canContinue}
            className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
