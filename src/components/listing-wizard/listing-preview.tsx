"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Clock, Cake, Star, Truck, Package, Tag } from 'lucide-react'
import type { ListingFormData } from './listing-wizard'

interface ListingPreviewProps {
  formData: ListingFormData
}

export function ListingPreview({ formData }: ListingPreviewProps) {
  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'new-in-shrink': 'New in Shrink',
      'like-new': 'Like New',
      'excellent': 'Excellent',
      'good': 'Good',
      'fair': 'Fair',
      'poor': 'Poor'
    }
    return labels[condition] || condition
  }



  // Get the best available image: version image first, then game image, then fallback
  const getListingImage = (): string | undefined => {
    // Prefer version image if available, otherwise fall back to game image
    return formData.versionImage || formData.gameImage || undefined
  }

  return (
    <Card className="border-2 border-vibrant-orange bg-gradient-to-r from-warm-yellow/10 to-warm-beige/10">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-vibrant-orange/10 rounded-lg">
            <Star className="w-4 h-4 text-vibrant-orange" />
          </div>
          <div>
            <CardTitle className="text-dark-green text-base">Listing Preview</CardTitle>
            <CardDescription className="text-xs">How your listing will appear to buyers</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">


        {/* Preview Content - Using Games Page Card Design */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden border border-light-beige-200">
          {/* Image Section */}
          <div className="relative h-48 bg-light-beige-100 overflow-hidden">
            {getListingImage() ? (
              <img
                src={getListingImage()}
                alt={formData.customTitle || formData.gameName}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-light-beige-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Condition Badge */}
            {formData.condition && (
              <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium border bg-white/90 backdrop-blur-sm">
                {getConditionLabel(formData.condition)}
              </div>
            )}
            
            {/* Category Badge - Only show if not fixed-price (MVP) */}
            {formData.listingType !== 'fixed-price' && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-dark-green-600 text-white text-xs font-medium">
                {formData.listingType}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
                         {/* Title - Always use primary name */}
             <h3 className="font-game-titles font-semibold text-dark-green-600 text-2xl leading-tight">
               {formData.gameName || 'Game title to be set'}
             </h3>

            {/* Version */}
            {formData.versionName && (
              <p className="text-sm text-gray-600">{formData.versionName}</p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              {formData.price ? (
                <span className="text-2xl font-bold text-vibrant-orange-600">
                  €{formData.price}
                </span>
              ) : (
                <span className="text-lg text-gray-400">Price to be set</span>
              )}
              
              {/* Negotiable Badge */}
              {formData.negotiable && formData.price && (
                <Badge variant="outline" className="text-xs border-vibrant-orange text-vibrant-orange">
                  Open to offers
                </Badge>
              )}
            </div>

            {/* Game Details */}
            {formData.gameDetails && (
              <div className="space-y-3 border-t pt-3">
                {/* Game Details */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-dark-green-600">Game Details</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {formData.gameDetails.minPlayers && formData.gameDetails.maxPlayers && (
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.minPlayers}-{formData.gameDetails.maxPlayers}</span>
                      </div>
                    )}
                    {formData.gameDetails.playingTime && (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.playingTime} min</span>
                      </div>
                    )}
                    {formData.gameDetails.minAge && (
                      <div className="flex items-center">
                        <Cake className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.minAge}+</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Version Details */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-dark-green-600">Version Details</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    {/* Alternate Name - Only show if different from primary */}
                    {formData.customTitle && formData.customTitle !== formData.gameName && (
                      <div className="flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>Alt: {formData.customTitle}</span>
                      </div>
                    )}
                    {/* Year */}
                    {formData.gameDetails.yearPublished && (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.yearPublished}</span>
                      </div>
                    )}
                    {/* Languages */}
                    {formData.gameDetails.languages && formData.gameDetails.languages.length > 0 && (
                      <div className="flex items-center">
                        <Package className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.languages.join(', ')}</span>
                      </div>
                    )}
                    {/* Publishers */}
                    {formData.gameDetails.publishers && formData.gameDetails.publishers.length > 0 && (
                      <div className="flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-vibrant-orange" />
                        <span>{formData.gameDetails.publishers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seller & Location */}
            <div className="flex items-center justify-between text-sm text-dark-green-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Name
              </span>
              {(formData.country || formData.city) ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {formData.city || formData.country}
                </span>
              ) : (
                <span className="text-gray-400">Location to be set</span>
              )}
            </div>

            {/* Additional Details */}
            <div className="space-y-2 text-xs border-t pt-2">
              {/* Extras */}
              {formData.extrasCategories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.extrasCategories.slice(0, 3).map((extra) => (
                    <Badge key={extra} variant="outline" className="text-xs border-light-green text-light-green px-1 py-0">
                      {extra}
                    </Badge>
                  ))}
                  {formData.extrasCategories.length > 3 && (
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-500 px-1 py-0">
                      +{formData.extrasCategories.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Shipping Methods */}
              {formData.shippingMethods.length > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-3 h-3" />
                  <span>{formData.shippingMethods.join(', ')}</span>
                </div>
              )}

              {/* Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-light-green text-light-green px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {formData.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-500 px-1 py-0">
                      +{formData.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
