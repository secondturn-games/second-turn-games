'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Search, Package, Truck } from 'lucide-react';
import { LockerService } from '@/lib/shipping/locker-service';
import { ShipmentService } from '@/lib/shipping/shipment-service';
import { CarrierLocker, Shipment } from '@/types/shipping';

export default function ShippingTestPage() {
  const [lockers, setLockers] = useState<CarrierLocker[]>([]);
  const [nearbyLockers, setNearbyLockers] = useState<CarrierLocker[]>([]);
  const [selectedFromLocker, setSelectedFromLocker] = useState<CarrierLocker | null>(null);
  const [selectedToLocker, setSelectedToLocker] = useState<CarrierLocker | null>(null);
  const [searchLocation, setSearchLocation] = useState({ lat: 59.4370, lng: 24.7536 }); // Tallinn default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const lockerService = useMemo(() => new LockerService(), []);
  const shipmentService = useMemo(() => new ShipmentService(), []);

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

  // Load all lockers on component mount
  useEffect(() => {
    loadAllLockers();
  }, [loadAllLockers]);

  const searchNearbyLockers = async () => {
    try {
      setLoading(true);
      setError(null);
      const nearby = await lockerService.getNearbyLockers(
        searchLocation.lat,
        searchLocation.lng,
        10 // 10km radius
      );
      setNearbyLockers(nearby);
    } catch (err) {
      setError('Failed to search nearby lockers: ' + (err as Error).message);
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

  const createTestShipment = async () => {
    if (!selectedFromLocker || !selectedToLocker) {
      setError('Please select both from and to lockers');
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
          name: 'Test Sender',
          phone: '+372 12345678',
          email: 'sender@test.com'
        },
        recipient: {
          name: 'Test Recipient',
          phone: '+371 87654321',
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Section */}
          <div className="bg-white rounded-lg border border-dark-green-200 p-6">
            <h2 className="text-xl font-semibold text-dark-green-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Nearby Lockers
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-green-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={searchLocation.lat}
                    onChange={(e) => setSearchLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-green-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={searchLocation.lng}
                    onChange={(e) => setSearchLocation(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange"
                  />
                </div>
              </div>
              
              <button
                onClick={searchNearbyLockers}
                disabled={loading}
                className="w-full bg-vibrant-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Searching...' : 'Search Nearby Lockers'}
              </button>
            </div>

            {/* Nearby Lockers Results */}
            {nearbyLockers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-dark-green-800 mb-3">
                  Nearby Lockers ({nearbyLockers.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {nearbyLockers.map((locker) => (
                    <div
                      key={locker.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFromLocker?.id === locker.id
                          ? 'border-vibrant-orange bg-orange-50'
                          : 'border-dark-green-200 hover:border-dark-green-300'
                      }`}
                      onClick={() => setSelectedFromLocker(locker)}
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
                          <p className="text-sm font-medium text-dark-green-700">
                            {locker.distance_meters ? `${Math.round(locker.distance_meters)}m` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All Lockers Section */}
          <div className="bg-white rounded-lg border border-dark-green-200 p-6">
            <h2 className="text-xl font-semibold text-dark-green-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              All Lockers ({lockers.length})
            </h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lockers.map((locker) => (
                <div
                  key={locker.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedToLocker?.id === locker.id
                      ? 'border-vibrant-orange bg-orange-50'
                      : 'border-dark-green-200 hover:border-dark-green-300'
                  }`}
                  onClick={() => setSelectedToLocker(locker)}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                <div key={shipment.id} className="p-4 border border-dark-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-dark-green-800">
                      Shipment #{shipment.id.slice(0, 8)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shipment.tracking_status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                      shipment.tracking_status === 'IN_TRANSIT' ? 'bg-yellow-100 text-yellow-800' :
                      shipment.tracking_status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.tracking_status || 'PENDING'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-dark-green-600">From: {shipment.from_locker_id}</p>
                      <p className="text-dark-green-600">To: {shipment.to_locker_id}</p>
                    </div>
                    <div>
                      <p className="text-dark-green-600">Carrier: {shipment.carrier}</p>
                      <p className="text-dark-green-600">Size: {shipment.size_code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  <div className={`w-3 h-3 rounded-full ${process.env.LP_EXPRESS_USERNAME ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm text-dark-green-600">
                    Credentials: {process.env.LP_EXPRESS_USERNAME ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <div className="text-xs text-dark-green-500 mt-2">
                  {!process.env.LP_EXPRESS_USERNAME && (
                    <p>⚠️ Add LP_EXPRESS_USERNAME and LP_EXPRESS_PASSWORD to .env.local for real API testing</p>
                  )}
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

            {/* Quick Test Buttons */}
            <div>
              <h3 className="text-lg font-medium text-dark-green-700 mb-3">Quick Location Tests</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSearchLocation({ lat: 59.4370, lng: 24.7536 })}
                  className="w-full p-3 border border-dark-green-200 rounded-lg hover:bg-dark-green-50 text-left"
                >
                  <p className="font-medium text-dark-green-800">Test Tallinn</p>
                  <p className="text-sm text-dark-green-600">59.4370, 24.7536</p>
                </button>
                <button
                  onClick={() => setSearchLocation({ lat: 56.9465, lng: 24.1048 })}
                  className="w-full p-3 border border-dark-green-200 rounded-lg hover:bg-dark-green-50 text-left"
                >
                  <p className="font-medium text-dark-green-800">Test Riga</p>
                  <p className="text-sm text-dark-green-600">56.9465, 24.1048</p>
                </button>
                <button
                  onClick={() => setSearchLocation({ lat: 54.6872, lng: 25.2797 })}
                  className="w-full p-3 border border-dark-green-200 rounded-lg hover:bg-dark-green-50 text-left"
                >
                  <p className="font-medium text-dark-green-800">Test Vilnius</p>
                  <p className="text-sm text-dark-green-600">54.6872, 25.2797</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
