"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Clock, Cake, Star, Euro, MapPin, Truck, Package, Ruler, Weight, Languages, Building2, Tag, Camera } from 'lucide-react'
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

  const getShippingMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'local-pickup': 'Local Pickup',
      'shipping': 'Shipping'
    }
    return labels[method] || method
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
        {/* Preview Content */}
        <div className="bg-white rounded-lg p-3 shadow-sm border">
          {/* Game Header */}
          <div className="flex items-start space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-dark-green leading-tight mb-1">
                {formData.customTitle || formData.gameName}
              </h3>
              {formData.versionName && (
                <p className="text-xs text-gray-600 mb-2">{formData.versionName}</p>
              )}
              
              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-vibrant-orange" />
                  <span>2023</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1 text-vibrant-orange" />
                  <span>2-4p</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="text-center mb-3 p-2 bg-gray-50 rounded">
            {formData.price ? (
              <div className="text-xl font-bold text-vibrant-orange">€{formData.price}</div>
            ) : (
              <div className="text-sm text-gray-400">Add price in Step 4</div>
            )}
            {formData.condition && (
              <div className="text-xs text-gray-500">{getConditionLabel(formData.condition)}</div>
            )}
            {formData.negotiable && (
              <Badge variant="outline" className="text-xs border-vibrant-orange text-vibrant-orange mt-1">
                Open to offers
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs">
            {/* Condition */}
            {formData.condition && (
              <div>
                <div className="flex items-center mb-1">
                  <Star className="w-3 h-3 mr-1 text-vibrant-orange" />
                  <span className="font-medium text-dark-green">Condition</span>
                </div>
                <div className="text-gray-600 ml-4">{getConditionLabel(formData.condition)}</div>
                {formData.conditionNotes && (
                  <div className="text-gray-500 ml-4 truncate">{formData.conditionNotes}</div>
                )}
              </div>
            )}

            {/* Extras */}
            {formData.extrasCategories.length > 0 && (
              <div>
                <div className="flex items-center mb-1">
                  <Package className="w-3 h-3 mr-1 text-light-green" />
                  <span className="font-medium text-dark-green">Extras</span>
                </div>
                <div className="ml-4 flex flex-wrap gap-1">
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
              </div>
            )}

            {/* Photos */}
            {formData.photos.length > 0 && (
              <div>
                <div className="flex items-center mb-1">
                  <Camera className="w-3 h-3 mr-1 text-blue-500" />
                  <span className="font-medium text-dark-green">Photos ({formData.photos.length})</span>
                </div>
                <div className="ml-4 flex space-x-1">
                  {formData.photos.slice(0, 4).map((photo, index) => (
                    <div key={index} className="w-6 h-6 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
                      <Camera className="w-3 h-3 text-blue-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping */}
            {formData.shippingMethods.length > 0 && (
              <div>
                <div className="flex items-center mb-1">
                  <Truck className="w-3 h-3 mr-1 text-vibrant-orange" />
                  <span className="font-medium text-dark-green">Delivery</span>
                </div>
                <div className="ml-4 space-y-1">
                  {formData.shippingMethods.slice(0, 2).map((method, index) => (
                    <div key={method} className="flex justify-between text-gray-600">
                      <span className="truncate">{getShippingMethodLabel(method)}</span>
                      <span>€{formData.shippingCosts[method] || '0.00'}</span>
                    </div>
                  ))}
                  {formData.shippingMethods.length > 2 && (
                    <div className="text-gray-500">+{formData.shippingMethods.length - 2} more options</div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {(formData.country || formData.city) && (
              <div>
                <div className="flex items-center mb-1">
                  <MapPin className="w-3 h-3 mr-1 text-vibrant-orange" />
                  <span className="font-medium text-dark-green">Location</span>
                </div>
                <div className="ml-4 text-gray-600">
                  {formData.country}{formData.city && `, ${formData.city}`}
                </div>
                {formData.shippingMethods.includes('local-pickup') && (
                  <div className="ml-4 text-xs text-gray-500">
                    Local pickup within {formData.pickupRadius} km
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {formData.tags.length > 0 && (
              <div>
                <div className="flex items-center mb-1">
                  <Tag className="w-3 h-3 mr-1 text-light-green" />
                  <span className="font-medium text-dark-green">Tags</span>
                </div>
                <div className="ml-4 flex flex-wrap gap-1">
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
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
