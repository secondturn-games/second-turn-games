import { createClient } from '@/lib/supabase/client';
import { CarrierLocker, ShippingService } from '@/types/shipping';

export class LockerService {
  private supabase = createClient();

  /**
   * Sync lockers from carrier API to database
   */
  async syncLockers(country: 'EE' | 'LV' | 'LT'): Promise<void> {
    try {
      // Fetch from Unisend API
      const lockers = await this.fetchUnisendLockers(country);
      
      // Upsert to database
      await this.upsertLockers(lockers);
      
      console.log(`Synced ${lockers.length} lockers for ${country}`);
    } catch (error) {
      console.error(`Failed to sync lockers for ${country}:`, error);
      throw error;
    }
  }

  /**
   * Search lockers by query string
   */
  async searchLockers(
    query: string, 
    country?: 'EE' | 'LV' | 'LT'
  ): Promise<CarrierLocker[]> {
    try {
      let queryBuilder = this.supabase
        .from('carrier_lockers')
        .select('*')
        .eq('is_active', true)
        .textSearch('name, city, address', query);

      if (country) {
        queryBuilder = queryBuilder.eq('country', country);
      }

      const { data, error } = await queryBuilder
        .order('name')
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to search lockers:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        code: (error as { code?: string })?.code,
        details: (error as { details?: string })?.details,
        hint: (error as { hint?: string })?.hint
      });
      throw error;
    }
  }

  /**
   * Find nearby lockers using geographic coordinates
   */
  async getNearbyLockers(
    lat: number, 
    lng: number, 
    radiusKm: number = 10
  ): Promise<CarrierLocker[]> {
    try {
      // Convert km to meters for PostGIS
      const radiusMeters = radiusKm * 1000;
      
      // Use PostGIS ST_DWithin for distance-based search
      const { data, error } = await this.supabase
        .rpc('find_nearby_lockers', {
          search_lat: lat,
          search_lng: lng,
          radius_meters: radiusMeters,
          limit_count: 20
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to find nearby lockers:', error);
      throw error;
    }
  }

  /**
   * Get locker by ID
   */
  async getLockerById(id: string): Promise<CarrierLocker | null> {
    try {
      const { data, error } = await this.supabase
        .from('carrier_lockers')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get locker by ID:', error);
      throw error;
    }
  }

  /**
   * Get lockers by city
   */
  async getLockersByCity(
    city: string, 
    country: 'EE' | 'LV' | 'LT'
  ): Promise<CarrierLocker[]> {
    try {
      const { data, error } = await this.supabase
        .from('carrier_lockers')
        .select('*')
        .eq('country', country)
        .eq('city', city)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get lockers by city:', error);
      throw error;
    }
  }

  /**
   * Fetch lockers from LP Express API
   */
  private async fetchUnisendLockers(country: 'EE' | 'LV' | 'LT'): Promise<CarrierLocker[]> {
    const apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';
    const username = process.env.LP_EXPRESS_USERNAME;
    const password = process.env.LP_EXPRESS_PASSWORD;

    if (!username || !password) {
      console.warn('LP Express credentials not configured, using mock lockers');
      return this.getMockLockers(country);
    }

    try {
      // Get authentication token
      const authResponse = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      if (!authResponse.ok) {
        throw new Error(`Authentication failed: ${authResponse.statusText}`);
      }

      const authData = await authResponse.json();
      const token = authData.token || authData.access_token;

      // Fetch lockers
      const lockersResponse = await fetch(`${apiBase}/lockers?country=${country}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!lockersResponse.ok) {
        throw new Error(`Failed to fetch lockers: ${lockersResponse.statusText}`);
      }

      const lockersData = await lockersResponse.json();
      return this.parseLockersResponse(lockersData, country);
    } catch (error) {
      console.error('LP Express API call failed:', error);
      // Fallback to mock lockers for testing
      return this.getMockLockers(country);
    }
  }

  /**
   * Parse LP Express lockers response
   */
  private parseLockersResponse(apiResponse: unknown, country: 'EE' | 'LV' | 'LT'): CarrierLocker[] {
    const lockers = Array.isArray(apiResponse) ? apiResponse : ((apiResponse as { data?: unknown[]; lockers?: unknown[] }).data || (apiResponse as { data?: unknown[]; lockers?: unknown[] }).lockers || []);
    
    return lockers.map((locker: unknown) => {
      const lockerData = locker as Record<string, unknown>;
      return {
        id: String(lockerData.id || lockerData.locker_id || ''),
        name: String(lockerData.name || lockerData.title || ''),
        country,
        city: String(lockerData.city || this.getCapitalCity(country)),
        address: String(lockerData.address || lockerData.location || ''),
        lat: parseFloat(String(lockerData.lat || lockerData.latitude || this.getCapitalLat(country))),
        lng: parseFloat(String(lockerData.lng || lockerData.longitude || this.getCapitalLng(country))),
        services: ['LOCKER_LOCKER'] as ShippingService[],
        is_active: lockerData.is_active !== false && lockerData.status !== 'inactive',
        created_at: String(lockerData.created_at || new Date().toISOString()),
        updated_at: String(lockerData.updated_at || new Date().toISOString())
      };
    });
  }

  /**
   * Get mock lockers for testing
   */
  private getMockLockers(country: 'EE' | 'LV' | 'LT'): CarrierLocker[] {
    const mockLockers: CarrierLocker[] = [
      {
        id: `lp-express-${country.toLowerCase()}-001`,
        name: `LP Express Locker ${country}001`,
        country,
        city: this.getCapitalCity(country),
        address: `${this.getCapitalCity(country)} Central Station`,
        lat: this.getCapitalLat(country),
        lng: this.getCapitalLng(country),
        services: ['LOCKER_LOCKER'] as ShippingService[],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `lp-express-${country.toLowerCase()}-002`,
        name: `LP Express Locker ${country}002`,
        country,
        city: this.getCapitalCity(country),
        address: `${this.getCapitalCity(country)} Shopping Center`,
        lat: this.getCapitalLat(country) + 0.01,
        lng: this.getCapitalLng(country) + 0.01,
        services: ['LOCKER_LOCKER'] as ShippingService[],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return mockLockers;
  }

  /**
   * Upsert lockers to database
   */
  private async upsertLockers(lockers: CarrierLocker[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('carrier_lockers')
        .upsert(lockers, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to upsert lockers:', error);
      throw error;
    }
  }

  /**
   * Helper methods for mock data
   */
  private getCapitalCity(country: 'EE' | 'LV' | 'LT'): string {
    const capitals = {
      'EE': 'Tallinn',
      'LV': 'Riga', 
      'LT': 'Vilnius'
    };
    return capitals[country];
  }

  private getCapitalLat(country: 'EE' | 'LV' | 'LT'): number {
    const lats = {
      'EE': 59.4370,
      'LV': 56.9496,
      'LT': 54.6872
    };
    return lats[country];
  }

  private getCapitalLng(country: 'EE' | 'LV' | 'LT'): number {
    const lngs = {
      'EE': 24.7536,
      'LV': 24.1052,
      'LT': 25.2797
    };
    return lngs[country];
  }
}
