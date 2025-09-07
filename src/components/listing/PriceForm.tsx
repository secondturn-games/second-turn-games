"use client"

import { Euro } from 'lucide-react'
import type { ListingFormData } from './types'

interface PriceFormProps {
  price: NonNullable<ListingFormData['price']>
  onUpdate: (updates: Partial<NonNullable<ListingFormData['price']>>) => void
}

export function PriceForm({ price, onUpdate }: PriceFormProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <h4 className="font-medium text-dark-green">Price</h4>
        <p className="text-xs text-gray-600 mt-1">
          Set the value of your game so buyers know what to expect. Fair pricing helps trades happen faster!
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        {/* Price Amount and Negotiable Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Price Amount */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (€) *
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={price.amount || ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || (parseFloat(value) > 0 && /^\d+(\.\d{1,2})?$/.test(value))) {
                    onUpdate({ amount: value })
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                    onUpdate({ amount: parseFloat(e.target.value).toFixed(2) })
                  }
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
              />
            </div>
          </div>

          {/* Negotiable Toggle */}
          <div className="sm:flex-shrink-0">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={price.negotiable}
                onChange={(e) => onUpdate({ negotiable: e.target.checked })}
                className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300 rounded hover:border-vibrant-orange"
              />
              <span className="text-sm font-medium text-gray-700">Price is negotiable</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              Buyers can make offers below your asking price
            </p>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price notes (optional)
          </label>
          <textarea
            placeholder="Want to add context to the price?"
            value={price.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}


