"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Euro, MapPin, Truck, Tag, Eye, Loader2 } from 'lucide-react'
import type { ListingFormData } from '../listing-wizard'

interface PriceDeliveryStepProps {
  formData: ListingFormData
  updateFormData: (updates: Partial<ListingFormData>) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
}

const SHIPPING_OPTIONS = [
  { value: 'local-pickup', label: 'Local Pickup', description: 'Meet in person', defaultCost: '0.00' },
  { value: 'shipping', label: 'Shipping', description: 'Ship to buyer', defaultCost: '5.99' },
]

export function PriceDeliveryStep({ formData, updateFormData, onSubmit, onBack, isSubmitting }: PriceDeliveryStepProps) {
  const [newTag, setNewTag] = useState('')

  const handleShippingMethodToggle = (method: string, enabled: boolean) => {
    if (enabled) {
      const updatedMethods = [...formData.shippingMethods, method]
      const updatedCosts = { ...formData.shippingCosts, [method]: SHIPPING_OPTIONS.find(opt => opt.value === method)?.defaultCost || '0.00' }
      updateFormData({ 
        shippingMethods: updatedMethods,
        shippingCosts: updatedCosts
      })
    } else {
      const updatedMethods = formData.shippingMethods.filter(m => m !== method)
      const updatedCosts = { ...formData.shippingCosts }
      delete updatedCosts[method]
      updateFormData({ 
        shippingMethods: updatedMethods,
        shippingCosts: updatedCosts
      })
    }
  }

  const handleShippingCostChange = (method: string, cost: string) => {
    updateFormData({
      shippingCosts: {
        ...formData.shippingCosts,
        [method]: cost
      }
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({
        tags: [...formData.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData({
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const canSubmit = !!(
    formData.price &&
    formData.city &&
    formData.shippingMethods.length > 0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dark-green text-lg lg:text-xl">Price & Delivery</CardTitle>
        <p className="text-sm text-gray-600">Set your price and delivery options to complete your listing</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-vibrant-orange/10 rounded-lg">
              <Euro className="w-4 h-4 text-vibrant-orange" />
            </div>
            <Label htmlFor="price" className="text-sm font-medium text-dark-green">Game Price (EUR) *</Label>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                value={formData.price}
                onChange={(e) => updateFormData({ price: e.target.value })}
                className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="negotiable"
                checked={formData.negotiable}
                onCheckedChange={(checked) => updateFormData({ negotiable: checked })}
              />
              <Label htmlFor="negotiable" className="text-sm text-gray-700">
                Open to offers
              </Label>
            </div>
          </div>
        </div>

        {/* Shipping Methods Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-vibrant-orange/10 rounded-lg">
              <Truck className="w-4 h-4 text-vibrant-orange" />
            </div>
            <Label className="text-sm font-medium text-dark-green">Shipping Options *</Label>
          </div>
          
          <div className="space-y-3">
            {SHIPPING_OPTIONS.map((option) => (
              <div 
                key={option.value} 
                className={`border rounded-lg p-3 transition-colors ${
                  formData.shippingMethods.includes(option.value)
                    ? 'border-vibrant-orange bg-vibrant-orange/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={formData.shippingMethods.includes(option.value)}
                      onChange={(e) => handleShippingMethodToggle(option.value, e.target.checked)}
                      className="rounded border-gray-300 text-vibrant-orange focus:ring-vibrant-orange"
                    />
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                  {formData.shippingMethods.includes(option.value) && (
                    <div className="flex items-center space-x-2">
                      <Euro className="w-3 h-3 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.shippingCosts[option.value] || ''}
                        onChange={(e) => handleShippingCostChange(option.value, e.target.value)}
                        className="w-20 text-sm border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-vibrant-orange/10 rounded-lg">
              <MapPin className="w-4 h-4 text-vibrant-orange" />
            </div>
            <Label className="text-sm font-medium text-dark-green">Your Location *</Label>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country" className="text-sm text-gray-600">Country</Label>
              <Input
                id="country"
                placeholder="Germany"
                value={formData.country}
                onChange={(e) => updateFormData({ country: e.target.value })}
                className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-sm text-gray-600">City *</Label>
              <Input
                id="city"
                placeholder="Berlin"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
              />
            </div>
            <div>
              <Label htmlFor="local-area" className="text-sm text-gray-600">Local Area (Optional)</Label>
              <Input
                id="local-area"
                placeholder="Mitte, Kreuzberg..."
                value={formData.localArea}
                onChange={(e) => updateFormData({ localArea: e.target.value })}
                className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
              />
            </div>
          </div>

          {/* Pickup Radius */}
          {formData.shippingMethods.includes('local-pickup') && (
            <div className="space-y-2">
              <Label htmlFor="pickup-radius" className="text-sm text-gray-600">
                Local Pickup Radius (km)
              </Label>
              <Input
                id="pickup-radius"
                type="number"
                min="1"
                max="100"
                value={formData.pickupRadius}
                onChange={(e) => updateFormData({ pickupRadius: parseInt(e.target.value) || 50 })}
                className="w-32 border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
              />
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-light-green/10 rounded-lg">
              <Tag className="w-4 h-4 text-light-green" />
            </div>
            <Label className="text-sm font-medium text-dark-green">Tags (Optional)</Label>
          </div>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 border-gray-300 focus:border-light-green focus:ring-1 focus:ring-light-green"
              />
              <Button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                variant="outline"
                size="sm"
                className="border-light-green text-light-green hover:bg-light-green/10"
              >
                Add
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-light-green text-light-green hover:bg-light-green/10"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visibility Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <Label className="text-sm font-medium text-dark-green">Listing Visibility</Label>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={() => updateFormData({ visibility: 'public' })}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Public - Visible to everyone</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={formData.visibility === 'private'}
                onChange={() => updateFormData({ visibility: 'private' })}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Private - Only you can see</span>
            </label>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="bg-vibrant-orange hover:bg-vibrant-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Listing'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
