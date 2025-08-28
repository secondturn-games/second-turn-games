"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Euro, Gavel, Package, RefreshCw, Gift } from 'lucide-react'
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
  },
]

const COMING_SOON_FEATURES = [
  {
    title: 'Auction',
    description: 'Let the community decide the price',
    icon: Gavel,
  },
  {
    title: 'Bundle',
    description: 'Sell multiple games together',
    icon: Package,
  },
  {
    title: 'Trade / Swap',
    description: 'Exchange games with other users',
    icon: RefreshCw,
  },
  {
    title: 'Giveaway',
    description: 'Pass your game forward for free',
    icon: Gift,
  },
]

export function ListingTypeStep({ formData, updateFormData, onNext }: ListingTypeStepProps) {
  const handleListingTypeSelect = (listingType: ListingFormData['listingType']) => {
    updateFormData({ listingType })
  }

  const canContinue = !!formData.listingType

  return (
         <Card className="border-2 border-light-beige-200 shadow-medium">
       <CardHeader>
         <CardTitle className="text-dark-green text-base lg:text-lg font-bold">Choose Listing Type</CardTitle>
         <p className="text-xs lg:text-sm text-dark-green-600">Set the stage for your game&apos;s next adventure</p>
       </CardHeader>
       <CardContent className="space-y-3">
         <div className="grid grid-cols-1 gap-3">
          {/* Fixed Price Card - MVP Available */}
          {LISTING_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = formData.listingType === type.key

            return (
                             <Card 
                 key={type.key}
                 className={`border-l-4 transition-all duration-200 cursor-pointer hover:scale-105 ${
                   isSelected 
                     ? 'border-l-dark-green bg-dark-green/10 hover:bg-dark-green/15 shadow-medium' 
                     : 'border-l-dark-green bg-dark-green/5 hover:bg-dark-green/10 hover:shadow-medium'
                 }`}
                 onClick={() => handleListingTypeSelect(type.key)}
               >
                 <CardContent className="p-3 lg:p-4">
                   <div className="flex items-center space-x-2 lg:space-x-3">
                     <div className={`p-2 lg:p-3 rounded-lg transition-all duration-200 ${
                       isSelected 
                         ? 'bg-dark-green/20 shadow-soft' 
                         : 'bg-dark-green/15 hover:bg-dark-green/25'
                     }`}>
                       <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${
                         isSelected 
                           ? 'text-dark-green' 
                           : 'text-dark-green-600'
                       }`} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <h3 className={`font-bold text-base lg:text-lg truncate ${
                           isSelected 
                             ? 'text-dark-green' 
                             : 'text-dark-green-700'
                         }`}>
                           {type.title}
                         </h3>
                       </div>
                       <p className={`text-xs lg:text-sm mt-1 text-dark-green-500 leading-tight ${
                         isSelected 
                           ? 'text-dark-green-600' 
                           : 'text-dark-green-500'
                       }`}>
                         {type.description}
                       </p>
                     </div>
                     {isSelected && (
                       <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-dark-green flex items-center justify-center shadow-soft flex-shrink-0">
                         <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-white"></div>
                       </div>
                     )}
                   </div>
                 </CardContent>
               </Card>
            )
          })}

                     {/* Coming Soon Features - Combined Card */}
           <Card className="border-l-4 border-l-light-beige-300 bg-light-beige-50">
             <CardContent className="p-3 lg:p-4">
               <div className="mb-3">
                 <h3 className="text-sm lg:text-base font-semibold text-dark-green-600 mb-1">Coming Soon</h3>
                 <p className="text-xs text-dark-green-500">More listing options are in development</p>
               </div>
               <div className="grid grid-cols-1 gap-2 lg:gap-3">
                 {COMING_SOON_FEATURES.map((feature, index) => {
                   const Icon = feature.icon
                   return (
                     <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-all duration-200">
                       <div className="p-1.5 rounded-md bg-light-beige-200 flex-shrink-0">
                         <Icon className="w-4 h-4 text-dark-green-400" />
                       </div>
                       <div className="min-w-0 flex-1">
                         <h4 className="font-medium text-xs text-dark-green-600 truncate">{feature.title}</h4>
                         <p className="text-xs text-dark-green-500 leading-tight">{feature.description}</p>
                       </div>
                     </div>
                   )
                 })}
               </div>
             </CardContent>
           </Card>
        </div>
        
                 <div className="flex justify-end pt-3 lg:pt-4">
           <Button 
             onClick={onNext} 
             disabled={!canContinue}
             size="default"
             className="px-4 lg:px-6 py-2 lg:py-2.5 text-sm font-semibold shadow-medium hover:shadow-lg w-full sm:w-auto"
           >
             Continue
           </Button>
         </div>
      </CardContent>
    </Card>
  )
}
