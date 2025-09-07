"use client"

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { bggServiceClient } from '@/lib/bgg/bgg-service-client'
import type { BGGSearchResult, LightweightSearchResult, EnhancedSearchResult } from '@/lib/bgg'
import { GAME_TYPES } from './config'

interface GameSearchProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  gameType: 'base-game' | 'expansion'
  setGameType: (type: 'base-game' | 'expansion') => void
  onGameSelect: (game: LightweightSearchResult | EnhancedSearchResult) => void
  onSearchResults: (results: BGGSearchResult[]) => void
  onSearchError: (error: string) => void
  onSearching: (searching: boolean) => void
  onReset: () => void
  searchResults: BGGSearchResult[]
  isSearching: boolean
  searchError: string
}

export function GameSearch({
  searchTerm,
  setSearchTerm,
  gameType,
  setGameType,
  onGameSelect,
  onSearchResults,
  onSearchError,
  onSearching,
  onReset,
  searchResults,
  isSearching,
  searchError
}: GameSearchProps) {
  const [showGameTypeToggle, setShowGameTypeToggle] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      onSearchError('Please enter at least 2 characters to search')
      return
    }

    onSearching(true)
    onSearchError('')
    onSearchResults([])
    setHasSearched(true)

    try {
      // Use exact matching for short search terms (likely specific game names)
      const useExact = searchTerm.length <= 10 && !searchTerm.includes(' ')
      const lightResults = await bggServiceClient.searchGames(searchTerm, { 
        gameType, 
        exact: useExact 
      })
      onSearchResults(lightResults)
    } catch (err) {
      onSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      onSearching(false)
    }
  }

  const performSearchWithGameType = async (newGameType: 'base-game' | 'expansion') => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) return

    onSearching(true)
    onSearchError('')
    onSearchResults([])

    try {
      const searchResults = await bggServiceClient.searchGames(searchTerm, { gameType: newGameType })
      onSearchResults(searchResults)
    } catch (err) {
      onSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      onSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch()
    }
  }

  return (
    <div className="space-y-4">
      {/* Game Type Toggle - Hidden by default, expandable */}
      <div className="space-y-2">
        <button
          onClick={() => setShowGameTypeToggle(!showGameTypeToggle)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          aria-expanded={showGameTypeToggle}
          aria-label={showGameTypeToggle ? "Hide game type options" : "Show game type options"}
        >
          {showGameTypeToggle ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide game type options
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show game type options
            </>
          )}
        </button>
        
        {showGameTypeToggle && (
          <div className="flex gap-2">
            {GAME_TYPES.map((type) => (
              <Button
                key={type.id}
                variant={gameType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setGameType(type.id as 'base-game' | 'expansion')
                  onSearchResults([])
                  onSearchError('')
                  onReset()
                  // Reset Game Condition data when switching game type
                  if (searchTerm.trim() && searchTerm.trim().length >= 2) {
                    performSearchWithGameType(type.id as 'base-game' | 'expansion')
                  }
                }}
                className="text-xs h-8 px-3"
              >
                {type.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search for a game..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            aria-label="Search for a game"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                onSearchResults([])
                onSearchError('')
                setHasSearched(false)
                onReset()
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-green-400 hover:text-dark-green-600 transition-colors"
              type="button"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Button */}
      <Button
        onClick={performSearch}
        disabled={!searchTerm.trim() || searchTerm.trim().length < 2 || isSearching}
        className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white"
      >
        {isSearching ? 'Searching...' : 'Search Games'}
      </Button>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.map((game) => {
              return (
                <Card
                  key={game.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange border border-gray-200 hover:border-vibrant-orange"
                  onClick={() => onGameSelect(game)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      {game.thumbnail ? (
                        <img 
                          src={game.thumbnail} 
                          alt={game.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                       ) : (
                        <div className="w-14 h-14 bg-light-beige rounded-lg flex items-center justify-center flex-shrink-0">
                          <Search className="w-6 h-6 text-dark-green" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight mb-1 text-dark-green">
                          {game.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          {game.yearpublished && (
                            <span className="flex items-center gap-1">
                              <span>{game.yearpublished}</span>
                            </span>
                          )}
                          {game.rank && (
                            <span className="flex items-center gap-1">
                              <span>#{game.rank}</span>
                            </span>
                          )}
                          <a
                            href={`https://boardgamegeek.com/boardgame/${game.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-vibrant-orange hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            BGG ID: {game.id}
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Search Error */}
      {searchError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {searchError}
        </div>
      )}

      {/* Empty State - No Search Results */}
      {hasSearched && !isSearching && searchResults.length === 0 && !searchError && (
        <div className="bg-teal/10 border border-teal/200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-teal/20 rounded-md flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-dark-green-600 mb-1">
                Hmm, we couldn&apos;t find that
              </h3>
              <p className="text-xs text-dark-green-500">
                Double-check the full name or spelling. If it&apos;s still missing, drop us a line: 
                <a 
                  href="mailto:info@secondturn.games" 
                  className="text-vibrant-orange hover:underline ml-1"
                >
                  info@secondturn.games
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
