// BGG Service Index
// Main export file for all BGG service components

// Main service
export { BGGService, bggService } from './bgg-service'

// API client
export { BGGAPIClient } from './api-client'

// Cache manager
export { CacheManager } from './cache-manager'

// XML parser utilities
export { 
  parseXML, 
  extractSearchItems, 
  extractMetadata, 
  validateXML, 
  cleanXML 
} from './parsers/xml-parser'

// Configuration
export { 
  DEFAULT_BGG_CONFIG, 
  BGG_ENDPOINTS, 
  BGG_GAME_TYPES, 
  RATE_LIMIT_CONFIG,
  CACHE_CONFIG,
  SEARCH_CONFIG,
  BGG_ERROR_MESSAGES,
  BGG_STATUS_CODES
} from './config'

// Types
export type {
  BGGSearchResult,
  BGGGameDetails,
  BGGGameVersion,
  BGGAPISearchItem,
  BGGAPIMetadata,
  SearchFilters,
  BGGAPIConfig,
  SearchCacheEntry,
  CacheStats,
  BGGSearchError,
  LanguageMatchedVersion,
  AlternateName,
  LightweightSearchResult,
  EnhancedSearchResult
} from './types'
