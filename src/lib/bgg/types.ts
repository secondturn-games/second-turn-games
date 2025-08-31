// BGG Service Types
// Core interfaces for BoardGameGeek API integration

export interface BGGSearchResult {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  bayesaverage?: string
  average?: string
  type: 'boardgame' | 'boardgameexpansion'
  thumbnail?: string
  image?: string
  bggLink: string
  // Enhanced fields for better filtering
  isExpansion: boolean
  hasInboundExpansionLink: boolean
  searchScore: number
}

export interface BGGGameDetails {
  id: string
  name: string
  yearpublished: string
  minplayers: string
  maxplayers: string
  playingtime: string
  minage: string
  description: string
  thumbnail: string
  image: string
  rating: string
  bayesaverage?: string
  weight: string
  rank: string
  mechanics: string[]
  categories: string[]
  designers: string[]
  alternateNames: string[]
  versions: BGGGameVersion[]
  type: 'boardgame' | 'boardgameexpansion'
  // Critical for accurate classification
  isExpansion: boolean
  hasInboundExpansionLink: boolean
}

export interface BGGGameVersion {
  id: string
  name: string
  yearpublished: string
  publishers: string[]
  languages: string[]
  productcode: string
  thumbnail: string
  image: string
  width: string
  length: string
  depth: string
  weight: string
  // Enhanced language information
  primaryLanguage?: string
  isMultilingual: boolean
  languageCount: number
  // Enhanced dimension information
  dimensions?: {
    metric: string
    hasDimensions: boolean
  }
  weightInfo?: {
    metric: string
    rawValue: number | null
  }
}

export interface LanguageMatchedVersion {
  version: BGGGameVersion
  suggestedAlternateName?: string
  languageMatch: 'exact' | 'partial' | 'none'
  confidence: number
  reasoning: string
}

export interface AlternateName {
  name: string
  language?: string
  type?: 'primary' | 'alternate' | 'translation'
  confidence: number
}

export interface BGGAPISearchItem {
  id: string
  name: string
  type: string
  yearpublished?: string
}

export interface BGGAPIMetadata {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  bayesaverage?: string
  average?: string
  thumbnail?: string
  image?: string
  alternateNames?: string[]
  type: string
  minplayers?: string
  maxplayers?: string
  playingtime?: string
  minage?: string
  description?: string
  weight?: string
  mechanics?: string[]
  categories?: string[]
  designers?: string[]
  versions?: BGGGameVersion[]
  // Critical fields for type classification
  hasInboundExpansionLink: boolean
  inboundExpansionLinks: Array<{
    id: string
    type: string
    value: string
  }>
}

export interface SearchFilters {
  gameType?: 'base-game' | 'expansion'
  minPlayers?: number
  maxPlayers?: number
  minRating?: number
  maxRating?: number
  mechanics?: string[]
  categories?: string[]
}

export interface BGGAPIConfig {
  baseUrl: string
  userAgent: string
  rateLimitDelay: number
  maxBatchSize: number
  searchTimeout: number
}

export interface SearchCacheEntry {
  query: string
  filters: SearchFilters
  results: BGGSearchResult[]
  timestamp: number
  ttl: number
}

export interface CacheStats {
  size: number
  hitRate: number
  totalQueries: number
  cacheHits: number
}

export interface BGGSearchError {
  code: 'RATE_LIMIT' | 'API_UNAVAILABLE' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'INVALID_RESPONSE'
  message: string
  retryAfter?: number
  fallbackData?: BGGSearchResult[]
}
