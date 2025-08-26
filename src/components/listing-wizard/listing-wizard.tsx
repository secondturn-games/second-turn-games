"use client"

import { useState } from 'react'
import { ListingTypeStep } from './steps/listing-type-step'
import { GameSelectionStep } from './steps/game-selection-step'
import { ConditionPhotosStep } from './steps/condition-photos-step'
import { PriceDeliveryStep } from './steps/price-delivery-step'
import { ListingPreview } from './listing-preview'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'

export type ListingStep = 'listing-type' | 'game-selection' | 'condition-photos' | 'price-delivery'

export interface ListingFormData {
  // Step 1: Listing Type
  listingType: 'fixed-price' | 'auction' | 'bundle' | 'trade' | 'giveaway'
  
  // Step 2: Game Selection
  bggGameId: string
  bggVersionId: string | null
  gameName: string
  versionName: string | null
  suggestedAlternateName: string | null
  customTitle: string | null
  
  // Step 3: Condition & Photos
  condition: 'new-in-shrink' | 'like-new' | 'excellent' | 'good' | 'fair' | 'poor'
  conditionNotes: string
  conditionFlags: {
    sleeved: boolean
    missingParts: boolean
    inserts: boolean
    writtenOn: boolean
    smokeFree: boolean
    petFree: boolean
  }
  photos: File[]
  extrasCategories: string[]
  extrasNotes: string
  
  // Step 4: Price & Delivery
  price: string
  negotiable: boolean
  country: string
  city: string
  localArea: string
  pickupRadius: number
  shippingMethods: string[]
  shippingCosts: Record<string, string>
  tags: string[]
  visibility: 'public' | 'private' | 'friends-only'
}

const initialFormData: ListingFormData = {
  listingType: 'fixed-price',
  bggGameId: '',
  bggVersionId: null,
  gameName: '',
  versionName: null,
  suggestedAlternateName: null,
  customTitle: null,
  condition: 'good',
  conditionNotes: '',
  conditionFlags: {
    sleeved: false,
    missingParts: false,
    inserts: false,
    writtenOn: false,
    smokeFree: true,
    petFree: true,
  },
  photos: [],
  extrasCategories: [],
  extrasNotes: '',
  price: '',
  negotiable: false,
  country: 'Germany', // Default
  city: '',
  localArea: '',
  pickupRadius: 50,
  shippingMethods: ['local-pickup'],
  shippingCosts: { 'local-pickup': '0.00' },
  tags: [],
  visibility: 'public',
}

export function ListingWizard() {
  const [currentStep, setCurrentStep] = useState<ListingStep>('listing-type')
  const [formData, setFormData] = useState<ListingFormData>(initialFormData)
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps: { key: ListingStep; title: string; description: string }[] = [
    { key: 'listing-type', title: 'Listing Type', description: 'Choose how to sell your game' },
    { key: 'game-selection', title: 'Game Selection', description: 'Find and select your game' },
    { key: 'condition-photos', title: 'Condition & Photos', description: 'Describe condition and add photos' },
    { key: 'price-delivery', title: 'Price & Delivery', description: 'Set price and delivery options' },
  ]

  const canProceedToStep = (step: ListingStep): boolean => {
    switch (step) {
      case 'listing-type':
        return true
      case 'game-selection':
        return !!formData.listingType
      case 'condition-photos':
        return !!formData.listingType && !!formData.bggGameId
      case 'price-delivery':
        return !!formData.listingType && !!formData.bggGameId && !!formData.condition
      default:
        return false
    }
  }

  const canGoBackToStep = (step: ListingStep): boolean => {
    switch (step) {
      case 'listing-type':
        return true
      case 'game-selection':
        return !!formData.listingType
      case 'condition-photos':
        return !!formData.bggGameId
      case 'price-delivery':
        return !!formData.condition
      default:
        return false
    }
  }

  const handleNextStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep)
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]
      if (canProceedToStep(nextStep.key)) {
        setCurrentStep(nextStep.key)
      }
    }
  }

  const handlePreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep)
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1]
      if (canGoBackToStep(previousStep.key)) {
        setCurrentStep(previousStep.key)
      }
    }
  }

  const handleStepClick = (step: ListingStep) => {
    if (canProceedToStep(step) || canGoBackToStep(step)) {
      setCurrentStep(step)
    }
  }

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // TODO: Implement listing submission
      console.log('Submitting listing:', formData)
      // Redirect to success page or listing view
    } catch (error) {
      console.error('Error submitting listing:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canShowPreview = () => {
    return !!(
      formData.listingType &&
      formData.bggGameId &&
      formData.condition &&
      formData.price
    )
  }

  return (
    <div className="min-h-screen bg-light-beige">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 lg:space-x-4">
              {steps.map((step, index) => (
                <div key={step.key}>
                  <div 
                    className={`flex items-center ${
                      currentStep === step.key ? 'text-vibrant-orange' : 'text-gray-400'
                    } ${canProceedToStep(step.key) || canGoBackToStep(step.key) ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => handleStepClick(step.key)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      currentStep === step.key 
                        ? 'bg-vibrant-orange text-white' 
                        : canProceedToStep(step.key) || canGoBackToStep(step.key)
                          ? 'bg-gray-200 hover:bg-gray-300'
                          : 'bg-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm hidden lg:inline">{step.title}</span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-4 lg:w-8 h-1 ${
                      steps.findIndex(s => s.key === currentStep) > index ? 'bg-vibrant-orange' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="lg:flex lg:gap-8">
          {/* Left Column - Form Content */}
          <div className="lg:flex-1 lg:max-w-4xl">
            {/* Step Content */}
            {currentStep === 'listing-type' && (
              <ListingTypeStep 
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 'game-selection' && (
              <GameSelectionStep 
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
              />
            )}

            {currentStep === 'condition-photos' && (
              <ConditionPhotosStep 
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
              />
            )}

            {currentStep === 'price-delivery' && (
              <PriceDeliveryStep 
                formData={formData}
                updateFormData={updateFormData}
                onSubmit={handleSubmit}
                onBack={handlePreviousStep}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Right Column - Listing Preview Sidebar */}
          {canShowPreview() && (
            <div className="lg:w-96 lg:flex-shrink-0">
              {/* Mobile Preview Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-between border-vibrant-orange text-vibrant-orange hover:bg-vibrant-orange/10"
                >
                  <div className="flex items-center space-x-2">
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>Preview Listing</span>
                  </div>
                  {showPreview ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>

              {/* Preview Content */}
              <div className={`${!showPreview ? 'hidden' : 'block'} lg:block`}>
                <div className="lg:sticky lg:top-8">
                  <ListingPreview formData={formData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
