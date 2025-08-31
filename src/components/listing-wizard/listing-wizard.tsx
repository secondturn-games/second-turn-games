"use client"

import { useState } from 'react'
import { ListingTypeStep } from './steps/listing-type-step'
import { GameSelectionStep } from './steps/game-selection-step'
import { ConditionPhotosStep } from './steps/condition-photos-step'
import { PriceDeliveryStep } from './steps/price-delivery-step'
import { StepIndicator } from './step-indicator'

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
  gameImage: string | null
  versionImage: string | null
  
  // Game Details from BGG
  gameDetails: {
    minPlayers: string
    maxPlayers: string
    playingTime: string
    minAge: string
    yearPublished: string
    languages: string[]
    publishers: string[]
  } | null
  
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
  gameImage: null,
  versionImage: null,
  gameDetails: null,
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



  return (
    <div className="min-h-screen bg-light-beige">
      <div className="container mx-auto px-2 sm:px-3 py-4 max-w-7xl">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step Indicator - Integrated into form */}
          <div className="bg-white rounded-md shadow-sm border border-light-beige-200 mb-4">
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              canProceedToStep={canProceedToStep}
              canGoBackToStep={canGoBackToStep}
            />
          </div>
          
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
      </div>
    </div>
  )
}
