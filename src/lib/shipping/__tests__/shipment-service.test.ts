import { ShipmentService } from '../shipment-service'
import { CreateShipmentRequest } from '@/types/shipping'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'test-locker-id' },
            error: null
          }))
        }))
      }))
    }))
  }))
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

// Mock environment variables
const originalEnv = process.env

describe('ShipmentService', () => {
  let shipmentService: ShipmentService
  let mockFetch: jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    shipmentService = new ShipmentService()
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockClear()
    jest.clearAllMocks()
    
    // Reset environment variables
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('createShipment', () => {
    const mockShipmentRequest: CreateShipmentRequest = {
      order_id: 'test-order-123',
      carrier: 'LP_EXPRESS',
      service_code: 'LOCKER_LOCKER',
      size_code: 'M',
      from_locker_id: 'from-locker-123',
      to_locker_id: 'to-locker-456',
      sender: {
        name: 'John Doe',
        phone: '+37212345678',
        email: 'john@example.com'
      },
      recipient: {
        name: 'Jane Smith',
        phone: '+37287654321',
        email: 'jane@example.com'
      },
      parcel: {
        weight_grams: 500,
        length_cm: 20,
        width_cm: 15,
        height_cm: 10
      }
    }

    beforeEach(() => {
      process.env.LP_EXPRESS_USERNAME = 'test-username'
      process.env.LP_EXPRESS_PASSWORD = 'test-password'
    })

    it('should create shipment successfully', async () => {
      // Mock auth response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)

      // Mock shipment creation response
      const mockApiResponse = {
        parcelId: 'parcel-123',
        barcode: 'TRK123456',
        labelPdfUrl: 'https://example.com/label.pdf',
        pinCode: '1234',
        plannedDeliveryDate: '2024-01-15T10:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const result = await shipmentService.createShipment(mockShipmentRequest)

      expect(result).toEqual({
        shipment_id: 'parcel-123',
        tracking_number: 'TRK123456',
        label_url: 'https://example.com/label.pdf',
        label_format: 'PDF',
        drop_off_code: '1234',
        estimated_delivery: '2024-01-15T10:00:00Z'
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-manosiuntostst.post.lt/api/v2/users/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test-username', password: 'test-password' })
        })
      )
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-manosiuntostst.post.lt/api/v2/parcel',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should throw error when credentials not configured', async () => {
      delete process.env.LP_EXPRESS_USERNAME
      delete process.env.LP_EXPRESS_PASSWORD

      await expect(shipmentService.createShipment(mockShipmentRequest))
        .rejects.toThrow('LP Express credentials not configured')
    })

    it('should throw error when auth fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response)

      await expect(shipmentService.createShipment(mockShipmentRequest))
        .rejects.toThrow('Auth failed: 401 Unauthorized')
    })

    it('should throw error when shipment creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid data'
      } as Response)

      await expect(shipmentService.createShipment(mockShipmentRequest))
        .rejects.toThrow('Shipment creation failed: 400 - Invalid data')
    })

    it('should validate required fields', async () => {
      const invalidRequest = { ...mockShipmentRequest, to_locker_id: '' }

      await expect(shipmentService.createShipment(invalidRequest))
        .rejects.toThrow('Destination locker is required')
    })

    it('should validate phone number format', async () => {
      const invalidRequest = {
        ...mockShipmentRequest,
        sender: { ...mockShipmentRequest.sender, phone: 'invalid-phone' }
      }

      await expect(shipmentService.createShipment(invalidRequest))
        .rejects.toThrow('Invalid sender phone number format')
    })

    it('should validate locker exists', async () => {
      mockSupabase.from().select().eq().eq().single.mockReturnValue({
        data: null,
        error: { code: 'PGRST116' }
      })

      await expect(shipmentService.createShipment(mockShipmentRequest))
        .rejects.toThrow('Destination locker not found or inactive')
    })
  })

  describe('getLabel', () => {
    beforeEach(() => {
      process.env.LP_EXPRESS_USERNAME = 'test-username'
      process.env.LP_EXPRESS_PASSWORD = 'test-password'
    })

    it('should get label successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)

      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      } as Response)

      const result = await shipmentService.getLabel('parcel-123')

      expect(result).toEqual({
        url: expect.stringContaining('blob:'),
        format: 'PDF'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-manosiuntostst.post.lt/api/v2/parcel/parcel-123/label?format=PDF',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      )
    })

    it('should throw error when label fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response)

      await expect(shipmentService.getLabel('invalid-id'))
        .rejects.toThrow('Label fetch failed: 404 Not Found')
    })
  })

  describe('getTracking', () => {
    beforeEach(() => {
      process.env.LP_EXPRESS_USERNAME = 'test-username'
      process.env.LP_EXPRESS_PASSWORD = 'test-password'
    })

    it('should get tracking events successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)

      const mockEvents = [
        {
          event_code: 'CREATED',
          event_name: 'Parcel Created',
          event_timestamp: '2024-01-10T10:00:00Z',
          location_name: 'Origin Terminal'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents
      } as Response)

      const result = await shipmentService.getTracking('TRK123456')

      expect(result).toEqual(mockEvents)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-manosiuntostst.post.lt/api/v2/parcel/TRK123456/events',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      )
    })

    it('should throw error when tracking fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response)

      await expect(shipmentService.getTracking('invalid-barcode'))
        .rejects.toThrow('Tracking fetch failed: 404 Not Found')
    })
  })

  describe('cancelShipment', () => {
    beforeEach(() => {
      process.env.LP_EXPRESS_USERNAME = 'test-username'
      process.env.LP_EXPRESS_PASSWORD = 'test-password'
    })

    it('should cancel shipment successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)

      await expect(shipmentService.cancelShipment('parcel-123')).resolves.not.toThrow()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-manosiuntostst.post.lt/api/v2/parcel/parcel-123',
        expect.objectContaining({
          method: 'DELETE',
          headers: { Authorization: 'Bearer test-token' }
        })
      )
    })

    it('should throw error when cancel fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response)

      await expect(shipmentService.cancelShipment('parcel-123'))
        .rejects.toThrow('Cancel failed: 400 Bad Request')
    })
  })

  describe('buildShipmentPayload', () => {
    it('should build correct payload', () => {
      const mockRequest: CreateShipmentRequest = {
        order_id: 'test-order-123',
        carrier: 'LP_EXPRESS',
        service_code: 'LOCKER_LOCKER',
        size_code: 'M',
        from_locker_id: 'from-locker-123',
        to_locker_id: 'to-locker-456',
        sender: {
          name: 'John Doe',
          phone: '+37212345678',
          email: 'john@example.com'
        },
        recipient: {
          name: 'Jane Smith',
          phone: '+37287654321',
          email: 'jane@example.com'
        }
      }

      const payload = (shipmentService as Record<string, unknown>).buildShipmentPayload(mockRequest)

      expect(payload).toEqual({
        parcelSize: 'M',
        senderTerminalId: 'from-locker-123',
        receiverTerminalId: 'to-locker-456',
        senderName: 'John Doe',
        senderPhone: '+37212345678',
        senderEmail: 'john@example.com',
        receiverName: 'Jane Smith',
        receiverPhone: '+37287654321',
        receiverEmail: 'jane@example.com',
        reference: 'test-order-123',
        codAmount: 0,
        insurance: false
      })
    })
  })

  describe('parseShipmentResponse', () => {
    it('should parse API response correctly', () => {
      const mockApiResponse = {
        parcelId: 'parcel-123',
        barcode: 'TRK123456',
        labelPdfUrl: 'https://example.com/label.pdf',
        pinCode: '1234',
        plannedDeliveryDate: '2024-01-15T10:00:00Z'
      }

      const result = (shipmentService as Record<string, unknown>).parseShipmentResponse(mockApiResponse)

      expect(result).toEqual({
        shipment_id: 'parcel-123',
        tracking_number: 'TRK123456',
        label_url: 'https://example.com/label.pdf',
        label_format: 'PDF',
        drop_off_code: '1234',
        estimated_delivery: '2024-01-15T10:00:00Z'
      })
    })

    it('should handle missing optional fields', () => {
      const mockApiResponse = {
        parcelId: 'parcel-123',
        barcode: 'TRK123456',
        labelPdfUrl: 'https://example.com/label.pdf'
        // Missing pinCode and plannedDeliveryDate
      }

      const result = (shipmentService as Record<string, unknown>).parseShipmentResponse(mockApiResponse)

      expect(result).toEqual({
        shipment_id: 'parcel-123',
        tracking_number: 'TRK123456',
        label_url: 'https://example.com/label.pdf',
        label_format: 'PDF',
        drop_off_code: '',
        estimated_delivery: expect.any(String)
      })
    })
  })
})