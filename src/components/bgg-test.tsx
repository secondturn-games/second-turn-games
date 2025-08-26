"use client"

import { useState } from 'react'
import { bggService } from '@/lib/bgg'
import type { BGGSearchResult, BGGGameDetails, LanguageMatchedVersion } from '@/lib/bgg'
import { 
  Search, 
  Calendar, 
  Hash, 
  Trophy, 
  Star, 
  Users, 
  Clock, 
  Info,
  Gamepad2,
  Trash2,
  ExternalLink,
  Globe,
  Languages,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

export function BGGTest() {
  const [query, setQuery] = useState('')
  const [gameType, setGameType] = useState<'base-game' | 'expansion'>('base-game')
  const [results, setResults] = useState<BGGSearchResult[]>([])
  const [selectedGame, setSelectedGame] = useState<BGGGameDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cacheStats, setCacheStats] = useState<{
    size: number
    hitRate: number
    totalQueries: number
    cacheHits: number
  } | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<LanguageMatchedVersion | null>(null)
  const [versions, setVersions] = useState<LanguageMatchedVersion[]>([])
  const [showVersionSelection, setShowVersionSelection] = useState(false)

  const searchGames = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResults([])
    setSelectedGame(null)

    console.log('🔍 Starting search for:', query, 'with filters:', { gameType })

    try {
      const searchResults = await bggService.searchGames(query, { gameType })
      console.log('✅ Search results received:', searchResults)
      setResults(searchResults)
      
      // Update cache stats
      const stats = bggService.getCacheStats()
      console.log('📊 Cache stats:', stats)
      setCacheStats(stats)
    } catch (err) {
      console.error('❌ Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const getGameDetails = async (gameId: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`🔍 Getting game details for: ${gameId}`)
      const gameDetails = await bggService.getGameDetails(gameId)
      console.log(`✅ Game details received:`, gameDetails)
      setSelectedGame(gameDetails)
      
      // Also fetch versions for this game
      console.log(`🔍 Fetching versions for game: ${gameId}`)
      const gameVersions = await bggService.getLanguageMatchedVersions(gameId)
      console.log(`✅ Versions received:`, gameVersions)
      setVersions(gameVersions)
      setShowVersionSelection(true)
      setSelectedVersion(null) // Reset selected version
    } catch (err) {
      console.error(`❌ Error in getGameDetails:`, err)
      setError(err instanceof Error ? err.message : 'Failed to get game details')
    } finally {
      setLoading(false)
    }
  }

  const getVersions = async (gameId: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`🔍 Manually fetching versions for game: ${gameId}`)
      const gameVersions = await bggService.getLanguageMatchedVersions(gameId)
      console.log(`✅ Manual versions fetch result:`, gameVersions)
      setVersions(gameVersions)
      setShowVersionSelection(true)
    } catch (err) {
      console.error(`❌ Error in manual getVersions:`, err)
      setError(err instanceof Error ? err.message : 'Failed to get versions')
    } finally {
      setLoading(false)
    }
  }

  const clearCache = () => {
    bggService.clearCache()
    setCacheStats(bggService.getCacheStats())
    setResults([])
    setSelectedGame(null)
    setSelectedVersion(null)
    setVersions([])
    setShowVersionSelection(false)
  }



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-soft">
      <div className="mb-8">
        <h2 className="text-2xl font-righteous text-dark-green-800 mb-4">BGG Game Search</h2>
        
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-green-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter game name..."
              className="w-full pl-10 pr-4 py-3 border-2 border-dark-green-200 rounded-xl focus:border-dark-green-400 focus:outline-none transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && searchGames()}
            />
          </div>
          
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value as 'base-game' | 'expansion')}
            className="px-4 py-3 border-2 border-dark-green-200 rounded-xl focus:border-dark-green-400 focus:outline-none transition-colors"
          >
            <option value="base-game">Base Game</option>
            <option value="expansion">Expansion</option>
          </select>
          
          <button
            onClick={searchGames}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-vibrant-orange-500 text-white rounded-xl hover:bg-vibrant-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-righteous text-dark-green-800 mb-4 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Search Results ({results.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((game) => (
              <div
                key={game.id}
                className="bg-light-green-50 border-2 border-dark-green-200 rounded-xl p-4 hover:border-dark-green-300 hover:shadow-medium transition-all cursor-pointer group"
                onClick={() => getGameDetails(game.id)}
              >
                {/* Game Image - Responsive container for both square and rectangular images */}
                {game.image && (
                  <div className="mb-3 aspect-[4/3] rounded-lg overflow-hidden bg-dark-green-100">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        // Fallback to thumbnail if image fails
                        if (game.thumbnail) {
                          (e.target as HTMLImageElement).src = game.thumbnail
                        }
                      }}
                    />
                  </div>
                )}
                
                {/* Game Info */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-dark-green-800 line-clamp-2 flex-1 mr-2">
                    {game.name}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    game.type === 'boardgame' 
                      ? 'bg-dark-green-100 text-dark-green-700' 
                      : 'bg-vibrant-orange-100 text-vibrant-orange-700'
                  }`}>
                    {game.type === 'boardgame' ? 'Base Game' : 'Expansion'}
                  </span>
                </div>
                
                {/* Year and ID */}
                <div className="mb-3 space-y-1">
                  {game.yearpublished && (
                    <p className="text-sm text-dark-green-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {game.yearpublished}
                    </p>
                  )}
                  <p className="text-xs text-dark-green-500 flex items-center gap-2">
                    <Hash className="w-3 h-3" />
                    <a href={`https://boardgamegeek.com/boardgame/${game.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                      {game.id} <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
                
                {/* Rank and Rating */}
                <div className="flex items-center justify-between text-sm">
                  {game.rank && (
                    <span className="bg-vibrant-orange-100 text-vibrant-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      #{game.rank}
                    </span>
                  )}
                  {game.average && (
                    <span className="bg-dark-green-100 text-dark-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {parseFloat(game.average).toFixed(1)}
                    </span>
                  )}
                </div>
                
                {/* Rating note */}
                {game.average && (
                  <p className="text-xs text-dark-green-400 text-center mb-2">
                    Average Rating
                  </p>
                )}
                
                {/* Click hint */}
                <p className="text-xs text-dark-green-400 text-center mt-3 italic">
                  Click for full details
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Game Details */}
      {selectedGame && (
        <div className="mb-8">
          <h3 className="text-xl font-righteous text-dark-green-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Game Details
          </h3>
          <div className="bg-light-green-50 border-2 border-dark-green-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-2xl font-righteous text-dark-green-800">
                {selectedGame.name}
              </h4>
              <span className={`text-sm px-3 py-1 rounded-full ${
                selectedGame.type === 'boardgame' 
                  ? 'bg-dark-green-100 text-dark-green-700' 
                  : 'bg-vibrant-orange-100 text-vibrant-orange-700'
              }`}>
                {selectedGame.type === 'boardgame' ? 'Base Game' : 'Expansion'}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {selectedGame.yearpublished && (
                  <p className="text-dark-green-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Year:</span> {selectedGame.yearpublished}
                  </p>
                )}
                {selectedGame.rank && (
                  <p className="text-dark-green-600 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">Rank:</span> #{selectedGame.rank}
                  </p>
                )}
                {selectedGame.rating && (
                  <p className="text-dark-green-600 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">Average Rating:</span> {selectedGame.rating}
                  </p>
                )}
                {selectedGame.bayesaverage && (
                  <p className="text-dark-green-600 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span className="font-medium">Geek Rating:</span> {selectedGame.bayesaverage}
                    <span className="text-xs text-dark-green-500 ml-1" title="BGG's Bayesian average rating system that factors in the number of ratings">
                      ⓘ
                    </span>
                  </p>
                )}
                {selectedGame.weight && (
                  <p className="text-dark-green-600 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span className="font-medium">Weight:</span> {selectedGame.weight}
                  </p>
                )}
                {selectedGame.minplayers && selectedGame.maxplayers && (
                  <p className="text-dark-green-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Players:</span> {selectedGame.minplayers}-{selectedGame.maxplayers}
                  </p>
                )}
                {selectedGame.playingtime && (
                  <p className="text-dark-green-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Playing Time:</span> {selectedGame.playingtime} min
                  </p>
                )}
              </div>
              
              <div>
                {selectedGame.description && (
                  <div className="mb-4">
                    <h5 className="font-medium text-dark-green-800 mb-2">Description</h5>
                    <p className="text-dark-green-600 text-sm line-clamp-4">
                      {selectedGame.description}
                    </p>
                  </div>
                )}
                
                {selectedGame.mechanics && selectedGame.mechanics.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-dark-green-800 mb-2">Mechanics</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.mechanics.slice(0, 5).map((mechanic, index) => (
                        <span
                          key={index}
                          className="text-xs bg-vibrant-orange-100 text-vibrant-orange-700 px-2 py-1 rounded-full"
                        >
                          {mechanic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedGame.categories && selectedGame.categories.length > 0 && (
                  <div>
                    <h5 className="font-medium text-dark-green-800 mb-2">Categories</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.categories.slice(0, 5).map((category, index) => (
                        <span
                          key={index}
                          className="text-xs bg-dark-green-100 text-dark-green-700 px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Version Fetch Button */}
      {selectedGame && (
        <div className="mb-4">
          <button
            onClick={() => getVersions(selectedGame.id)}
            className="px-4 py-2 bg-dark-green-500 text-white rounded-lg hover:bg-dark-green-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Manually Fetch Versions
          </button>
          <p className="text-xs text-dark-green-500 mt-1">
            Use this button if versions don&apos;t appear automatically
          </p>
        </div>
      )}

      {/* Version Selection */}
      {showVersionSelection && versions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-righteous text-dark-green-800 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Select Version ({versions.length} available)
          </h3>
          
          {/* Raw Version Data for Debugging */}
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">🔍 Raw Version Data (Debug)</h4>
            <details className="text-sm text-yellow-700">
              <summary className="cursor-pointer hover:text-yellow-800">Click to expand raw data</summary>
              <pre className="mt-2 p-2 bg-white rounded border overflow-auto max-h-96 text-xs">
                {JSON.stringify(versions, null, 2)}
              </pre>
            </details>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {versions.map((versionMatch) => (
              <div
                key={versionMatch.version.id}
                className={`bg-light-green-50 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedVersion?.version.id === versionMatch.version.id
                    ? 'border-vibrant-orange-400 bg-vibrant-orange-50'
                    : 'border-dark-green-200 hover:border-dark-green-300 hover:shadow-medium'
                }`}
                onClick={() => setSelectedVersion(versionMatch)}
              >
                {/* Version Header */}
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-dark-green-800 text-sm">
                    {versionMatch.version.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    {versionMatch.languageMatch === 'exact' && (
                      <span title="Exact language match">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </span>
                    )}
                    {versionMatch.languageMatch === 'partial' && (
                      <span title="Partial language match">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      </span>
                    )}
                    {versionMatch.languageMatch === 'none' && (
                      <span title="No language match">
                        <Info className="w-4 h-4 text-gray-400" />
                      </span>
                    )}
                  </div>
                </div>

                                                   {/* Version Image */}
                  {versionMatch.version.thumbnail && (
                    <div className="mb-3 aspect-[4/3] rounded-lg overflow-hidden bg-dark-green-100">
                      <img
                        src={versionMatch.version.thumbnail}
                        alt={versionMatch.version.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Hide image on error
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                 
                                   {/* Language Info */}
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Languages className="w-3 h-3 text-dark-green-500" />
                      <span className="text-dark-green-600">
                        {versionMatch.version.isMultilingual ? 'Multilingual' : versionMatch.version.primaryLanguage}
                      </span>
                      {versionMatch.version.isMultilingual && (
                        <span className="text-xs text-dark-green-400">
                          ({versionMatch.version.languageCount} languages)
                        </span>
                      )}
                    </div>
                    
                    {versionMatch.version.yearpublished && (
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 text-dark-green-500" />
                        <span className="text-dark-green-600">{versionMatch.version.yearpublished}</span>
                      </div>
                    )}
                    
                                         {/* Dimensions */}
                     {versionMatch.version.dimensions?.hasDimensions && (
                       <div className="flex items-center gap-2 text-xs">
                         <div className="w-3 h-3 text-dark-green-500">📏</div>
                         <div className="text-dark-green-600">
                           <div className="font-medium">Dimensions:</div>
                           <div className="text-dark-green-500">
                             {versionMatch.version.dimensions.metric}
                           </div>
                         </div>
                       </div>
                     )}
                     
                     {/* Weight */}
                     {versionMatch.version.weightInfo?.rawValue && (
                       <div className="flex items-center gap-2 text-xs">
                         <div className="w-3 h-3 text-dark-green-500">⚖️</div>
                         <div className="text-dark-green-600">
                           <div className="font-medium">Weight:</div>
                           <div className="text-dark-green-500">
                             {versionMatch.version.weightInfo.metric}
                           </div>
                         </div>
                       </div>
                     )}
                  </div>

                {/* Smart Name Suggestion */}
                {versionMatch.suggestedAlternateName && (
                  <div className="mb-3 p-2 bg-dark-green-100 rounded-lg">
                    <p className="text-xs text-dark-green-700 font-medium mb-1">
                      Suggested Name:
                    </p>
                    <p className="text-sm text-dark-green-800">
                      {versionMatch.suggestedAlternateName}
                    </p>
                    <p className="text-xs text-dark-green-600 mt-1">
                      {versionMatch.reasoning}
                    </p>
                  </div>
                )}

                {/* Confidence Score */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-green-500">
                    Confidence: {(versionMatch.confidence * 100).toFixed(0)}%
                  </span>
                  {versionMatch.version.publishers.length > 0 && (
                    <span className="text-dark-green-600">
                      {versionMatch.version.publishers[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Version Summary */}
          {selectedVersion && (
            <div className="mt-6 p-4 bg-vibrant-orange-50 border-2 border-vibrant-orange-200 rounded-xl">
              <h4 className="font-medium text-vibrant-orange-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Selected Version
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                                 <div>
                   <p className="text-sm text-vibrant-orange-700">
                     <span className="font-medium">Version:</span> {selectedVersion.version.name}
                   </p>
                   <p className="text-sm text-vibrant-orange-700">
                     <span className="font-medium">Language:</span> {selectedVersion.version.isMultilingual ? 'Multilingual' : selectedVersion.version.primaryLanguage}
                   </p>
                   <p className="text-sm text-vibrant-orange-700">
                     <span className="font-medium">Year:</span> {selectedVersion.version.yearpublished}
                   </p>
                   {selectedVersion.version.dimensions?.hasDimensions && (
                     <p className="text-sm text-vibrant-orange-700">
                       <span className="font-medium">Dimensions:</span> {selectedVersion.version.dimensions.metric}
                     </p>
                   )}
                   {selectedVersion.version.weightInfo?.rawValue && (
                     <p className="text-sm text-vibrant-orange-700">
                       <span className="font-medium">Weight:</span> {selectedVersion.version.weightInfo.metric}
                     </p>
                   )}
                 </div>
                <div>
                  {selectedVersion.suggestedAlternateName && (
                    <p className="text-sm text-vibrant-orange-700">
                      <span className="font-medium">Suggested Name:</span> {selectedVersion.suggestedAlternateName}
                    </p>
                  )}
                  <p className="text-sm text-vibrant-orange-700">
                    <span className="font-medium">Match Quality:</span> {selectedVersion.languageMatch}
                  </p>
                  <p className="text-sm text-vibrant-orange-700">
                    <span className="font-medium">Confidence:</span> {(selectedVersion.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      

       {/* Cache Statistics */}
       {cacheStats && (
        <div className="mb-8">
          <h3 className="text-xl font-righteous text-dark-green-800 mb-4">Cache Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-light-green-50 border-2 border-dark-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-dark-green-800">{cacheStats.size}</p>
              <p className="text-sm text-dark-green-600">Cache Size</p>
            </div>
            <div className="bg-light-green-50 border-2 border-dark-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-dark-green-800">{(cacheStats.hitRate * 100).toFixed(1)}%</p>
              <p className="text-sm text-dark-green-600">Hit Rate</p>
            </div>
            <div className="bg-light-green-50 border-2 border-dark-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-dark-green-800">{cacheStats.totalQueries}</p>
              <p className="text-sm text-dark-green-600">Total Queries</p>
            </div>
            <div className="bg-light-green-50 border-2 border-dark-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-dark-green-800">{cacheStats.cacheHits}</p>
              <p className="text-sm text-dark-green-600">Cache Hits</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-2 mx-auto"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  )
}
