import { LockerService } from '../locker-service'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        ilike: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [],
              error: null
            }))
          }))
        }))
      })),
      single: jest.fn(() => ({
        data: null,
        error: { code: 'PGRST116' }
      }))
    })),
    upsert: jest.fn(() => ({
      data: null,
      error: null
    }))
  }))
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

describe('LockerService', () => {
  let lockerService: LockerService
  let mockFetch: jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    lockerService = new LockerService()
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockClear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('syncLockers', () => {
    it('should sync lockers from LP Express API', async () => {
      const mockTerminals = [
        {
          terminalId: '12345',
          name: 'Test Locker',
          address: 'Test Address',
          city: 'Tallinn',
          latitude: 59.4370,
          longitude: 24.7536,
          isActive: true
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTerminals,
      } as Response)

      await expect(lockerService.syncLockers('EE')).resolves.not.toThrow()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-manosiuntostst.post.lt/api/v2/public/terminals?countryCode=EE',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      )
      expect(mockSupabase.from().upsert).toHaveBeenCalled()
    })

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(lockerService.syncLockers('EE')).rejects.toThrow('Failed to fetch lockers: 500 Internal Server Error')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(lockerService.syncLockers('EE')).rejects.toThrow('Network error')
    })
  })

  describe('searchLockers', () => {
    it('should search lockers with query', async () => {
      const result = await lockerService.searchLockers('test')
      expect(result).toEqual([])
      expect(mockSupabase.from).toHaveBeenCalledWith('carrier_lockers')
    })

    it('should search lockers with country filter', async () => {
      const result = await lockerService.searchLockers('test', 'EE')
      expect(result).toEqual([])
    })

    it('should handle database errors', async () => {
      mockSupabase.from().select().eq().ilike().order().limit.mockReturnValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(lockerService.searchLockers('test')).rejects.toThrow('Database error')
    })
  })

  describe('getLockerById', () => {
    it('should return null for non-existent locker', async () => {
      const result = await lockerService.getLockerById('non-existent')
      expect(result).toBeNull()
    })

    it('should return locker when found', async () => {
      const mockLocker = {
        id: '12345',
        name: 'Test Locker',
        country: 'EE',
        city: 'Tallinn',
        address: 'Test Address',
        lat: 59.4370,
        lng: 24.7536,
        services: ['LOCKER_LOCKER'],
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.from().select().eq().eq().single.mockReturnValue({
        data: mockLocker,
        error: null
      })

      const result = await lockerService.getLockerById('12345')
      expect(result).toEqual(mockLocker)
    })

    it('should handle database errors', async () => {
      mockSupabase.from().select().eq().eq().single.mockReturnValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(lockerService.getLockerById('12345')).rejects.toThrow('Database error')
    })
  })

  describe('parseLockers', () => {
    it('should parse LP Express terminals response correctly', () => {
      const mockResponse = [
        {
          terminalId: '12345',
          name: 'Test Locker',
          address: 'Test Address 123',
          city: 'Tallinn',
          latitude: 59.4370,
          longitude: 24.7536,
          isActive: true
        }
      ]

      const result = (lockerService as Record<string, unknown>).parseLockers(mockResponse, 'EE')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '12345',
        name: 'Test Locker',
        country: 'EE',
        city: 'Tallinn',
        address: 'Test Address 123',
        lat: 59.4370,
        lng: 24.7536,
        services: ['LOCKER_LOCKER'],
        is_active: true,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    })

    it('should handle empty response', () => {
      const result = (lockerService as Record<string, unknown>).parseLockers([], 'EE')
      expect(result).toEqual([])
    })

    it('should handle non-array response', () => {
      const result = (lockerService as Record<string, unknown>).parseLockers(null, 'EE')
      expect(result).toEqual([])
    })

    it('should handle missing fields gracefully', () => {
      const mockResponse = [
        {
          terminalId: '12345',
          name: 'Test Locker',
          // Missing address, city, latitude, longitude, isActive
        }
      ]

      const result = (lockerService as Record<string, unknown>).parseLockers(mockResponse, 'EE')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '12345',
        name: 'Test Locker',
        country: 'EE',
        city: '',
        address: '',
        lat: NaN,
        lng: NaN,
        services: ['LOCKER_LOCKER'],
        is_active: false,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    })
  })

  describe('upsertLockers', () => {
    it('should upsert lockers to database', async () => {
      const mockLockers = [
        {
          id: '12345',
          name: 'Test Locker',
          country: 'EE',
          city: 'Tallinn',
          address: 'Test Address',
          lat: 59.4370,
          lng: 24.7536,
          services: ['LOCKER_LOCKER'],
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      await (lockerService as Record<string, unknown>).upsertLockers(mockLockers)

      expect(mockSupabase.from).toHaveBeenCalledWith('carrier_lockers')
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        mockLockers,
        { onConflict: 'id', ignoreDuplicates: false }
      )
    })

    it('should handle database errors', async () => {
      mockSupabase.from().upsert.mockReturnValue({
        data: null,
        error: { message: 'Database error' }
      })

      const mockLockers = [{ id: '12345', name: 'Test Locker' }]

      await expect((lockerService as Record<string, unknown>).upsertLockers(mockLockers)).rejects.toThrow('Database error')
    })
  })
})
