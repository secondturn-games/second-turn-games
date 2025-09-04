// Shipping integration types for Unisend/LP Express

export interface CarrierLocker {
  id: string;
  name: string;
  country: 'EE' | 'LV' | 'LT';
  city: string;
  address: string;
  lat: number;
  lng: number;
  location?: string; // PostGIS geometry as WKT
  services: ShippingService[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  distance_meters?: number; // For nearby search results
}

export interface Shipment {
  id: string;
  order_id: string;
  carrier: 'UNISEND' | 'LP_EXPRESS';
  service_code: string;
  size_code: 'S' | 'M' | 'L';
  from_locker_id?: string;
  to_locker_id: string;
  sender_name: string;
  sender_phone: string;
  sender_email?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  label_url?: string;
  label_format?: 'PDF' | 'ZPL';
  tracking_number?: string;
  tracking_status?: TrackingStatus;
  tracking_payload?: Record<string, unknown>;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  created_via: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  event_code: string;
  event_name: string;
  event_description?: string;
  event_timestamp: string;
  location_name?: string;
  location_address?: string;
  raw_data?: Record<string, unknown>;
  created_at: string;
}

export interface ShippingRate {
  id: string;
  carrier: 'UNISEND' | 'LP_EXPRESS';
  service_code: string;
  size_code: 'S' | 'M' | 'L';
  from_country: 'EE' | 'LV' | 'LT';
  to_country: 'EE' | 'LV' | 'LT';
  price_cents: number;
  currency: 'EUR';
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  carrier: 'UNISEND' | 'LP_EXPRESS';
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  error_message?: string;
  created_at: string;
}

// API Request/Response types
export interface CreateShipmentRequest {
  order_id: string;
  carrier: 'UNISEND' | 'LP_EXPRESS';
  service_code: string;
  size_code: 'S' | 'M' | 'L';
  from_locker_id?: string;
  to_locker_id: string;
  sender: ContactInfo;
  recipient: ContactInfo;
  parcel?: ParcelDimensions;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface ParcelDimensions {
  weight_grams: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
}

export interface CreateShipmentResponse {
  shipment_id: string;
  tracking_number: string;
  label_url: string;
  label_format: 'PDF' | 'ZPL';
  drop_off_code?: string;
  estimated_delivery: string;
}

export interface TrackingUpdate {
  tracking_number: string;
  status: TrackingStatus;
  event_code: string;
  event_name: string;
  event_description?: string;
  event_timestamp: string;
  location_name?: string;
  location_address?: string;
  raw_data?: Record<string, unknown>;
}

// Enums
export type ShippingService = 'LOCKER_LOCKER';

export type TrackingStatus = 
  | 'CREATED'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'RETURNED'
  | 'FAILED';

export type ShippingMethod = 
  | 'parcel_locker'
  | 'courier_delivery'
  | 'local_pickup';

// UI Component props
export interface LockerSelectorProps {
  country: 'EE' | 'LV' | 'LT';
  onSelect: (locker: CarrierLocker) => void;
  selectedLocker?: CarrierLocker;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export interface ShippingMethodCardProps {
  method: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    price: number;
    estimatedDays: string;
  };
  onSelect: (methodId: string) => void;
  isSelected: boolean;
}

export interface TrackingTimelineProps {
  shipment: Shipment;
  events?: TrackingEvent[];
}

// API Configuration
export interface ShippingConfig {
  unisend: {
    apiBase: string;
    apiKey: string;
    webhookSecret: string;
  };
  lpExpress: {
    apiBase: string;
    username: string;
    password: string;
    webhookSecret: string;
  };
  retry: {
    maxAttempts: number;
    baseDelayMs: number;
  };
  defaultCarrier: 'UNISEND' | 'LP_EXPRESS';
}

// Error types
export class ShippingError extends Error {
  constructor(
    message: string,
    public code: string,
    public carrier?: 'UNISEND' | 'LP_EXPRESS',
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ShippingError';
  }
}

export class LockerNotFoundError extends ShippingError {
  constructor(lockerId: string) {
    super(`Locker not found: ${lockerId}`, 'LOCKER_NOT_FOUND');
  }
}

export class InvalidShipmentDataError extends ShippingError {
  constructor(message: string) {
    super(`Invalid shipment data: ${message}`, 'INVALID_SHIPMENT_DATA');
  }
}

export class CarrierAPIError extends ShippingError {
  constructor(
    message: string,
    carrier: 'UNISEND' | 'LP_EXPRESS',
    retryable: boolean = false
  ) {
    super(message, 'CARRIER_API_ERROR', carrier, retryable);
  }
}
