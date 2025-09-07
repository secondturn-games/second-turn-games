import { useState } from 'react'
import type { ListingFormData } from '../types'

export function useListingForm(initial: ListingFormData) {
  const [formData, setFormData] = useState<ListingFormData>(initial)

  const update = (updates: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateGameCondition = (updates: Partial<NonNullable<ListingFormData['gameCondition']>>) => {
    update({
      gameCondition: {
        activeFilter: formData.gameCondition?.activeFilter || null,
        boxCondition: formData.gameCondition?.boxCondition || null,
        boxDescription: formData.gameCondition?.boxDescription || null,
        completeness: formData.gameCondition?.completeness || null,
        missingDescription: formData.gameCondition?.missingDescription || null,
        componentCondition: formData.gameCondition?.componentCondition || null,
        componentConditionDescription: formData.gameCondition?.componentConditionDescription || null,
        extras: formData.gameCondition?.extras || [],
        extrasDescription: formData.gameCondition?.extrasDescription || null,
        photos: formData.gameCondition?.photos || [],
        photoNotes: formData.gameCondition?.photoNotes || null,
        ...updates
      }
    })
  }

  const updatePrice = (updates: Partial<NonNullable<ListingFormData['price']>>) => {
    update({
      price: {
        amount: formData.price?.amount || null,
        negotiable: formData.price?.negotiable || false,
        notes: formData.price?.notes || null,
        ...updates
      }
    })
  }

  const updateShipping = (updates: Partial<NonNullable<ListingFormData['shipping']>>) => {
    const currentShipping = formData.shipping || {
      pickup: { enabled: false, country: null, localArea: null, meetingDetails: null },
      parcelLocker: { enabled: false, priceType: null, price: null, countries: [], countryPrices: {} },
      notes: null
    }
    
    update({
      shipping: {
        ...currentShipping,
        ...updates
      }
    })
  }

  const resetGameCondition = () => {
    update({
      gameCondition: null,
      price: null,
      shipping: null
    })
  }

  return {
    formData,
    update,
    updateGameCondition,
    updatePrice,
    updateShipping,
    resetGameCondition
  }
}


