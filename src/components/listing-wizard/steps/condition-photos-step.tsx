"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star, Camera, Upload, X } from 'lucide-react'
import type { ListingFormData } from '../listing-wizard'

interface ConditionPhotosStepProps {
  formData: ListingFormData
  updateFormData: (updates: Partial<ListingFormData>) => void
  onNext: () => void
  onBack: () => void
}

const CONDITION_OPTIONS = [
  { value: 'new-in-shrink', label: 'New in Shrink', description: 'Brand new, never opened, still in original shrink wrap' },
  { value: 'like-new', label: 'Like New', description: 'Opened but never played, components like new' },
  { value: 'excellent', label: 'Excellent', description: 'Played but very well maintained, minimal wear' },
  { value: 'good', label: 'Good', description: 'Some visible wear, all components present and functional' },
  { value: 'fair', label: 'Fair', description: 'Noticeable wear, may have minor damage but fully playable' },
  { value: 'poor', label: 'Poor', description: 'Significant wear or damage, missing pieces possible' }
]

const EXTRAS_OPTIONS = [
  'Sleeved Cards',
  'Painted Miniatures', 
  'Custom Organizer/Insert',
  'Upgraded Components',
  'Metal Coins',
  'Wooden Tokens',
  'Playmat Included',
  'Storage Solution',
  'Extra Dice',
  'Promo Cards/Items'
]

export function ConditionPhotosStep({ formData, updateFormData, onNext, onBack }: ConditionPhotosStepProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleConditionChange = (condition: ListingFormData['condition']) => {
    updateFormData({ condition })
  }

  const handleConditionFlagChange = (flag: keyof ListingFormData['conditionFlags'], value: boolean) => {
    updateFormData({
      conditionFlags: {
        ...formData.conditionFlags,
        [flag]: value
      }
    })
  }

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return
    
    const newPhotos = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    )
    
    const updatedPhotos = [...formData.photos, ...newPhotos].slice(0, 3) // Max 3 photos
    updateFormData({ photos: updatedPhotos })
  }

  const handlePhotoRemove = (index: number) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index)
    updateFormData({ photos: updatedPhotos })
  }

  const handleExtrasToggle = (extra: string) => {
    const updatedExtras = formData.extrasCategories.includes(extra)
      ? formData.extrasCategories.filter(e => e !== extra)
      : [...formData.extrasCategories, extra]
    
    updateFormData({ extrasCategories: updatedExtras })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handlePhotoUpload(e.dataTransfer.files)
  }

  const canContinue = !!formData.condition

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dark-green text-lg lg:text-xl">Condition & Photos</CardTitle>
        <p className="text-sm text-gray-600">Describe the condition of your game and add photos to help buyers</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Condition Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-vibrant-orange/10 rounded-lg">
              <Star className="w-4 h-4 text-vibrant-orange" />
            </div>
            <Label className="text-sm font-medium text-dark-green">Game Condition *</Label>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {CONDITION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.condition === option.value
                    ? 'border-vibrant-orange bg-vibrant-orange/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value={option.value}
                  checked={formData.condition === option.value}
                  onChange={() => handleConditionChange(option.value as ListingFormData['condition'])}
                  className="mt-1 text-vibrant-orange focus:ring-vibrant-orange"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quick Condition Checkboxes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-dark-green">Quick Condition Details</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(formData.conditionFlags).map(([flag, value]) => (
              <label
                key={flag}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleConditionFlagChange(flag as keyof ListingFormData['conditionFlags'], e.target.checked)}
                  className="rounded border-gray-300 text-vibrant-orange focus:ring-vibrant-orange"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {flag.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Condition Notes */}
        <div className="space-y-2">
          <Label htmlFor="condition-notes" className="text-sm font-medium text-dark-green">
            Additional Condition Notes (Optional)
          </Label>
          <Textarea
            id="condition-notes"
            placeholder="Describe any missing pieces, damage, or other condition details..."
            value={formData.conditionNotes}
            onChange={(e) => updateFormData({ conditionNotes: e.target.value })}
            rows={3}
            className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
          />
        </div>

        {/* Photos Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-dark-green">
            Photos (Optional, max 3)
          </Label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-vibrant-orange bg-vibrant-orange/5'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
          </div>
          
          <input
            id="photo-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handlePhotoUpload(e.target.files)}
          />

          {/* Photo Preview */}
          {formData.photos.length > 0 && (
            <div className="flex space-x-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                  <button
                    onClick={() => handlePhotoRemove(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center truncate">{photo.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extras Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-dark-green">
            Extras & Add-ons (Optional)
          </Label>
          
          <div className="grid grid-cols-2 gap-2">
            {EXTRAS_OPTIONS.map((extra) => (
              <label
                key={extra}
                className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                  formData.extrasCategories.includes(extra)
                    ? 'border-light-green bg-light-green/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.extrasCategories.includes(extra)}
                  onChange={() => handleExtrasToggle(extra)}
                  className="rounded border-gray-300 text-light-green focus:ring-light-green"
                />
                <span className="text-sm">{extra}</span>
              </label>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="extras-notes" className="text-sm text-gray-600">
              Other extras or special features
            </Label>
            <Textarea
              id="extras-notes"
              placeholder="Describe any other extras, upgrades, or special features..."
              value={formData.extrasNotes}
              onChange={(e) => updateFormData({ extrasNotes: e.target.value })}
              rows={2}
              className="border-gray-300 focus:border-light-green focus:ring-1 focus:ring-light-green"
            />
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
            onClick={onNext}
            disabled={!canContinue}
            className="bg-vibrant-orange hover:bg-vibrant-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
