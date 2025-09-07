import { createClient } from '@/lib/supabase/client';
import { CarrierLocker, ShippingService } from '@/types/shipping';

export class LockerService {
  private supabase = createClient();
  private apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';

  /**
   * Sync lockers from LP Express public API into database
   */
  async syncLockers(country: 'EE' | 'LV' | 'LT'): Promise<void> {
    try {
      const lockers = await this.fetchLockersFromAPI(country);
      await this.upsertLockers(lockers);
      console.log(`Synced ${lockers.length} lockers for ${country}`);
    } catch (error) {
      console.error(`Failed to sync lockers for ${country}:`, error);
      throw error;
    }
  }

  /**
   * Search lockers in DB
   */
  async searchLockers(query: string, country?: 'EE' | 'LV' | 'LT'): Promise<CarrierLocker[]> {
    let qb = this.supabase
      .from('carrier_lockers')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${query}%`);

    if (country) {
      qb = qb.eq('country', country);
    }

    const { data, error } = await qb.order('name').limit(50);
    if (error) throw error;
    return data || [];
  }

  /**
   * Get locker by ID
   */
  async getLockerById(id: string): Promise<CarrierLocker | null> {
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
  }

  /**
   * Fetch lockers from LP Express public API
   */
  private async fetchLockersFromAPI(country: 'EE' | 'LV' | 'LT'): Promise<CarrierLocker[]> {
    const res = await fetch(`${this.apiBase}/public/terminals?countryCode=${country}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch lockers: ${res.status} ${res.statusText}`);
    }

    const terminals = await res.json();
    return this.parseLockers(terminals, country);
  }

  /**
   * Parse API response into CarrierLocker[]
   */
  private parseLockers(apiResponse: unknown[], country: 'EE' | 'LV' | 'LT'): CarrierLocker[] {
    if (!Array.isArray(apiResponse)) return [];

    return apiResponse.map((t) => {
      const terminal = t as Record<string, unknown>;
      return {
        id: String(terminal.terminalId),
        name: String(terminal.name),
        country,
        city: String(terminal.city || ''),
        address: String(terminal.address || ''),
        lat: parseFloat(String(terminal.latitude)),
        lng: parseFloat(String(terminal.longitude)),
        services: ['LOCKER_LOCKER'] as ShippingService[],
        is_active: Boolean(terminal.isActive),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
  }

  /**
   * Upsert lockers into DB
   */
  private async upsertLockers(lockers: CarrierLocker[]): Promise<void> {
    const { error } = await this.supabase
      .from('carrier_lockers')
      .upsert(lockers, { onConflict: 'id', ignoreDuplicates: false });
    if (error) throw error;
  }
}
