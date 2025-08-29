"use client"

import type { ListingStep } from './listing-wizard'

interface StepIndicatorProps {
  steps: { key: ListingStep; title: string; description: string }[]
  currentStep: ListingStep
  onStepClick: (step: ListingStep) => void
  canProceedToStep: (step: ListingStep) => boolean
  canGoBackToStep: (step: ListingStep) => boolean
}

export function StepIndicator({ 
  steps, 
  currentStep, 
  onStepClick, 
  canProceedToStep, 
  canGoBackToStep 
}: StepIndicatorProps) {
  const getStepStatus = (stepKey: ListingStep, index: number) => {
    const currentIndex = steps.findIndex(s => s.key === currentStep)
    const stepIndex = steps.findIndex(s => s.key === stepKey)
    
    if (stepKey === currentStep) return 'active'
    if (stepIndex < currentIndex) return 'completed'
    return 'future'
  }

  const isStepClickable = (step: ListingStep) => {
    // Step 1 (listing-type) is always accessible
    if (step === 'listing-type') return true
    
    // Step 2 (game-selection) is always accessible (only one option in step 1)
    if (step === 'game-selection') return true
    
    // Step 3 (condition-photos) requires step 2 to be completed
    if (step === 'condition-photos') {
      return canProceedToStep('condition-photos') || canGoBackToStep('condition-photos')
    }
    
    // Step 4 (price-delivery) requires step 3 to be completed
    if (step === 'price-delivery') {
      // Only allow if we can proceed to step 4 (meaning step 3 is complete)
      // OR if we're already on step 4 and can go back
      return canProceedToStep('price-delivery') || 
             (currentStep === 'price-delivery' && canGoBackToStep('price-delivery'))
    }
    
    return false
  }

  return (
    <div className="p-4">
             {/* Mobile: Compact single line with just numbers/checkmarks */}
       <div className="lg:hidden">
         <div className="flex justify-between items-center">
           {steps.map((step, index) => {
             const status = getStepStatus(step.key, index)
             const isClickable = isStepClickable(step.key)
             
             return (
               <div key={step.key} className="flex flex-col items-center flex-1">
                 <div
                   className={`w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-300 ${
                     status === 'active'
                       ? 'bg-vibrant-orange shadow-medium scale-110'
                       : status === 'completed'
                       ? 'bg-vibrant-orange shadow-soft'
                       : isClickable
                         ? 'bg-light-beige-200 hover:bg-light-beige-300 hover:scale-105 cursor-pointer'
                         : 'bg-light-beige-100 opacity-60'
                   }`}
                   onClick={() => isClickable && onStepClick(step.key)}
                 >
                   <span className={`text-xs font-bold ${
                     status === 'active' || status === 'completed'
                       ? 'text-white'
                       : 'text-dark-green-600'
                   }`}>
                     {status === 'completed' ? '✓' : index + 1}
                   </span>
                 </div>
               </div>
             )
           })}
         </div>
       </div>

      {/* Desktop: Single line with labels, spanning full form width */}
      <div className="hidden lg:block">
        <div className="flex justify-between items-center w-full">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key, index)
            const isClickable = isStepClickable(step.key)
            
            return (
              <div key={step.key} className="flex items-center flex-1">
                                 {/* Step Square */}
                 <div
                   className={`w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-300 ${
                     status === 'active'
                       ? 'bg-vibrant-orange shadow-medium scale-110'
                       : status === 'completed'
                       ? 'bg-vibrant-orange shadow-soft'
                       : isClickable
                         ? 'bg-light-beige-200 hover:bg-light-beige-300 hover:scale-105 cursor-pointer'
                         : 'bg-light-beige-100 opacity-60'
                   }`}
                   onClick={() => isClickable && onStepClick(step.key)}
                 >
                   <span className={`text-xs font-bold ${
                     status === 'active' || status === 'completed'
                       ? 'text-white'
                       : 'text-dark-green-600'
                   }`}>
                     {status === 'completed' ? '✓' : index + 1}
                   </span>
                 </div>
                
                {/* Step Title */}
                <span className={`ml-2 text-sm font-medium transition-colors duration-200 ${
                  status === 'active'
                    ? 'text-vibrant-orange font-semibold'
                    : status === 'completed'
                      ? 'text-dark-green-600'
                      : 'text-dark-green-400'
                }`}>
                  {step.title}
                </span>
                
                {/* Progress Line (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 bg-light-beige-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-vibrant-orange rounded-full transition-all duration-500 ease-out ${
                        status === 'completed' ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
