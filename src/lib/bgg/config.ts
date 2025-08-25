// BGG API Configuration
// Centralized configuration for all BGG API endpoints and settings

export const BGG_ENDPOINTS = {
  SEARCH: '/xmlapi2/search',
  THING: '/xmlapi2/thing',
  COLLECTION: '/xmlapi2/collection',
  USER: '/xmlapi2/user',
  HOT: '/xmlapi2/hot',
  TOP: '/xmlapi2/top'
} as const

export const BGG_GAME_TYPES = {
  BOARDGAME: 'boardgame',
  BOARDGAME_EXPANSION: 'boardgameexpansion',
  RPG: 'rpgitem',
  VIDEOGAME: 'videogame',
  BOARDGAME_ACCESSORY: 'boardgameaccessory'
} as const

export const BGG_SEARCH_PARAMS = {
  QUERY: 'query',
  TYPE: 'type',
  EXACT: 'exact'
} as const

export const BGG_THING_PARAMS = {
  ID: 'id',
  TYPE: 'type',
  STATS: 'stats',
  VERSIONS: 'versions',
  HISTORIC: 'historic',
  COMMENTS: 'comments',
  RATINGCOMMENTS: 'ratingcomments'
} as const

// Default API configuration with conservative rate limiting
export const DEFAULT_BGG_CONFIG = {
  baseUrl: 'https://boardgamegeek.com',
  userAgent: 'SecondTurnGames/2.0 (info@secondturn.games)',
  rateLimitDelay: 1000, // 1 second between requests (conservative)
  maxBatchSize: 15, // Reduced from 20 to avoid timeouts
  searchTimeout: 15000 // 15 second timeout for search requests
} as const

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  SEARCH_DELAY: 1200, // 1.2 seconds for search requests
  DETAILS_DELAY: 1000, // 1 second for details requests
  BATCH_DELAY: 1500, // 1.5 seconds for batch requests
  MAX_REQUESTS_PER_MINUTE: 50, // Conservative limit
  MAX_REQUESTS_PER_HOUR: 800
} as const

// Error messages for user-friendly error handling
export const BGG_ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'BGG API is busy. Please wait a moment and try again.',
  INVALID_GAME_ID: 'Invalid game ID provided.',
  GAME_NOT_FOUND: 'Game not found in BGG database.',
  API_UNAVAILABLE: 'BGG API is currently unavailable. Please try again later.',
  NETWORK_ERROR: 'Network connection issue. Please check your internet connection.',
  INVALID_RESPONSE: 'Received invalid data from BGG API.',
  PARSE_ERROR: 'Error processing BGG data. Please try again.',
  SEARCH_TIMEOUT: 'Search is taking longer than expected. Please try a more specific search term.'
} as const

// HTTP status codes for error handling
export const BGG_STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// Cache configuration
export const CACHE_CONFIG = {
  SEARCH_TTL: 30 * 60 * 1000, // 30 minutes for search results
  GAME_DETAILS_TTL: 24 * 60 * 60 * 1000, // 24 hours for game details
  METADATA_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days for metadata
  MAX_CACHE_SIZE: 1000, // Maximum cache entries
  CLEANUP_INTERVAL: 60 * 60 * 1000 // Cleanup every hour
} as const

// Search configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
  DEFAULT_RESULTS: 25,
  EXACT_MATCH_THRESHOLD: 4, // Use exact search for queries >= 4 chars
  FUZZY_FALLBACK: true, // Always fall back to fuzzy search
  TYPE_CORRECTION: true, // Enable inbound link analysis for type correction
  METADATA_BATCH_SIZE: 15 // Fetch metadata for top 15 results
} as const
