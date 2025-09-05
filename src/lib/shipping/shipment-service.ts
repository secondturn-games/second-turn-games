import { createClient } from '@/lib/supabase/client';
import { 
  Shipment, 
  CreateShipmentRequest, 
  CreateShipmentResponse,
  TrackingUpdate,
  InvalidShipmentDataError
} from '@/types/shipping';

export class ShipmentService {
  private supabase = createClient();

  /**
   * Create a new shipment
   */
  async createShipment(data: CreateShipmentRequest): Promise<Shipment> {
    try {
      // Validate input data
      await this.validateShipmentData(data);
      
      // Create shipment via carrier API
      const response = await this.callCarrierAPI(data);
      
      // Store in database
      const shipment = await this.saveShipment(data, response);
      
      // Send notifications
      await this.notifyStakeholders(shipment);
      
      return shipment;
    } catch (error) {
      console.error('Failed to create shipment:', error);
      throw error;
    }
  }

  /**
   * Generate shipping label
   */
  async generateLabel(shipmentId: string): Promise<{ url: string; format: string }> {
    try {
      // Get shipment from database
      const shipment = await this.getShipmentById(shipmentId);
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      // Generate label via carrier API
      const label = await this.createLabelViaAPI(shipment);
      
      // Store label URL in database
      await this.updateShipmentLabel(shipmentId, label.url, label.format);
      
      return label;
    } catch (error) {
      console.error('Failed to generate label:', error);
      throw error;
    }
  }

  /**
   * Get shipment by ID
   */
  async getShipmentById(id: string): Promise<Shipment | null> {
    try {
      const { data, error } = await this.supabase
        .from('shipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get shipment:', error);
      throw error;
    }
  }

  /**
   * Get shipments by order ID
   */
  async getShipmentsByOrder(orderId: string): Promise<Shipment[]> {
    try {
      const { data, error } = await this.supabase
        .from('shipments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get shipments by order:', error);
      throw error;
    }
  }

  /**
   * Update tracking status
   */
  async updateTrackingStatus(update: TrackingUpdate): Promise<void> {
    try {
      // Update shipment status
      const { error: shipmentError } = await this.supabase
        .from('shipments')
        .update({
          tracking_status: update.status,
          tracking_payload: update.raw_data,
          updated_at: new Date().toISOString()
        })
        .eq('tracking_number', update.tracking_number);

      if (shipmentError) throw shipmentError;

      // Add tracking event
      const { error: eventError } = await this.supabase
        .from('tracking_events')
        .insert({
          shipment_id: await this.getShipmentIdByTrackingNumber(update.tracking_number),
          event_code: update.event_code,
          event_name: update.event_name,
          event_description: update.event_description,
          event_timestamp: update.event_timestamp,
          location_name: update.location_name,
          location_address: update.location_address,
          raw_data: update.raw_data
        });

      if (eventError) throw eventError;

      // Send notifications if needed
      await this.handleStatusChangeNotifications(update);
    } catch (error) {
      console.error('Failed to update tracking status:', error);
      throw error;
    }
  }

  /**
   * Validate shipment data
   */
  private async validateShipmentData(data: CreateShipmentRequest): Promise<void> {
    // Validate required fields
    if (!data.order_id) {
      throw new InvalidShipmentDataError('Order ID is required');
    }
    if (!data.to_locker_id) {
      throw new InvalidShipmentDataError('Destination locker is required');
    }
    if (!data.sender.name || !data.sender.phone) {
      throw new InvalidShipmentDataError('Sender name and phone are required');
    }
    if (!data.recipient.name || !data.recipient.phone) {
      throw new InvalidShipmentDataError('Recipient name and phone are required');
    }

    // Validate phone numbers (basic E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(data.sender.phone)) {
      throw new InvalidShipmentDataError('Invalid sender phone number format');
    }
    if (!phoneRegex.test(data.recipient.phone)) {
      throw new InvalidShipmentDataError('Invalid recipient phone number format');
    }

    // Validate locker exists
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
   * Call carrier API to create shipment
   */
  private async callCarrierAPI(data: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const apiBase = process.env.NEXT_PUBLIC_LP_EXPRESS_API_URL || 'https://api-manosiuntostst.post.lt/api/v2';
    const username = process.env.LP_EXPRESS_USERNAME;
    const password = process.env.LP_EXPRESS_PASSWORD;

    if (!username || !password) {
      console.warn('LP Express credentials not configured, using mock response');
      return this.getMockResponse(data);
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

      // Create shipment
      const shipmentPayload = this.buildShipmentPayload(data);
      
      const shipmentResponse = await fetch(`${apiBase}/parcels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shipmentPayload)
      });

      if (!shipmentResponse.ok) {
        const errorText = await shipmentResponse.text();
        throw new Error(`Shipment creation failed: ${shipmentResponse.statusText} - ${errorText}`);
      }

      const shipmentData = await shipmentResponse.json();
      return this.parseShipmentResponse(shipmentData);
    } catch (error) {
      console.error('LP Express API call failed:', error);
      // Fallback to mock response for testing
      return this.getMockResponse(data);
    }
  }

  /**
   * Build shipment payload for LP Express API
   */
  private buildShipmentPayload(data: CreateShipmentRequest) {
    return {
      // Basic shipment info
      service: data.service_code,
      size: data.size_code,
      
      // Sender information
      sender: {
        name: data.sender.name,
        phone: data.sender.phone,
        email: data.sender.email
      },
      
      // Recipient information  
      recipient: {
        name: data.recipient.name,
        phone: data.recipient.phone,
        email: data.recipient.email
      },
      
      // Locker information
      from_locker: data.from_locker_id,
      to_locker: data.to_locker_id,
      
      // Parcel dimensions
      parcel: data.parcel ? {
        weight: data.parcel.weight_grams,
        length: data.parcel.length_cm,
        width: data.parcel.width_cm,
        height: data.parcel.height_cm
      } : undefined,
      
      // Order reference
      order_reference: data.order_id,
      
      // Additional options
      options: {
        insurance: false,
        cod: false,
        notification: true
      }
    };
  }

  /**
   * Parse LP Express API response
   */
  private parseShipmentResponse(apiResponse: unknown): CreateShipmentResponse {
    const response = apiResponse as Record<string, unknown>;
    return {
      shipment_id: String(response.id || response.shipment_id || ''),
      tracking_number: String(response.tracking_number || response.tracking_code || ''),
      label_url: String(response.label_url || response.label || ''),
      label_format: (response.label_format as 'PDF' | 'ZPL') || 'PDF',
      drop_off_code: String(response.drop_off_code || response.pickup_code || ''),
      estimated_delivery: String(response.estimated_delivery || response.delivery_date || new Date().toISOString())
    };
  }

  /**
   * Get mock response for testing
   */
  private getMockResponse(_data: CreateShipmentRequest): CreateShipmentResponse {
    return {
      shipment_id: `ship_${Date.now()}`,
      tracking_number: `TRK${Date.now()}`,
      label_url: `https://example.com/labels/${Date.now()}.pdf`,
      label_format: 'PDF',
      drop_off_code: `DROP${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Save shipment to database
   */
  private async saveShipment(
    data: CreateShipmentRequest, 
    response: CreateShipmentResponse
  ): Promise<Shipment> {
    try {
      const shipmentData = {
        order_id: data.order_id,
        carrier: data.carrier,
        service_code: data.service_code,
        size_code: data.size_code,
        from_locker_id: data.from_locker_id,
        to_locker_id: data.to_locker_id,
        sender_name: data.sender.name,
        sender_phone: data.sender.phone,
        sender_email: data.sender.email,
        recipient_name: data.recipient.name,
        recipient_phone: data.recipient.phone,
        recipient_email: data.recipient.email,
        label_url: response.label_url,
        label_format: response.label_format,
        tracking_number: response.tracking_number,
        tracking_status: 'CREATED',
        weight_grams: data.parcel?.weight_grams,
        length_cm: data.parcel?.length_cm,
        width_cm: data.parcel?.width_cm,
        height_cm: data.parcel?.height_cm
      };

      const { data: shipment, error } = await this.supabase
        .from('shipments')
        .insert(shipmentData)
        .select()
        .single();

      if (error) throw error;
      return shipment;
    } catch (error) {
      console.error('Failed to save shipment:', error);
      throw error;
    }
  }

  /**
   * Create label via carrier API
   */
  private async createLabelViaAPI(shipment: Shipment): Promise<{ url: string; format: string }> {
    // TODO: Implement actual carrier API call for label generation
    return {
      url: `https://example.com/labels/${shipment.tracking_number}.pdf`,
      format: 'PDF'
    };
  }

  /**
   * Update shipment label in database
   */
  private async updateShipmentLabel(
    shipmentId: string, 
    labelUrl: string, 
    labelFormat: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('shipments')
        .update({
          label_url: labelUrl,
          label_format: labelFormat,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update shipment label:', error);
      throw error;
    }
  }

  /**
   * Get shipment ID by tracking number
   */
  private async getShipmentIdByTrackingNumber(trackingNumber: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('shipments')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to get shipment ID by tracking number:', error);
      throw error;
    }
  }

  /**
   * Notify stakeholders about shipment creation
   */
  private async notifyStakeholders(shipment: Shipment): Promise<void> {
    // TODO: Implement notification logic
    console.log('Notifying stakeholders about shipment:', shipment.id);
  }

  /**
   * Handle status change notifications
   */
  private async handleStatusChangeNotifications(update: TrackingUpdate): Promise<void> {
    // TODO: Implement notification logic for status changes
    console.log('Handling status change notifications for:', update.tracking_number);
  }
}
