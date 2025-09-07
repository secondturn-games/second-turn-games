"use client"

import { Handshake, Container, Euro, MapPin, Building2 } from 'lucide-react'
import { SHIPPING_COUNTRIES } from './config'
import type { ListingFormData, UserProfile } from './types'

interface ShippingFormProps {
  shipping: NonNullable<ListingFormData['shipping']>
  userProfile: UserProfile | null
  onUpdate: (updates: Partial<NonNullable<ListingFormData['shipping']>>) => void
}

export function ShippingForm({ shipping, userProfile, onUpdate }: ShippingFormProps) {
  // Debug: Log userProfile data
  const renderShippingOption = (
    id: 'pickup' | 'parcelLocker',
    title: string,
    description: string,
    icon: React.ComponentType<{ className?: string }>,
    isEnabled: boolean,
    onToggle: () => void,
    children: React.ReactNode
  ) => {
    const IconComponent = icon
    return (
      <div className="space-y-3">
        {/* Shipping Option Button */}
        <button
          onClick={onToggle}
          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
            isEnabled 
              ? 'border-vibrant-orange bg-orange-50' 
              : 'border-gray-200 hover:border-vibrant-orange hover:text-vibrant-orange'
          }`}
        >
          <div className="flex items-start gap-3">
            <IconComponent className={`w-5 h-5 mt-0.5 ${isEnabled ? 'text-vibrant-orange' : 'text-gray-400'}`} />
            <div>
              <h6 className={`font-medium text-sm ${isEnabled ? 'text-vibrant-orange' : 'text-gray-900'}`}>{title}</h6>
              <p className={`text-xs mt-1 ${isEnabled ? 'text-gray-600' : 'text-gray-600'}`}>{description}</p>
            </div>
          </div>
        </button>
        
        {/* Shipping Option Details */}
        {isEnabled && (
          <div className="ml-8">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <h4 className="font-medium text-dark-green">Shipping</h4>
        <p className="text-xs text-gray-600 mt-1">
          Tell buyers how their game will get to them and where it can travel. Clear shipping info avoids surprises and keeps everyone happy.
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        {/* Pickup / Local Delivery */}
        {renderShippingOption(
          'pickup',
          'Pickup / Local Delivery',
          'Meet up locally or arrange delivery in your area',
          Handshake,
          shipping.pickup.enabled,
          () => onUpdate({
            pickup: {
              enabled: !shipping.pickup.enabled,
              country: userProfile?.country || null,
              localArea: userProfile?.localArea || null,
              meetingDetails: shipping.pickup.meetingDetails || null
            }
          }),
          <div className="space-y-4">
            {/* Country and Local Area - Auto-populated from profile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={userProfile?.country || ''}
                    readOnly
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  From your profile
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local Area *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={userProfile?.localArea || ''}
                    readOnly
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  From your profile
                </p>
              </div>
            </div>
            
            {/* Meeting Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting details (optional)
              </label>
              <textarea
                placeholder="Specific meeting point, preferred times, or delivery arrangements..."
                value={shipping.pickup.meetingDetails || ''}
                onChange={(e) => onUpdate({
                  pickup: {
                    enabled: shipping.pickup.enabled,
                    country: shipping.pickup.country,
                    localArea: shipping.pickup.localArea,
                    meetingDetails: e.target.value
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Parcel Locker Shipping */}
        {renderShippingOption(
          'parcelLocker',
          'Parcel Locker Shipping',
          'Ship to parcel lockers in Estonia, Latvia, or Lithuania',
          Container,
          shipping.parcelLocker.enabled,
          () => onUpdate({
            parcelLocker: {
              enabled: !shipping.parcelLocker.enabled,
              priceType: shipping.parcelLocker.priceType,
              price: shipping.parcelLocker.price,
              countries: shipping.parcelLocker.countries,
              countryPrices: shipping.parcelLocker.countryPrices
            }
          }),
          <div className="space-y-4">
            {/* Price Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Shipping Price *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onUpdate({
                    parcelLocker: {
                      enabled: shipping.parcelLocker.enabled,
                      priceType: 'included',
                      price: null,
                      countries: shipping.parcelLocker.countries,
                      countryPrices: {}
                    }
                  })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    shipping.parcelLocker.priceType === 'included'
                      ? 'border-vibrant-orange bg-orange-50'
                      : 'border-gray-200 hover:border-vibrant-orange hover:text-vibrant-orange'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 mt-0.5 ${shipping.parcelLocker.priceType === 'included' ? 'text-vibrant-orange' : 'text-gray-400'}`}>
                      ✓
                    </div>
                    <div>
                      <h6 className={`font-medium text-sm ${shipping.parcelLocker.priceType === 'included' ? 'text-vibrant-orange' : 'text-gray-900'}`}>Included</h6>
                      <p className={`text-xs mt-1 ${shipping.parcelLocker.priceType === 'included' ? 'text-gray-600' : 'text-gray-600'}`}>Shipping cost included in game price</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => onUpdate({
                    parcelLocker: {
                      enabled: shipping.parcelLocker.enabled,
                      priceType: 'separate',
                      price: shipping.parcelLocker.price,
                      countries: shipping.parcelLocker.countries,
                      countryPrices: shipping.parcelLocker.countryPrices
                    }
                  })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    shipping.parcelLocker.priceType === 'separate'
                      ? 'border-vibrant-orange bg-orange-50'
                      : 'border-gray-200 hover:border-vibrant-orange hover:text-vibrant-orange'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 mt-0.5 ${shipping.parcelLocker.priceType === 'separate' ? 'text-vibrant-orange' : 'text-gray-400'}`}>
                      €
                    </div>
                    <div>
                      <h6 className={`font-medium text-sm ${shipping.parcelLocker.priceType === 'separate' ? 'text-vibrant-orange' : 'text-gray-900'}`}>Additional Cost</h6>
                      <p className={`text-xs mt-1 ${shipping.parcelLocker.priceType === 'separate' ? 'text-gray-600' : 'text-gray-600'}`}>Buyer pays shipping separately</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Countries - Vertical Stack with Prices */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ship to Countries *
              </label>
              <div className="space-y-2">
                {SHIPPING_COUNTRIES.map((country) => {
                  const isSelected = shipping.parcelLocker.countries?.includes(country) || false
                  return (
                    <div key={country} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <button
                        onClick={() => {
                          const newCountries = isSelected
                            ? (shipping.parcelLocker.countries || []).filter(c => c !== country)
                            : [...(shipping.parcelLocker.countries || []), country]
                          onUpdate({
                            parcelLocker: {
                              enabled: shipping.parcelLocker.enabled,
                              priceType: shipping.parcelLocker.priceType,
                              price: shipping.parcelLocker.price,
                              countries: newCountries,
                              countryPrices: shipping.parcelLocker.countryPrices
                            }
                          })
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm border transition-all ${
                          isSelected 
                            ? 'border-vibrant-orange bg-vibrant-orange text-white' 
                            : 'border-gray-300 bg-white text-gray-700 hover:border-vibrant-orange hover:text-vibrant-orange'
                        }`}
                      >
                        <span className="font-medium">{country}</span>
                      </button>
                      
                      {/* Price Input (if separate pricing and country selected) */}
                      {shipping.parcelLocker.priceType === 'separate' && isSelected && (
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={shipping.parcelLocker.countryPrices[country] || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '' || (parseFloat(value) > 0 && /^\d+(\.\d{1,2})?$/.test(value))) {
                                onUpdate({
                                  parcelLocker: {
                                    enabled: shipping.parcelLocker.enabled,
                                    priceType: shipping.parcelLocker.priceType,
                                    price: shipping.parcelLocker.price,
                                    countries: shipping.parcelLocker.countries,
                                    countryPrices: {
                                      ...shipping.parcelLocker.countryPrices,
                                      [country]: value
                                    }
                                  }
                                })
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                onUpdate({
                                  parcelLocker: {
                                    enabled: shipping.parcelLocker.enabled,
                                    priceType: shipping.parcelLocker.priceType,
                                    price: shipping.parcelLocker.price,
                                    countries: shipping.parcelLocker.countries,
                                    countryPrices: {
                                      ...shipping.parcelLocker.countryPrices,
                                      [country]: parseFloat(e.target.value).toFixed(2)
                                    }
                                  }
                                })
                              }
                            }}
                            className="w-24 pl-6 pr-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-vibrant-orange focus:border-vibrant-orange"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Optional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            placeholder="Any additional shipping details or restrictions?"
            value={shipping.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}


