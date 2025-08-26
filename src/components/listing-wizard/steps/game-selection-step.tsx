"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, Users, Clock, Cake, Package, Type, Languages, Building2, Ruler, Weight, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { bggService } from '@/lib/bgg'
import type { BGGSearchResult, BGGGameDetails, LanguageMatchedVersion } from '@/lib/bgg'
import type { ListingFormData } from '../listing-wizard'

interface GameSelectionStepProps {
  formData: ListingFormData
  updateFormData: (updates: Partial<ListingFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function GameSelectionStep({ updateFormData, onNext, onBack }: GameSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [gameType, setGameType] = useState<'base-game' | 'expansion'>('base-game')
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [selectedGame, setSelectedGame] = useState<BGGGameDetails | null>(null)
  const [versions, setVersions] = useState<LanguageMatchedVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<LanguageMatchedVersion | null>(null)
  const [selectedTitleVariant, setSelectedTitleVariant] = useState<string>('main-title')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchError('Please enter at least 2 characters to search')
      return
    }

    setIsSearching(true)
    setSearchError('')
    setHasSearched(true)
    setSearchResults([])
    setSelectedGame(null)
    setVersions([])
    setSelectedVersion(null)

    try {
      const searchResults = await bggService.searchGames(searchTerm, { gameType })
      setSearchResults(searchResults)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleGameSelect = async (game: BGGSearchResult) => {
    try {
      // Get full game details and versions
      const gameDetails = await bggService.getGameDetails(game.id)
      const gameVersions = await bggService.getLanguageMatchedVersions(game.id)
      
      setSelectedGame(gameDetails)
      setVersions(gameVersions)
      
      // Auto-select the first version if available
      if (gameVersions.length > 0) {
        const firstVersion = gameVersions[0]
        setSelectedVersion(firstVersion)
        setSelectedTitleVariant(firstVersion.suggestedAlternateName || 'main-title')
        
        // Update form data
        updateFormData({
          bggGameId: game.id,
          bggVersionId: firstVersion.version.id,
          gameName: game.name,
          versionName: firstVersion.version.name,
          suggestedAlternateName: firstVersion.suggestedAlternateName,
        })
      } else {
        // No versions available, use main game
        updateFormData({
          bggGameId: game.id,
          bggVersionId: null,
          gameName: game.name,
          versionName: null,
          suggestedAlternateName: null,
        })
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to get game details')
    }
  }

  const handleVersionSelect = (version: LanguageMatchedVersion) => {
    setSelectedVersion(version)
    setSelectedTitleVariant(version.suggestedAlternateName || 'main-title')
    
    updateFormData({
      bggVersionId: version.version.id,
      versionName: version.version.name,
      suggestedAlternateName: version.suggestedAlternateName,
    })
  }

  const handleTitleVariantSelect = (title: string) => {
    setSelectedTitleVariant(title)
    
    if (title === 'main-title') {
      updateFormData({ customTitle: null })
    } else {
      updateFormData({ customTitle: title })
    }
  }

  const canContinue = !!selectedGame && !!selectedVersion

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dark-green text-lg lg:text-xl">Find Your Game</CardTitle>
        <p className="text-sm text-gray-600">Choose whether you&apos;re looking for a Base Game or an Expansion, and we&apos;ll pull in the official details from BGG</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Type Switch */}
        <div className="space-y-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setGameType('base-game')
                setSearchResults([])
                setSearchError('')
                if (hasSearched) performSearch()
              }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                gameType === 'base-game'
                  ? 'bg-vibrant-orange text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Base Game
            </button>
            <button
              onClick={() => {
                setGameType('expansion')
                setSearchResults([])
                setSearchError('')
                if (hasSearched) performSearch()
              }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                gameType === 'expansion'
                  ? 'bg-vibrant-orange text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Expansion
            </button>
          </div>

          {/* Search Input */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Type in the name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                className="pl-10 border-gray-300 focus:border-vibrant-orange"
              />
            </div>
            <Button
              onClick={performSearch}
              disabled={!searchTerm.trim() || searchTerm.trim().length < 2 || isSearching}
              className="bg-vibrant-orange hover:bg-vibrant-orange/90"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{searchError}</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.map((game) => (
              <Card
                key={game.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange"
                onClick={() => handleGameSelect(game)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    {game.thumbnail && (
                      <img 
                        src={game.thumbnail} 
                        alt={game.name}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight mb-1">{game.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        {game.yearpublished && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {game.yearpublished}
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
            ))}
          </div>
        )}

        {/* Selected Game Display */}
        {selectedGame && (
          <div className="bg-light-beige/50 rounded-lg p-4 border border-warm-yellow/20">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={selectedVersion?.version.thumbnail || selectedGame.thumbnail || "/placeholder-game.jpg"}
                  alt={selectedGame.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-green text-lg mb-2">
                  {selectedGame.name}
                </h3>
                
                {/* Basic Stats */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {selectedGame.yearpublished && (
                    <div className="flex items-center gap-1 text-xs text-dark-green">
                      <Calendar className="w-3 h-3" />
                      <span>{selectedGame.yearpublished}</span>
                    </div>
                  )}
                  {selectedGame.minplayers && selectedGame.maxplayers && (
                    <div className="flex items-center gap-1 text-xs text-dark-green">
                      <Users className="w-3 h-3" />
                      <span>{selectedGame.minplayers}-{selectedGame.maxplayers}</span>
                    </div>
                  )}
                  {selectedGame.playingtime && (
                    <div className="flex items-center gap-1 text-xs text-dark-green">
                      <Clock className="w-3 h-3" />
                      <span>~{selectedGame.playingtime} min</span>
                    </div>
                  )}
                  {selectedGame.minage && selectedGame.minage !== '0' && (
                    <div className="flex items-center gap-1 text-xs text-dark-green">
                      <Cake className="w-3 h-3" />
                      <span>{selectedGame.minage}+</span>
                    </div>
                  )}
                  <Badge className="bg-dark-green text-white text-xs">
                    {gameType === 'base-game' ? 'Base Game' : 'Expansion'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Version Selection */}
        {selectedGame && versions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-dark-green">Select Version</h4>
            <Select
              value={selectedVersion?.version.id || ''}
              onValueChange={(value) => {
                const version = versions.find(v => v.version.id === value)
                if (version) {
                  handleVersionSelect(version)
                }
              }}
            >
              <SelectTrigger className="border-gray-300 focus:border-vibrant-orange">
                <SelectValue placeholder="Select a specific version/edition" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {versions.map((version) => (
                  <SelectItem key={version.version.id} value={version.version.id}>
                    <div className="flex items-center space-x-3 py-1">
                      <div className="w-8 h-8 overflow-hidden rounded">
                        {version.version.thumbnail ? (
                          <img
                            src={version.version.thumbnail}
                            alt={version.version.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-light-beige rounded flex items-center justify-center">
                            <Package className="w-4 h-4 text-dark-green" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-sm truncate">
                          {version.version.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {version.version.yearpublished && `(${version.version.yearpublished})`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {version.languageMatch === 'exact' && (
                          <span title="Exact language match">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </span>
                        )}
                        {version.languageMatch === 'partial' && (
                          <span title="Partial language match">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          </span>
                        )}
                        {version.languageMatch === 'none' && (
                          <span title="No language match">
                            <Info className="w-4 h-4 text-gray-400" />
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Version Details */}
            {selectedVersion && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedVersion.version.languages && selectedVersion.version.languages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-dark-green" />
                      <span className="font-medium">Languages:</span>
                      <span>{selectedVersion.version.languages.join(', ')}</span>
                    </div>
                  )}
                  {selectedVersion.version.publishers && selectedVersion.version.publishers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-dark-green" />
                      <span className="font-medium">Publishers:</span>
                      <span>{selectedVersion.version.publishers.join(', ')}</span>
                    </div>
                  )}
                  {selectedVersion.version.dimensions?.hasDimensions && (
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-dark-green" />
                      <span className="font-medium">Dimensions:</span>
                      <span>{selectedVersion.version.dimensions.metric}</span>
                    </div>
                  )}
                  {selectedVersion.version.weightInfo?.rawValue && (
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-dark-green" />
                      <span className="font-medium">Weight:</span>
                      <span>{selectedVersion.version.weightInfo.metric}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Title Selection */}
        {selectedGame && (
          <div className="space-y-2">
            <h4 className="font-medium text-dark-green">Choose Title</h4>
            <Select
              value={selectedTitleVariant}
              onValueChange={handleTitleVariantSelect}
            >
              <SelectTrigger className="border-gray-300 focus:border-vibrant-orange">
                <SelectValue placeholder="Choose title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main-title">
                  <div className="flex items-center space-x-3 py-1">
                    <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center">
                      <Type className="w-4 h-4 text-dark-green" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{selectedGame.name}</div>
                      <div className="text-xs text-gray-500">Primary title</div>
                    </div>
                  </div>
                </SelectItem>
                {selectedVersion?.suggestedAlternateName && (
                  <SelectItem value={selectedVersion.suggestedAlternateName}>
                    <div className="flex items-center space-x-3 py-1">
                      <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center">
                        <Type className="w-4 h-4 text-dark-green" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{selectedVersion.suggestedAlternateName}</div>
                        <div className="text-xs text-gray-500">Suggested match</div>
                      </div>
                    </div>
                  </SelectItem>
                )}
                {selectedGame.alternateNames?.map((altName, index) => (
                  <SelectItem key={index} value={altName}>
                    <div className="flex items-center space-x-3 py-1">
                      <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center">
                        <Type className="w-4 h-4 text-dark-green" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{altName}</div>
                        <div className="text-xs text-gray-500">Alternative title</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back
          </Button>
          <Button 
            onClick={onNext}
            disabled={!canContinue}
            className="bg-vibrant-orange hover:bg-vibrant-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
