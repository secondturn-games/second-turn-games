import { CarrierLocker, Shipment, CreateShipmentRequest } from '@/types/shipping'

export const createMockLocker = (overrides: Partial<CarrierLocker> = {}): CarrierLocker => ({
  id: 'test-locker-1',
  name: 'Test Locker',
  country: 'EE',
  city: 'Tallinn',
  address: 'Test Address 123',
  lat: 59.4370,
  lng: 24.7536,
  services: ['LOCKER_LOCKER'],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockShipment = (overrides: Partial<Shipment> = {}): Shipment => ({
  id: 'test-shipment-1',
  order_id: 'test-order-123',
  carrier: 'LP_EXPRESS',
  service_code: 'LOCKER_LOCKER',
  size_code: 'M',
  from_locker_id: 'locker-1',
  to_locker_id: 'locker-2',
  sender_name: 'Test Sender',
  sender_phone: '+372 12345678',
  sender_email: 'sender@test.com',
  recipient_name: 'Test Recipient',
  recipient_phone: '+371 87654321',
  recipient_email: 'recipient@test.com',
  tracking_number: 'TRK123456',
  tracking_status: 'CREATED',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockShipmentRequest = (overrides: Partial<CreateShipmentRequest> = {}): CreateShipmentRequest => ({
  order_id: 'test-order-123',
  carrier: 'LP_EXPRESS',
  service_code: 'LOCKER_LOCKER',
  size_code: 'M',
  from_locker_id: 'locker-1',
  to_locker_id: 'locker-2',
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
  },
  ...overrides
})

export const mockLPExpressTerminals = [
  {
    terminalId: '12345',
    name: 'LP Express Tallinn Central',
    address: 'Vabaduse väljak 8, Tallinn',
    city: 'Tallinn',
    latitude: 59.4370,
    longitude: 24.7536,
    isActive: true
  },
  {
    terminalId: '12346',
    name: 'LP Express Riga Central',
    address: 'Brīvības iela 1, Riga',
    city: 'Riga',
    latitude: 56.9465,
    longitude: 24.1048,
    isActive: true
  }
]

export const mockLPExpressAuthResponse = {
  token: 'test-token-123'
}

export const mockLPExpressShipmentResponse = {
  parcelId: 'parcel-12345',
  barcode: 'BC123456789',
  labelPdfUrl: 'https://api.example.com/labels/parcel-12345.pdf',
  dropOffCode: 'DROP12345',
  estimatedDelivery: '2024-01-03T10:00:00Z'
}

export const mockSupabaseResponse = {
  data: null,
  error: null
}

export const mockSupabaseError = {
  data: null,
  error: { code: 'PGRST116', message: 'No rows found' }
}

export const createMockFetch = (responses: Response[]) => {
  let callCount = 0
  return jest.fn().mockImplementation(() => {
    const response = responses[callCount] || responses[responses.length - 1]
    callCount++
    return Promise.resolve(response)
  })
}

export const createMockResponse = (data: unknown, ok: boolean = true, status: number = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  json: async () => data,
  text: async () => JSON.stringify(data)
}) as Response
