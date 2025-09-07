import { LockerService } from '../locker-service'
import { ShipmentService } from '../shipment-service'
import { createMockShipmentRequest } from './test-utils'

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('API Integration Tests', () => {
  let lockerService: LockerService
  let shipmentService: ShipmentService

  beforeEach(() => {
    lockerService = new LockerService()
    shipmentService = new ShipmentService()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('LP Express Public Terminals API', () => {
    it('should fetch terminals from LP Express API', async () => {
      const mockTerminals = [
        {
          terminalId: '12345',
          name: 'LP Express Tallinn Central',
          address: 'Vabaduse väljak 8, Tallinn',
          city: 'Tallinn',
          latitude: 59.4370,
          longitude: 24.7536,
          isActive: true
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTerminals,
        status: 200,
        statusText: 'OK'
      } as Response)

      const result = await (lockerService as Record<string, unknown>).fetchLockersFromAPI('EE')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-manosiuntostst.post.lt/api/v2/public/terminals?countryCode=EE',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '12345',
        name: 'LP Express Tallinn Central',
        country: 'EE',
        city: 'Tallinn',
        address: 'Vabaduse väljak 8, Tallinn',
        lat: 59.4370,
        lng: 24.7536,
        services: ['LOCKER_LOCKER'],
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      await expect((lockerService as Record<string, unknown>).fetchLockersFromAPI('EE'))
        .rejects.toThrow('Failed to fetch lockers: 500 Internal Server Error')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect((lockerService as Record<string, unknown>).fetchLockersFromAPI('EE'))
        .rejects.toThrow('Network error')
    })
  })

  describe('LP Express Shipment API', () => {
    beforeEach(() => {
      // Mock environment variables
      process.env.LP_EXPRESS_USERNAME = 'test-username'
      process.env.LP_EXPRESS_PASSWORD = 'test-password'
    })

    afterEach(() => {
      delete process.env.LP_EXPRESS_USERNAME
      delete process.env.LP_EXPRESS_PASSWORD
    })

    it('should authenticate and create shipment', async () => {
      const shipmentRequest = createMockShipmentRequest()

      // Mock auth response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' }),
        status: 200,
        statusText: 'OK'
      } as Response)

      // Mock shipment creation response
      const mockShipmentResponse = {
        parcelId: 'parcel-123',
        barcode: 'TRK123456',
        labelPdfUrl: 'https://example.com/label.pdf',
        pinCode: '1234',
        plannedDeliveryDate: '2024-01-15T10:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShipmentResponse,
        status: 200,
        statusText: 'OK'
      } as Response)

      const result = await shipmentService.createShipment(shipmentRequest)

      // Verify authentication call
      expect(mockFetch).toHaveBeenNthCalledWith(1,
        'https://api-manosiuntostst.post.lt/api/v2/users/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test-username', password: 'test-password' })
        })
      )

      // Verify shipment creation call
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://api-manosiuntostst.post.lt/api/v2/parcel',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )

      expect(result).toEqual({
        shipment_id: 'parcel-123',
        tracking_number: 'TRK123456',
        label_url: 'https://example.com/label.pdf',
        label_format: 'PDF',
        drop_off_code: '1234',
        estimated_delivery: '2024-01-15T10:00:00Z'
      })
    })

    it('should handle authentication failure', async () => {
      const shipmentRequest = createMockShipmentRequest()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response)

      await expect(shipmentService.createShipment(shipmentRequest))
        .rejects.toThrow('Auth failed: 401 Unauthorized')
    })

    it('should handle shipment creation failure', async () => {
      const shipmentRequest = createMockShipmentRequest()

      // Mock successful auth
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' }),
        status: 200,
        statusText: 'OK'
      } as Response)

      // Mock failed shipment creation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid data',
        statusText: 'Bad Request'
      } as Response)

      await expect(shipmentService.createShipment(shipmentRequest))
        .rejects.toThrow('Shipment creation failed: 400 - Invalid data')
    })

    it('should throw error when credentials not provided', async () => {
      delete process.env.LP_EXPRESS_USERNAME
      delete process.env.LP_EXPRESS_PASSWORD

      const shipmentRequest = createMockShipmentRequest()

      await expect(shipmentService.createShipment(shipmentRequest))
        .rejects.toThrow('LP Express credentials not configured')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => 'invalid-json',
        status: 200,
        statusText: 'OK'
      } as Response)

      const result = await (lockerService as Record<string, unknown>).fetchLockersFromAPI('EE')

      // Should return empty array when response is not an array
      expect(result).toHaveLength(0)
    })

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('timeout'))

      await expect((lockerService as Record<string, unknown>).fetchLockersFromAPI('EE'))
        .rejects.toThrow('timeout')
    })
  })
})