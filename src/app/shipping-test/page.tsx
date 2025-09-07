'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Search, Package, Truck, User } from 'lucide-react';
import { LockerService } from '@/lib/shipping/locker-service';
import { ShipmentService } from '@/lib/shipping/shipment-service';
import { CarrierLocker, CreateShipmentResponse, ShippingRate } from '@/types/shipping';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@clerk/nextjs';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export default function ShippingTestPage() {
  const { user } = useUser();
  const [lockers, setLockers] = useState<CarrierLocker[]>([]);
  const [selectedFromLocker, setSelectedFromLocker] = useState<CarrierLocker | null>(null);
  const [selectedToLocker, setSelectedToLocker] = useState<CarrierLocker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipments, setShipments] = useState<CreateShipmentResponse[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  const lockerService = useMemo(() => new LockerService(), []);
  const shipmentService = useMemo(() => new ShipmentService(), []);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, phone')
        .eq('clerk_id', user.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setUserProfile(profile);
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  }, [user]);

  const loadAllLockers = useCallback(async () => {
    try {
      setLoading(true);
      const allLockers = await lockerService.searchLockers(''); // Empty query to get all
      setLockers(allLockers);
    } catch (err) {
      const error = err as Error;
      console.error('Error loading lockers:', error);
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation "carrier_lockers" does not exist')) {
        setError('Carrier lockers table not found. Please run the database migrations first:\n\n1. Run supabase/migrations/20241209_add_shipping_tables.sql\n2. Run supabase/migrations/20241210_seed_carrier_lockers.sql');
      } else {
        setError('Failed to load lockers: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [lockerService]);

  // Load user profile and lockers on component mount
  useEffect(() => {
    loadUserProfile();
    loadAllLockers();
    
    // Check if we're in demo mode
    const hasCredentials = process.env.LP_EXPRESS_USERNAME && process.env.LP_EXPRESS_PASSWORD;
    setIsDemoMode(!hasCredentials);
  }, [loadUserProfile, loadAllLockers]);

  const searchLockers = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await lockerService.searchLockers(''); // Search all lockers
      setLockers(searchResults);
    } catch (err) {
      setError('Failed to search lockers: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const syncLockersFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sync lockers for all countries
      await lockerService.syncLockers('EE');
      await lockerService.syncLockers('LV');
      await lockerService.syncLockers('LT');
      
      // Reload all lockers
      await loadAllLockers();
      
      alert('Lockers synced successfully from LP Express API!');
    } catch (err) {
      setError('Failed to sync lockers: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const calculateShippingFee = async () => {
    if (!selectedFromLocker || !selectedToLocker) {
      setError('Please select both source and destination lockers');
      return;
    }

    try {
      setCalculatingPrice(true);
      setError(null);

      const rate = await shipmentService.calculateShippingFee({
        from_country: selectedFromLocker.country,
        to_country: selectedToLocker.country,
        size_code: 'M' // Default to Medium size
      });

      setShippingRate(rate);
    } catch (err) {
      setError('Failed to calculate shipping fee: ' + (err as Error).message);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const createTestShipment = async () => {
    if (!selectedFromLocker || !selectedToLocker) {
      setError('Please select both from and to lockers');
      return;
    }

    if (!userProfile) {
      setError('Please complete your profile first. Go to /profile to add your phone number.');
      return;
    }

    if (!userProfile.phone) {
      setError('Phone number is required for shipping. Please add it to your profile first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const shipment = await shipmentService.createShipment({
        order_id: 'test-order-' + Date.now(),
        carrier: 'LP_EXPRESS',
        service_code: 'LOCKER_LOCKER',
        size_code: 'M',
        from_locker_id: selectedFromLocker.id,
        to_locker_id: selectedToLocker.id,
        sender: {
          name: `${userProfile.first_name} ${userProfile.last_name}`,
          phone: userProfile.phone,
          email: userProfile.email
        },
        recipient: {
          name: 'Test Recipient',
          phone: '+37187654321',
          email: 'recipient@test.com'
        },
        parcel: {
          weight_grams: 500,
          length_cm: 20,
          width_cm: 15,
          height_cm: 10
        }
      });

      setShipments(prev => [shipment, ...prev]);
      alert('Shipment created successfully!');
    } catch (err) {
      setError('Failed to create shipment: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'EE': '🇪🇪',
      'LV': '🇱🇻', 
      'LT': '🇱🇹'
    };
    return flags[country] || '🏳️';
  };

  return (
    <div className="min-h-screen bg-light-beige p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-green-800 mb-2">
            Shipping Service Test
          </h1>
          <p className="text-dark-green-600">
            Test the parcel locker integration and shipment creation
          </p>
          
          {/* Demo Mode Indicator */}
          {isDemoMode && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">🚀 Demo Mode Active</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>No LP Express credentials configured. Using mock data for testing.</p>
                    <p className="mt-1 text-xs">To use real API: Add LP_EXPRESS_USERNAME and LP_EXPRESS_PASSWORD to .env.local</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Database Setup Required</h3>
                <div className="mt-2 text-sm text-red-700">
                  <pre className="whitespace-pre-wrap">{error}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locker Search and Selection */}
        <div className="bg-white rounded-lg border border-dark-green-200 p-6">
          <h2 className="text-xl font-semibold text-dark-green-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Select Lockers ({lockers.length} available)
          </h2>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-dark-green-600 mb-1">
                Search Lockers
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by locker name..."
                  className="flex-1 px-3 py-2 border border-dark-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange"
                />
                <button
                  onClick={searchLockers}
                  disabled={loading}
                  className="bg-vibrant-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            
            {/* Lockers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {lockers.map((locker) => (
                <div
                  key={locker.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFromLocker?.id === locker.id || selectedToLocker?.id === locker.id
                      ? 'border-vibrant-orange bg-orange-50'
                      : 'border-dark-green-200 hover:border-dark-green-300'
                  }`}
                  onClick={() => {
                    if (!selectedFromLocker) {
                      setSelectedFromLocker(locker);
                    } else if (!selectedToLocker && locker.id !== selectedFromLocker.id) {
                      setSelectedToLocker(locker);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark-green-800">{locker.name}</p>
                      <p className="text-sm text-dark-green-600">{locker.address}</p>
                      <p className="text-xs text-dark-green-500">
                        {getCountryFlag(locker.country)} {locker.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-dark-green-500">
                        {locker.services.join(', ')}
                      </p>
                      {selectedFromLocker?.id === locker.id && (
                        <p className="text-xs text-vibrant-orange font-medium">FROM</p>
                      )}
                      {selectedToLocker?.id === locker.id && (
                        <p className="text-xs text-blue-600 font-medium">TO</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Fee Calculation */}
        {selectedFromLocker && selectedToLocker && (
          <div className="mt-6 bg-white rounded-lg border border-dark-green-200 p-6">
            <h2 className="text-xl font-semibold text-dark-green-800 mb-4 flex items-center gap-2">
              💰 Shipping Fee
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-dark-green-700 mb-2">Route Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-green-600">From:</span>
                    <span className="text-sm font-medium">{selectedFromLocker.name}</span>
                    <span className="text-xs text-dark-green-500">({selectedFromLocker.country})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-green-600">To:</span>
                    <span className="text-sm font-medium">{selectedToLocker.name}</span>
                    <span className="text-xs text-dark-green-500">({selectedToLocker.country})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-green-600">Service:</span>
                    <span className="text-sm font-medium">T2T (Terminal to Terminal)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-dark-green-700 mb-2">Pricing</h3>
                {shippingRate ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-green-600">Size:</span>
                      <span className="text-sm font-medium">{shippingRate.size_code}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-green-600">Price:</span>
                      <span className="text-lg font-bold text-vibrant-orange">
                        €{(shippingRate.price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-green-600">Currency:</span>
                      <span className="text-sm font-medium">{shippingRate.currency}</span>
                    </div>
                    {isDemoMode && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                        💡 Demo pricing - Real rates may vary
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={calculateShippingFee}
                      disabled={calculatingPrice}
                      className="w-full px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-vibrant-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {calculatingPrice ? 'Calculating...' : 'Calculate Shipping Fee'}
                    </button>
                    <p className="text-xs text-dark-green-500">
                      Click to see the actual shipping cost
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Lockers & Shipment Creation */}
        <div className="mt-6 bg-white rounded-lg border border-dark-green-200 p-6">
          <h2 className="text-xl font-semibold text-dark-green-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Create Test Shipment
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-dark-green-700 mb-2">From Locker</h3>
              {selectedFromLocker ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-dark-green-800">{selectedFromLocker.name}</p>
                  <p className="text-sm text-dark-green-600">{selectedFromLocker.address}</p>
                  <p className="text-xs text-dark-green-500">
                    {getCountryFlag(selectedFromLocker.country)} {selectedFromLocker.city}
                  </p>
                </div>
              ) : (
                <p className="text-dark-green-500 italic">Select a from locker above</p>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-dark-green-700 mb-2">To Locker</h3>
              {selectedToLocker ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-dark-green-800">{selectedToLocker.name}</p>
                  <p className="text-sm text-dark-green-600">{selectedToLocker.address}</p>
                  <p className="text-xs text-dark-green-500">
                    {getCountryFlag(selectedToLocker.country)} {selectedToLocker.city}
                  </p>
                </div>
              ) : (
                <p className="text-dark-green-500 italic">Select a to locker above</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={createTestShipment}
              disabled={!selectedFromLocker || !selectedToLocker || loading}
              className="bg-vibrant-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Test Shipment'}
            </button>
          </div>
        </div>

        {/* Shipments List */}
        {shipments.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-dark-green-200 p-6">
            <h2 className="text-xl font-semibold text-dark-green-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Created Shipments ({shipments.length})
            </h2>
            
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.shipment_id} className="p-4 border border-dark-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-dark-green-800">
                      Shipment #{shipment.shipment_id.slice(0, 8)}
                    </p>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      CREATED
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-dark-green-600">Tracking: {shipment.tracking_number}</p>
                      <p className="text-dark-green-600">Label: <a href={shipment.label_url} target="_blank" rel="noopener noreferrer" className="text-vibrant-orange hover:underline">Download PDF</a></p>
                    </div>
                    <div>
                      <p className="text-dark-green-600">Estimated Delivery: {new Date(shipment.estimated_delivery).toLocaleString()}</p>
                      {shipment.drop_off_code && (
                        <p className="text-dark-green-600">Drop-off Code: {shipment.drop_off_code}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile Status */}
        <div className="mt-6 bg-white rounded-lg border border-dark-green-200 p-6">
          <h2 className="text-xl font-semibold text-dark-green-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile Status
          </h2>
          
          {userProfile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${userProfile.phone ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-dark-green-600">
                  {userProfile.first_name} {userProfile.last_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${userProfile.phone ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-dark-green-600">
                  Phone: {userProfile.phone || 'Not set'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="text-sm text-dark-green-600">
                  Email: {userProfile.email}
                </span>
              </div>
              {!userProfile.phone && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Phone number required for shipping. 
                    <a href="/profile" className="text-vibrant-orange hover:underline ml-1">
                      Complete your profile →
                    </a>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Loading profile...
              </p>
            </div>
          )}
        </div>

        {/* API Configuration & Testing */}
        <div className="mt-6 bg-white rounded-lg border border-dark-green-200 p-6">
          <h2 className="text-xl font-semibold text-dark-green-800 mb-4">API Configuration & Testing</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Status */}
            <div>
              <h3 className="text-lg font-medium text-dark-green-700 mb-3">LP Express API Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-dark-green-600">
                    API URL: {process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-dark-green-600">
                    Public API: No authentication required
                  </span>
                </div>
                <div className="text-xs text-dark-green-500 mt-2">
                  <p>✅ Using public /terminals endpoint - ready for testing</p>
                </div>
                <button
                  onClick={syncLockersFromAPI}
                  disabled={loading}
                  className="mt-3 bg-dark-green-600 text-white px-4 py-2 rounded-lg hover:bg-dark-green-700 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Syncing...' : 'Sync Lockers from API'}
                </button>
              </div>
            </div>

            {/* Test Actions */}
            <div>
              <h3 className="text-lg font-medium text-dark-green-700 mb-3">Test Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-full p-3 border border-dark-green-200 rounded-lg hover:bg-dark-green-50 text-left"
                >
                  <p className="font-medium text-dark-green-800">Clear Search</p>
                  <p className="text-sm text-dark-green-600">Show all lockers</p>
                </button>
                <button
                  onClick={() => {
                    setSelectedFromLocker(null);
                    setSelectedToLocker(null);
                  }}
                  className="w-full p-3 border border-dark-green-200 rounded-lg hover:bg-dark-green-50 text-left"
                >
                  <p className="font-medium text-dark-green-800">Clear Selection</p>
                  <p className="text-sm text-dark-green-600">Reset from/to lockers</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
