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
   * Fetch lockers from Unisend API
   */
  private async fetchUnisendLockers(country: 'EE' | 'LV' | 'LT'): Promise<CarrierLocker[]> {
    // TODO: Implement actual Unisend API call
    // This is a placeholder implementation
    const mockLockers: CarrierLocker[] = [
      {
        id: `unisend-${country.toLowerCase()}-001`,
        name: `Parcel Locker ${country}001`,
        country,
        city: this.getCapitalCity(country),
        address: `${this.getCapitalCity(country)} Central Station`,
        lat: this.getCapitalLat(country),
        lng: this.getCapitalLng(country),
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
