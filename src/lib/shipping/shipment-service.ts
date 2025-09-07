import { createClient } from '@/lib/supabase/client';
import {
  CreateShipmentRequest,
  CreateShipmentResponse,
  TrackingUpdate,
  InvalidShipmentDataError,
  ShippingRate
} from '@/types/shipping';

export class ShipmentService {
  private supabase = createClient();
  private isDemoMode = !process.env.LP_EXPRESS_USERNAME || !process.env.LP_EXPRESS_PASSWORD;

  private async getAuthToken(): Promise<string> {
    // Demo mode - return a mock token
    if (this.isDemoMode) {
      console.log('🚀 Demo Mode: Using mock authentication token');
      return 'demo-token-12345';
    }

    const apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';
    const username = process.env.LP_EXPRESS_USERNAME;
    const password = process.env.LP_EXPRESS_PASSWORD;

    if (!username || !password) {
      throw new Error('LP Express credentials not configured');
    }

    const res = await fetch(`${apiBase}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
    }

    const { token } = await res.json();
    if (!token) throw new Error('No token returned from LP Express API');
    return token;
  }

  /**
   * Calculate shipping fee for T2T service
   */
  async calculateShippingFee(data: {
    from_country: 'EE' | 'LV' | 'LT';
    to_country: 'EE' | 'LV' | 'LT';
    size_code: 'XS' | 'S' | 'M' | 'L';
  }): Promise<ShippingRate> {
    // Demo mode - return mock pricing
    if (this.isDemoMode) {
      console.log('🚀 Demo Mode: Calculating mock shipping fee');
      return this.createMockShippingRate(data);
    }

    // Real API call to get shipping rates
    const apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';
    const token = await this.getAuthToken();

    const res = await fetch(`${apiBase}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fromCountry: data.from_country,
        toCountry: data.to_country,
        serviceCode: 'T2T',
        sizeCode: data.size_code
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to get shipping rates: ${res.status} ${res.statusText}`);
    }

    const rate = await res.json();
    return this.parseShippingRate(rate);
  }

  /**
   * Create shipment (locker → locker)
   */
  async createShipment(data: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    await this.validateShipmentData(data);

    // Demo mode - return mock response
    if (this.isDemoMode) {
      console.log('🚀 Demo Mode: Creating mock shipment');
      return this.createMockShipment(data);
    }

    const apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';
    const token = await this.getAuthToken();

    const payload = this.buildShipmentPayload(data);

    const res = await fetch(`${apiBase}/parcel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Shipment creation failed: ${res.status} - ${errorText}`);
    }

    const response = await res.json();
    return this.parseShipmentResponse(response);
  }

  /**
   * Get shipping label (PDF)
   */
  async getLabel(parcelId: string): Promise<{ url: string; format: string }> {
    // Demo mode - return mock label
    if (this.isDemoMode) {
      console.log('🚀 Demo Mode: Generating mock label');
      return this.createMockLabel(parcelId);
    }

    const apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';
    const token = await this.getAuthToken();

    const res = await fetch(`${apiBase}/parcel/${parcelId}/label?format=PDF`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Label fetch failed: ${res.status} ${res.statusText}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return { url, format: 'PDF' };
  }

  /**
   * Get tracking events
   */
  async getTracking(barcode: string): Promise<TrackingUpdate[]> {
    // Demo mode - return mock tracking
    if (this.isDemoMode) {
      console.log('🚀 Demo Mode: Returning mock tracking data');
      return this.createMockTracking(barcode);
    }

    const apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';
    const token = await this.getAuthToken();

    const res = await fetch(`${apiBase}/parcel/${barcode}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Tracking fetch failed: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(parcelId: string): Promise<void> {
    // Demo mode - simulate cancellation
    if (this.isDemoMode) {
      console.log('🚀 Demo Mode: Simulating shipment cancellation');
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';
    const token = await this.getAuthToken();

    const res = await fetch(`${apiBase}/parcel/${parcelId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Cancel failed: ${res.status} ${res.statusText}`);
    }
  }

  /**
   * Validate locker-to-locker shipment data
   */
  private async validateShipmentData(data: CreateShipmentRequest): Promise<void> {
    if (!data.to_locker_id) {
      throw new InvalidShipmentDataError('Destination locker is required');
    }
    if (!data.sender.name || !data.sender.phone) {
      throw new InvalidShipmentDataError('Sender name and phone are required');
    }
    if (!data.recipient.name || !data.recipient.phone) {
      throw new InvalidShipmentDataError('Recipient name and phone are required');
    }

    // basic E.164 phone check
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(data.sender.phone)) {
      throw new InvalidShipmentDataError('Invalid sender phone number format');
    }
    if (!phoneRegex.test(data.recipient.phone)) {
      throw new InvalidShipmentDataError('Invalid recipient phone number format');
    }

    // verify locker exists
    const { data: locker } = await this.supabase
      .from('carrier_lockers')
      .select('id')
      .eq('id', data.to_locker_id)
      .eq('is_active', true)
      .single();

    if (!locker) {
      throw new InvalidShipmentDataError('Destination locker not found or inactive');
    }
  }

  /**
   * Build payload for /parcel
   */
  private buildShipmentPayload(data: CreateShipmentRequest) {
    return {
      planTypeCode: 'T2T',                     // Terminal to Terminal service
      serviceCode: 'T2T',                      // Service code for locker-to-locker
      parcelSize: data.size_code,              // XS | S | M | L
      senderTerminalId: data.from_locker_id,   // optional
      receiverTerminalId: data.to_locker_id,
      senderName: data.sender.name,
      senderPhone: data.sender.phone,
      senderEmail: data.sender.email,
      receiverName: data.recipient.name,
      receiverPhone: data.recipient.phone,
      receiverEmail: data.recipient.email,
      reference: data.order_id,
      codAmount: 0,
      insurance: false
    };
  }

  /**
   * Parse API response into internal format
   */
  private parseShipmentResponse(apiResponse: unknown): CreateShipmentResponse {
    const response = apiResponse as Record<string, unknown>;
    return {
      shipment_id: String(response.parcelId),
      tracking_number: String(response.barcode),
      label_url: String(response.labelPdfUrl),
      label_format: 'PDF',
      drop_off_code: String(response.pinCode || ''), // sometimes provided
      estimated_delivery: String(response.plannedDeliveryDate || new Date().toISOString())
    };
  }

  /**
   * Create mock shipment for demo mode
   */
  private async createMockShipment(data: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockId = `DEMO-T2T-${Date.now()}`;
    const mockBarcode = `LP${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    console.log('🚀 Demo Mode: Creating T2T (Terminal to Terminal) shipment');
    console.log('📦 Plan Type Code: T2T');
    console.log('🏪 From Locker:', data.from_locker_id || 'Any locker');
    console.log('🏪 To Locker:', data.to_locker_id);
    
    return {
      shipment_id: mockId,
      tracking_number: mockBarcode,
      label_url: `demo://label/${mockId}.pdf`, // Local demo URL
      label_format: 'PDF',
      drop_off_code: Math.random().toString(10).substr(2, 6),
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
    };
  }

  /**
   * Create mock label for demo mode
   */
  private async createMockLabel(parcelId: string): Promise<{ url: string; format: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('🚀 Demo Mode: Generating mock PDF label for', parcelId);

    // Create a more detailed mock PDF blob
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 <<
      /Type /Font
      /Subtype /Type1
      /BaseFont /Helvetica
    >>
  >>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 16 Tf
50 750 Td
(LP EXPRESS - T2T Service) Tj
0 -30 Td
/F1 12 Tf
(Shipment ID: ${parcelId}) Tj
0 -20 Td
(Service: Terminal to Terminal) Tj
0 -20 Td
(Status: Demo Mode) Tj
0 -20 Td
(Date: ${new Date().toLocaleDateString()}) Tj
0 -20 Td
(Time: ${new Date().toLocaleTimeString()}) Tj
0 -40 Td
/F1 10 Tf
(This is a demo label generated for testing purposes.) Tj
0 -15 Td
(No real shipment was created.) Tj
0 -15 Td
(To use real labels, add LP Express credentials to .env.local) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
500
%%EOF`;

    const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    console.log('📄 Demo Mode: PDF label created successfully');
    console.log('🔗 Label URL:', url);
    
    return { url, format: 'PDF' };
  }

  /**
   * Create mock shipping rate for demo mode
   */
  private async createMockShippingRate(data: {
    from_country: 'EE' | 'LV' | 'LT';
    to_country: 'EE' | 'LV' | 'LT';
    size_code: 'XS' | 'S' | 'M' | 'L';
  }): Promise<ShippingRate> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock pricing based on size and distance
    const basePrices = {
      'XS': 150, // €1.50
      'S': 200,  // €2.00
      'M': 300,  // €3.00
      'L': 450   // €4.50
    };

    const basePrice = basePrices[data.size_code];
    
    // Add distance multiplier (same country = 1.0, different country = 1.5)
    const distanceMultiplier = data.from_country === data.to_country ? 1.0 : 1.5;
    const finalPrice = Math.round(basePrice * distanceMultiplier);

    console.log('💰 Demo Mode: Shipping fee calculated');
    console.log(`📦 Size: ${data.size_code}, From: ${data.from_country}, To: ${data.to_country}`);
    console.log(`💶 Price: €${(finalPrice / 100).toFixed(2)}`);

    return {
      id: `demo-rate-${Date.now()}`,
      carrier: 'LP_EXPRESS',
      service_code: 'T2T',
      size_code: data.size_code,
      from_country: data.from_country,
      to_country: data.to_country,
      price_cents: finalPrice,
      currency: 'EUR',
      is_active: true,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_at: new Date().toISOString()
    };
  }

  /**
   * Parse API response into ShippingRate
   */
  private parseShippingRate(apiResponse: unknown): ShippingRate {
    const response = apiResponse as Record<string, unknown>;
    return {
      id: String(response.id),
      carrier: 'LP_EXPRESS',
      service_code: String(response.serviceCode || 'T2T'),
      size_code: String(response.sizeCode) as 'XS' | 'S' | 'M' | 'L',
      from_country: String(response.fromCountry) as 'EE' | 'LV' | 'LT',
      to_country: String(response.toCountry) as 'EE' | 'LV' | 'LT',
      price_cents: Number(response.priceCents || (response.price as number) * 100),
      currency: 'EUR',
      is_active: Boolean(response.isActive),
      valid_from: String(response.validFrom || new Date().toISOString()),
      valid_until: response.validUntil ? String(response.validUntil) : undefined,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Create mock tracking data for demo mode
   */
  private async createMockTracking(barcode: string): Promise<TrackingUpdate[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    return [
      {
        tracking_number: barcode,
        status: 'ACCEPTED',
        event_code: 'ACCEPTED',
        event_name: 'Package Accepted',
        event_description: 'Package picked up from sender',
        event_timestamp: twoDaysAgo.toISOString(),
        location_name: 'Riga, Latvia'
      },
      {
        tracking_number: barcode,
        status: 'IN_TRANSIT',
        event_code: 'IN_TRANSIT',
        event_name: 'In Transit',
        event_description: 'Package in transit to destination',
        event_timestamp: yesterday.toISOString(),
        location_name: 'Vilnius, Lithuania'
      },
      {
        tracking_number: barcode,
        status: 'DELIVERED',
        event_code: 'DELIVERED',
        event_name: 'Delivered',
        event_description: 'Package delivered to locker',
        event_timestamp: now.toISOString(),
        location_name: 'Tallinn, Estonia'
      }
    ];
  }
}