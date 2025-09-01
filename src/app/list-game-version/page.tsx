"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Calendar, Package, Type, Languages, Building2, HelpCircle, Users, Clock, Cake, ChevronDown, ChevronUp, Box, PackageOpen, Star, Repeat, XCircle, CheckCircle, AlertTriangle, ThumbsUp, ExternalLink, Cog } from 'lucide-react'
import Image from 'next/image'
import { bggServiceClient } from '@/lib/bgg/bgg-service-client'
import type { BGGSearchResult, BGGGameDetails, LanguageMatchedVersion } from '@/lib/bgg'

interface ListingFormData {
  bggGameId: string | null
  gameName: string | null
  gameImage: string | null
  bggVersionId: string | null
  versionName: string | null
  suggestedAlternateName: string | null
  versionImage: string | null
  customTitle: string | null
  gameDetails: {
    minPlayers: string
    maxPlayers: string
    playingTime: string
    minAge: string
    yearPublished: string
    languages: string[]
    publishers: string[]
    designers: string[]
    rank: string
    rating: string
  } | null
  gameCondition: {
    overallCondition: string | null
    completeness: string | null
    missingDescription: string | null
    extras: string[]
    customExtras: string | null
    photos: string[]
  } | null
}

export default function ListGameVersionPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [gameType, setGameType] = useState<'base-game' | 'expansion'>('base-game')
  const [showGameTypeToggle, setShowGameTypeToggle] = useState(false)
  
  
  
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [selectedGame, setSelectedGame] = useState<BGGGameDetails | null>(null)
  const [versions, setVersions] = useState<LanguageMatchedVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<LanguageMatchedVersion | null>(null)
  const [selectedTitleVariant, setSelectedTitleVariant] = useState<string>('main-title')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(true)
    const [showVersions, setShowVersions] = useState(false)
         const [showTitleSelection, setShowTitleSelection] = useState(false)
       const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [showGameCondition, setShowGameCondition] = useState(false)

  const [formData, setFormData] = useState<ListingFormData>({
    bggGameId: null,
    gameName: null,
    gameImage: null,
    bggVersionId: null,
    versionName: null,
    suggestedAlternateName: null,
    versionImage: null,
    customTitle: null,
    gameDetails: null,
    gameCondition: null
  })

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const performSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchError('Please enter at least 2 characters to search')
      return
    }

    // Add mobile detection and enhanced logging
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log('🔍 Search initiated:', { 
      searchTerm, 
      gameType, 
      isMobile, 
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })

    // Reset Game Condition data when starting a new search
    if (formData.gameCondition) {
      resetGameCondition()
    }

    setIsSearching(true)
    setSearchError('')
    setSearchResults([])
    setSelectedGame(null)
    setVersions([])
    setSelectedVersion(null)
    setHasSearched(true)

    try {
      console.log('🔍 Calling BGG service...')
      const searchResults = await bggServiceClient.searchGames(searchTerm, { gameType })
      console.log('✅ BGG service returned:', { 
        resultsCount: searchResults.length, 
        results: searchResults,
        isMobile 
      })
      setSearchResults(searchResults)
      
      // If only one result, auto-select it
      if (searchResults.length === 1) {
        await handleGameSelect(searchResults[0])
      }
    } catch (err) {
      console.error('❌ Search error:', { 
        error: err, 
        message: err instanceof Error ? err.message : 'Unknown error',
        isMobile,
        searchTerm,
        gameType
      })
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const resetGameCondition = () => {
    updateFormData({
      gameCondition: null
    })
    setShowGameCondition(false)
  }

  const handleGameSelect = async (game: BGGSearchResult) => {
    try {
      // Reset Game Condition data for new game
      resetGameCondition()
      
      // Get full game details and versions
          const gameDetails = await bggServiceClient.getGameDetails(game.id)
    const gameVersions = await bggServiceClient.getLanguageMatchedVersions(game.id)
      
      setSelectedGame(gameDetails)
      setVersions(gameVersions)
      
      // Auto-select the best version based on priority
      const bestVersion = selectBestVersion(gameVersions)
      if (bestVersion) {
        setSelectedVersion(bestVersion)
        setSelectedTitleVariant(game.name) // Always use primary title
        
        // Update form data with auto-selected version and title
        updateFormData({
          bggVersionId: bestVersion.version.id,
          versionName: bestVersion.version.name,
          suggestedAlternateName: bestVersion.suggestedAlternateName,
          versionImage: bestVersion.version.image || bestVersion.version.thumbnail || null,
          customTitle: null, // Always use primary title
          gameDetails: {
            minPlayers: gameDetails?.minplayers || '',
            maxPlayers: gameDetails?.maxplayers || '',
            playingTime: gameDetails?.playingtime || '',
            minAge: gameDetails?.minage || '',
            yearPublished: bestVersion.version.yearpublished || gameDetails?.yearpublished || '',
            languages: bestVersion.version.languages || [],
            publishers: bestVersion.version.publishers || [],
            designers: gameDetails?.designers || [],
            rank: gameDetails?.rank || '',
            rating: gameDetails?.rating || ''
          }
        })
        
        // Collapse search results and show preview
        setShowSearchResults(false)
             } else {
         // Fallback: no version selected
         setSelectedVersion(null)
         setSelectedTitleVariant(game.name)
         
         // Don't automatically show versions - user can click "Change Version" if needed
         setShowVersions(false)
       }
      
      // Update form data with game info
      updateFormData({
        bggGameId: game.id,
        gameName: game.name,
        gameImage: gameDetails?.image || gameDetails?.thumbnail || null,
      })
      
      // Reset language filter for new game
      setSelectedLanguage('all')
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to get game details')
    }
  }

           const handleVersionSelect = (version: LanguageMatchedVersion) => {
      setSelectedVersion(version)
      
      // Check if version has English language
      const hasEnglish = version.version.languages?.some(lang => 
        lang.toLowerCase() === 'english'
      )
      
      let selectedTitle = selectedGame?.name || ''
      let customTitle = null
      let shouldShowTitleSelection = false
      
      if (hasEnglish) {
        // Scenario A: English version - keep primary title, no title selection needed
        selectedTitle = selectedGame?.name || ''
        customTitle = null
        shouldShowTitleSelection = false
      } else {
        // Non-English version - need title selection
        if (version.suggestedAlternateName && version.suggestedAlternateName !== selectedGame?.name) {
          // Scenario B: Has suggested title - show it as default but allow other options
          selectedTitle = version.suggestedAlternateName
          customTitle = version.suggestedAlternateName
          shouldShowTitleSelection = true
        } else {
          // Scenario C: No suggested title - show all alternate names
          selectedTitle = selectedGame?.name || ''
          customTitle = null
          shouldShowTitleSelection = true
        }
      }
      
      setSelectedTitleVariant(selectedTitle)
      
      // Update form data with version and selected title
      updateFormData({
        bggVersionId: version.version.id,
        versionName: version.version.name,
        suggestedAlternateName: version.suggestedAlternateName,
        versionImage: version.version.image || version.version.thumbnail || null,
        customTitle: customTitle,
        gameDetails: {
          minPlayers: selectedGame?.minplayers || '',
          maxPlayers: selectedGame?.maxplayers || '',
          playingTime: selectedGame?.playingtime || '',
          minAge: selectedGame?.minage || '',
          yearPublished: version.version.yearpublished || selectedGame?.yearpublished || '',
          languages: version.version.languages || [],
          publishers: version.version.publishers || [],
          designers: selectedGame?.designers || [],
          rank: selectedGame?.rank || '',
          rating: selectedGame?.rating || ''
        }
      })
      
      // Collapse version section after selection
      setShowVersions(false)
      
      // Show title selection only when needed
      if (shouldShowTitleSelection) {
        setShowTitleSelection(true)
      }
    }

     const handleTitleVariantSelect = (title: string) => {
     setSelectedTitleVariant(title)
     
     if (title === selectedGame?.name) {
       updateFormData({ customTitle: null })
     } else {
       updateFormData({ customTitle: title })
     }
     
     // Collapse title selection after selection
     setShowTitleSelection(false)
     

   }

  // Helper function to select the best version based on priority
  const selectBestVersion = (versions: LanguageMatchedVersion[]): LanguageMatchedVersion | null => {
    if (versions.length === 0) return null
    
    // Priority 1: If only one version, select it
    if (versions.length === 1) return versions[0]
    
    // Priority 2: Find English versions, select most recent by year
    const englishVersions = versions.filter(version => 
      version.version.languages?.some(lang => 
        lang.toLowerCase() === 'english'
      )
    )
    
    if (englishVersions.length > 0) {
      // Sort by year (most recent first) and return the first
      return englishVersions.sort((a, b) => {
        const yearA = parseInt(a.version.yearpublished || '0')
        const yearB = parseInt(b.version.yearpublished || '0')
        return yearB - yearA // Descending order (newest first)
      })[0]
    }
    
    // Priority 3: If no English version, return first available
    return versions[0]
  }

     // Function to get all available title options
   const getTitleOptions = () => {
     if (!selectedGame) return []
     
     const uniqueTitles = new Set<string>()
     const titleOptions: Array<{ title: string; isSuggested: boolean }> = []
     
     // Add primary title first
     uniqueTitles.add(selectedGame.name)
     titleOptions.push({ title: selectedGame.name, isSuggested: false })
     
     // Add suggested match if available (even if same as primary, so user can see it)
     if (selectedVersion?.suggestedAlternateName && !uniqueTitles.has(selectedVersion.suggestedAlternateName)) {
       uniqueTitles.add(selectedVersion.suggestedAlternateName)
       titleOptions.push({ title: selectedVersion.suggestedAlternateName, isSuggested: true })
     }
     
     // Add alternative names, avoiding duplicates
     if (selectedGame.alternateNames && selectedGame.alternateNames.length > 0) {
       selectedGame.alternateNames.forEach(altName => {
         if (!uniqueTitles.has(altName)) {
           uniqueTitles.add(altName)
           titleOptions.push({ title: altName, isSuggested: false })
         }
       })
     }
     
     return titleOptions
   }

  // Filter and sort versions
  const filteredAndSortedVersions = versions
    .filter(version => {
      if (selectedLanguage === 'all') return true
      return version.version.languages?.some(lang => 
        lang.toLowerCase() === selectedLanguage.toLowerCase()
      )
    })
    .sort((a, b) => a.version.name.localeCompare(b.version.name))

  const performSearchWithGameType = async (newGameType: 'base-game' | 'expansion') => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchError('Please enter at least 2 characters to search')
      return
    }

    // Reset Game Condition data when starting a new search with different game type
    if (formData.gameCondition) {
      resetGameCondition()
    }

    setIsSearching(true)
    setSearchError('')
    setSearchResults([])
    setSelectedGame(null)
    setVersions([])
    setSelectedVersion(null)
    setShowSearchResults(true)
    setShowVersions(false)
    setShowTitleSelection(false)

    try {
      const searchResults = await bggServiceClient.searchGames(searchTerm, { gameType: newGameType })
      setSearchResults(searchResults)
      
      // If only one result, auto-select it
      if (searchResults.length === 1) {
        await handleGameSelect(searchResults[0])
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-dark-green text-xl lg:text-2xl font-display">Sell a Game</CardTitle>
          <p className="text-sm text-gray-600">Give your game a second turn</p>
        </CardHeader>
                 <CardContent className="space-y-6">
           {/* Search Section - Only show when no game is selected */}
           {!selectedGame && (
             <>
               {/* Game Type Toggle - Hidden by default, expandable */}
               <div className="space-y-2">
                 <button
                   onClick={() => setShowGameTypeToggle(!showGameTypeToggle)}
                   className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                 >
                   {showGameTypeToggle ? (
                     <>
                       <ChevronUp className="w-4 h-4" />
                       Hide game type options
                     </>
                   ) : (
                     <>
                       <ChevronDown className="w-4 h-4" />
                       {gameType === 'base-game' ? 'Base Game' : 'Expansion'} • Click to pick {gameType === 'base-game' ? 'Expansion' : 'Base Game'} instead
                     </>
                   )}
                 </button>
                 
                 {showGameTypeToggle && (
                   <div className="flex items-center bg-gray-100 rounded-lg p-1">
                     <button
                       onClick={() => {
                         setGameType('base-game')
                         setSearchResults([])
                         setSearchError('')
                         setSelectedVersion(null)
                         setShowVersions(false)
                         setShowTitleSelection(false)
                         // Reset Game Condition data when switching game type
                         resetGameCondition()
                         if (searchTerm.trim() && searchTerm.trim().length >= 2) {
                           performSearchWithGameType('base-game')
                         }
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
                         setSelectedVersion(null)
                         setShowVersions(false)
                         setShowTitleSelection(false)
                         // Reset Game Condition data when switching game type
                         resetGameCondition()
                         if (searchTerm.trim() && searchTerm.trim().length >= 2) {
                           performSearchWithGameType('expansion')
                         }
                       }}
                       className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                         gameType === 'base-game'
                           ? 'text-gray-600 hover:text-gray-800'
                           : 'bg-vibrant-orange text-white shadow-sm'
                       }`}
                     >
                       Expansion
                     </button>
                   </div>
                 )}
               </div>

                               {/* Search Bar */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-green-400 w-4 h-4" />
                                         <input
                       type="text"
                       placeholder="Search by game title…"
                       value={searchTerm}
                       onChange={(e) => {
                         const newSearchTerm = e.target.value
                         setSearchTerm(newSearchTerm)
                         
                         // Reset Game Condition data when search term changes significantly
                         if (newSearchTerm.length < 2 && formData.gameCondition) {
                           resetGameCondition()
                         }
                       }}
                       onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                       className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-light-beige-200 bg-white text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 shadow-sm text-sm"
                     />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setSearchResults([])
                          setSelectedGame(null)
                          setVersions([])
                          setSelectedVersion(null)
                          setSearchError('')
                          setHasSearched(false)
                          setShowSearchResults(true)
                          setShowVersions(false)
                          setShowTitleSelection(false)
                          // Reset Game Condition data when clearing search
                          resetGameCondition()
                         }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-green-400 hover:text-dark-green-600 transition-colors"
                        type="button"
                        title="Clear search"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={performSearch}
                    onTouchEnd={performSearch}
                    disabled={!searchTerm.trim() || searchTerm.trim().length < 2 || isSearching}
                    className="bg-vibrant-orange hover:bg-vibrant-orange/90 w-full sm:w-auto touch-manipulation"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

               {/* Search Error */}
               {searchError && (
                 <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                   <p className="text-sm text-red-700">{searchError}</p>
                 </div>
               )}

                                               {/* Search Results */}
                {searchResults.length > 0 && showSearchResults && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {searchResults.map((game) => {
                      // Type assertion to help TypeScript
                      const gameItem = game as BGGSearchResult
                      return (
                        <Card
                          key={gameItem.id}
                                                     className={`cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange ${
                             selectedGame && (selectedGame as BGGGameDetails).id === gameItem.id ? 'border-2 border-vibrant-orange bg-vibrant-orange/5 shadow-md' : 'border border-gray-200 hover:border-vibrant-orange'
                           }`}
                          onClick={() => handleGameSelect(gameItem)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                                                             {gameItem.image || gameItem.thumbnail ? (
                                 <Image 
                                   src={gameItem.image || gameItem.thumbnail || ''} 
                                   alt={gameItem.name}
                                   width={56}
                                   height={56}
                                   className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                 />
                               ) : (
                                <div className="w-14 h-14 bg-light-beige rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Package className="w-6 h-6 text-dark-green" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                                                 <h4 className={`font-medium text-sm leading-tight mb-1 ${
                                   selectedGame && (selectedGame as BGGGameDetails).id === gameItem.id ? 'text-vibrant-orange' : 'text-dark-green'
                                 }`}>
                                  {gameItem.name}
                                </h4>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  {gameItem.yearpublished && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {gameItem.yearpublished}
                                    </span>
                                  )}
                                  {gameItem.rank && (
                                    <span className="flex items-center gap-1">
                                      <span>#{gameItem.rank}</span>
                                    </span>
                                  )}
                                  <a
                                    href={`https://boardgamegeek.com/boardgame/${gameItem.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-vibrant-orange hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    BGG ID: {gameItem.id}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
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
             </>
           )}

          {/* Live Preview Card - Shows after game selection */}
          {selectedGame && (
            <div className="space-y-4">
                             {/* Game Selection Summary */}
               <div className="bg-vibrant-orange/5 border border-vibrant-orange/20 rounded-lg p-3">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                                           {selectedGame.thumbnail && (
                        <Image 
                          src={selectedGame.thumbnail} 
                          alt={selectedGame.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                      )}
                     <div>
                       <h4 className="font-medium text-dark-green text-sm">{selectedGame.name}</h4>
                       <p className="text-xs text-gray-600">Game selected</p>
                     </div>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                                           onClick={() => {
                        setSearchTerm('')
                        setSelectedGame(null)
                        setVersions([])
                        setSelectedVersion(null)
                        setSearchResults([])
                        setSearchError('')
                        setHasSearched(false)
                        setShowSearchResults(true)
                        setShowVersions(false)
                                                 setShowTitleSelection(false)
                                                  setSelectedLanguage('all')
                       }}
                     className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                   >
                     Search Again
                   </Button>
                 </div>
               </div>

              {/* Live Preview Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Preview Header */}
                                 <div className="bg-gradient-to-r from-dark-green-50 to-light-beige-50 px-4 py-3 border-b border-gray-200">
                   <h4 className="font-medium text-dark-green text-sm">Listing Preview</h4>
                   <p className="text-xs text-gray-600">
                     {versions.length === 1 
                       ? 'Add condition, photos, set price and shipping options to make it shine.'
                       : 'If you have a different version, change it - then add condition, photos, set price and shipping options to make it shine.'
                     }
                   </p>
                 </div>
                
                {/* Preview Content */}
                <div className="p-4">
                  {/* Mobile Layout: Vertical sections */}
                  <div className="block sm:hidden space-y-4">
                    {/* Section 1: Game Image */}
                    <div className="flex justify-center">
                      <div className="w-40 h-40 rounded-lg overflow-hidden bg-light-beige relative">
                        {formData.versionImage || formData.gameImage ? (
                          <Image 
                            src={formData.versionImage || formData.gameImage || ''} 
                            alt={selectedGame.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-light-beige rounded flex items-center justify-center">
                            <Package className="w-16 h-16 text-dark-green" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Section 2: Game Details (BGG Info) */}
                    <div className="text-center">
                      {/* Game Title */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <h3 className="font-game-titles font-semibold text-dark-green-600 text-2xl leading-tight">
                          {selectedGame.name}
                        </h3>
                        
                        {/* BGG Link Icon */}
                        <a 
                          href={`https://boardgamegeek.com/boardgame/${selectedGame.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-vibrant-orange hover:text-vibrant-orange/80 transition-colors"
                          title="View on BoardGameGeek"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      
                      {/* Version Info */}
                      {selectedVersion && (
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                          <Package className="w-3 h-3 text-vibrant-orange" />
                          <span>{selectedVersion.version.name}</span>
                        </div>
                      )}
                      
                      {/* Alternate Name */}
                      {formData.customTitle && formData.customTitle !== selectedGame.name && (
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                          <Type className="w-3 h-3 text-vibrant-orange" />
                          <span className="italic">{formData.customTitle}</span>
                        </div>
                      )}
                      
                      {/* Version Details */}
                      {selectedVersion && formData.gameDetails && (
                        <div className="space-y-1 text-xs text-gray-600">
                          {/* Languages */}
                          {formData.gameDetails.languages && formData.gameDetails.languages.length > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              <Languages className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.languages.join(', ')}</span>
                            </div>
                          )}
                          
                          {/* Publishing Year */}
                          {formData.gameDetails.yearPublished && (
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.yearPublished}</span>
                            </div>
                          )}
                          
                          {/* Publishers */}
                          {formData.gameDetails.publishers && formData.gameDetails.publishers.length > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              <Building2 className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.publishers.join(', ')}</span>
                            </div>
                          )}
                          
                          {/* Designers */}
                          {formData.gameDetails.designers && formData.gameDetails.designers.length > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              <Cog className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.designers.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Section 3: User-Provided Game Condition */}
                    {formData.gameCondition && (
                      <div className="border-t border-gray-100 pt-4 text-center space-y-1">
                        {/* Overall Condition */}
                        {formData.gameCondition.overallCondition && (
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                            {(() => {
                              const conditionMap = {
                                'in-shrink': { icon: Box, label: 'In Shrink' },
                                'opened': { icon: PackageOpen, label: 'Opened' },
                                'like-new': { icon: Star, label: 'Like New' },
                                'well-played': { icon: ThumbsUp, label: 'Well Played' },
                                'heavily-played': { icon: Repeat, label: 'Heavily Played' },
                                'for-parts': { icon: XCircle, label: 'For Parts' }
                              }
                              const condition = conditionMap[formData.gameCondition.overallCondition as keyof typeof conditionMap]
                              if (!condition) return null
                              const IconComponent = condition.icon
                              return (
                                <>
                                  <IconComponent className="w-3 h-3 text-vibrant-orange" />
                                  <span>{condition.label}</span>
                                </>
                              )
                            })()}
                          </div>
                        )}
                        
                        {/* Completeness - Only show if Missing */}
                        {formData.gameCondition.completeness === 'missing' && (
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                            <AlertTriangle className="w-3 h-3 text-orange-600" />
                            <span>Missing pieces</span>
                          </div>
                        )}
                        
                        {/* Extras */}
                        {formData.gameCondition.extras && formData.gameCondition.extras.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <span className="text-vibrant-orange">Extras:</span> {formData.gameCondition.extras.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Desktop Layout: Image in first column, title spans columns 2+3, details below */}
                  <div className="hidden sm:block">
                    <div className="flex items-start space-x-6">
                      {/* Column 1: Game Image + Game Stats + BGG Info */}
                      <div className="w-40 flex-shrink-0 space-y-3">
                        {/* Game Image */}
                        <div className="w-40 h-40 rounded-lg overflow-hidden bg-light-beige relative">
                          {formData.versionImage || formData.gameImage ? (
                            <Image 
                              src={formData.versionImage || formData.gameImage || ''} 
                              alt={selectedGame.name}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-light-beige rounded flex items-center justify-center">
                              <Package className="w-16 h-16 text-dark-green" />
                            </div>
                          )}
                        </div>
                        
                        {/* Game Stats - First line */}
                        {formData.gameDetails && (
                          <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                            {formData.gameDetails.minPlayers && formData.gameDetails.maxPlayers && (
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1 text-vibrant-orange" />
                                <span>{formData.gameDetails.minPlayers}-{formData.gameDetails.maxPlayers}</span>
                              </div>
                            )}
                            {formData.gameDetails.playingTime && (
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-vibrant-orange" />
                                <span>{formData.gameDetails.playingTime}</span>
                              </div>
                            )}
                            {formData.gameDetails.minAge && (
                              <div className="flex items-center">
                                <Cake className="w-3 h-3 mr-1 text-vibrant-orange" />
                                <span>{formData.gameDetails.minAge}+</span>
                              </div>
                            )}
                          </div>
                        )}
                        

                      </div>
                      
                      {/* Columns 2+3: Content area */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1: Game Title spans both columns 2+3 */}
                        <div className="mb-4 flex items-center gap-3">
                          <h3 className="font-game-titles font-semibold text-dark-green-600 text-2xl leading-tight">
                            {selectedGame.name}
                          </h3>
                          
                          {/* BGG Link Icon */}
                          <a 
                            href={`https://boardgamegeek.com/boardgame/${selectedGame.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-vibrant-orange hover:text-vibrant-orange/80 transition-colors"
                            title="View on BoardGameGeek"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        
                        {/* Row 2: Two columns for details */}
                        <div className="flex space-x-6">
                          {/* Column 2: Game Details (BGG Info) */}
                          <div className="flex-1 min-w-0">
                            {/* Version Info */}
                            {selectedVersion && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Package className="w-3 h-3 text-vibrant-orange" />
                                <span>{selectedVersion.version.name}</span>
                              </div>
                            )}
                            
                            {/* Alternate Name */}
                            {formData.customTitle && formData.customTitle !== selectedGame.name && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Type className="w-3 h-3 text-vibrant-orange" />
                                <span className="italic">{formData.customTitle}</span>
                              </div>
                            )}
                            
                            {/* Version Details */}
                            {selectedVersion && formData.gameDetails && (
                              <div className="space-y-1 text-xs text-gray-600">
                                {/* Languages */}
                                {formData.gameDetails.languages && formData.gameDetails.languages.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Languages className="w-3 h-3 text-vibrant-orange" />
                                    <span>{formData.gameDetails.languages.join(', ')}</span>
                                  </div>
                                )}
                                
                                {/* Publishing Year */}
                                {formData.gameDetails.yearPublished && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-vibrant-orange" />
                                    <span>{formData.gameDetails.yearPublished}</span>
                                  </div>
                                )}
                                
                                {/* Publishers */}
                                {formData.gameDetails.publishers && formData.gameDetails.publishers.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-vibrant-orange" />
                                    <span>{formData.gameDetails.publishers.join(', ')}</span>
                                  </div>
                                )}
                                
                                {/* Designers */}
                                {formData.gameDetails.designers && formData.gameDetails.designers.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Cog className="w-3 h-3 text-vibrant-orange" />
                                    <span>{formData.gameDetails.designers.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Column 3: User-Provided Game Condition */}
                          {formData.gameCondition && (
                            <div className="w-48 flex-shrink-0 space-y-1">
                              {/* Overall Condition */}
                              {formData.gameCondition.overallCondition && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  {(() => {
                                    const conditionMap = {
                                      'in-shrink': { icon: Box, label: 'In Shrink' },
                                      'opened': { icon: PackageOpen, label: 'Opened' },
                                      'like-new': { icon: Star, label: 'Like New' },
                                      'well-played': { icon: ThumbsUp, label: 'Well Played' },
                                      'heavily-played': { icon: Repeat, label: 'Heavily Played' },
                                      'for-parts': { icon: XCircle, label: 'For Parts' }
                                    }
                                    const condition = conditionMap[formData.gameCondition.overallCondition as keyof typeof conditionMap]
                                    if (!condition) return null
                                    const IconComponent = condition.icon
                                    return (
                                      <>
                                        <IconComponent className="w-3 h-3 text-vibrant-orange" />
                                        <span>{condition.label}</span>
                                      </>
                                    )
                                  })()}
                                </div>
                              )}
                              
                              {/* Completeness - Only show if Missing */}
                              {formData.gameCondition.completeness === 'missing' && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                                  <span>Missing pieces</span>
                                </div>
                              )}
                              
                              {/* Extras */}
                              {formData.gameCondition.extras && formData.gameCondition.extras.length > 0 && (
                                <div className="text-xs text-gray-600">
                                  <span className="text-vibrant-orange">Extras:</span> {formData.gameCondition.extras.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>


                 
                                                                          {/* Edit Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {/* Other Versions Button - Only show when multiple versions available */}
                        {versions.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowVersions(!showVersions)}
                            className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Other Versions
                          </Button>
                        )}
                        
                        {/* Game Condition Button - Always visible */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGameCondition(!showGameCondition)}
                          className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Game Condition
                        </Button>
                      </div>
                    </div>
               </div>
             </div>
           </div>
         )}

        {/* Version Selection - Integrated with Preview Card */}
        {selectedGame && versions.length > 0 && showVersions && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-dark-green">Select Version</h4>
              <span className="text-xs text-gray-500">
                {filteredAndSortedVersions.length} of {versions.length} versions
              </span>
            </div>
            
            {/* Language Filter Options */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLanguage('all')}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    selectedLanguage === 'all'
                      ? 'bg-vibrant-orange text-white border-vibrant-orange'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-vibrant-orange hover:text-vibrant-orange'
                  }`}
                >
                  All Languages
                </button>
                                 {Array.from(new Set(versions.flatMap(version => 
                   version.version.languages || []
                 ))).sort().map((language) => (
                   <button
                     key={language}
                     onClick={() => setSelectedLanguage(language)}
                     className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                       selectedLanguage === language
                         ? 'bg-vibrant-orange text-white border-vibrant-orange'
                         : 'bg-white text-gray-600 border-gray-300 hover:border-vibrant-orange hover:text-vibrant-orange'
                     }`}
                   >
                     {language}
                   </button>
                 ))}
              </div>
              {selectedLanguage !== 'all' && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <span>Filtering by:</span>
                  <span className="px-2 py-0.5 bg-vibrant-orange/20 text-vibrant-orange rounded-full">
                    {selectedLanguage}
                  </span>
                </div>
              )}
            </div>
            
            {/* Version Cards */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredAndSortedVersions.map((version) => (
                <Card
                  key={version.version.id}
                  className={`cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange ${
                    selectedVersion?.version.id === version.version.id
                      ? 'border-2 border-vibrant-orange bg-vibrant-orange/5 shadow-md'
                      : 'border border-gray-200 hover:border-vibrant-orange'
                  }`}
                  onClick={() => handleVersionSelect(version)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      {/* Version Image */}
                      <div className="flex-shrink-0">
                        {version.version.image || version.version.thumbnail ? (
                          <Image 
                            src={version.version.image || version.version.thumbnail || ''} 
                            alt={version.version.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-contain rounded-lg bg-light-beige"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-light-beige rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-dark-green" />
                          </div>
                        )}
                      </div>
                      
                      {/* Version Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <h4 className={`font-medium text-sm leading-tight ${
                          selectedVersion?.version.id === version.version.id ? 'text-vibrant-orange' : 'text-dark-green'
                        }`}>
                          {version.version.name}
                        </h4>
                        
                        {/* Mobile Layout: Separate lines */}
                        <div className="block sm:hidden space-y-1">
                          {version.version.yearpublished && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {version.version.yearpublished}
                            </div>
                          )}
                          {version.version.languages && version.version.languages.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Languages className="w-3 h-3" />
                              <span className="truncate">{version.version.languages.join(', ')}</span>
                            </div>
                          )}
                          {version.version.publishers && version.version.publishers.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{version.version.publishers.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Desktop Layout: One line */}
                        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600">
                          {version.version.yearpublished && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {version.version.yearpublished}
                            </div>
                          )}
                          {version.version.languages && version.version.languages.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              <span className="truncate">{version.version.languages.join(', ')}</span>
                            </div>
                          )}
                          {version.version.publishers && version.version.publishers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{version.version.publishers.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
                          {/* Title Selection - Integrated with Preview Card */}
          {selectedGame && showTitleSelection && getTitleOptions().length > 1 && (
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
             <div className="flex items-center justify-between mb-4">
               <h4 className="font-medium text-dark-green">Choose Title</h4>
               <span className="text-xs text-gray-500">
                 {selectedVersion?.suggestedAlternateName 
                   ? `${getTitleOptions().length - 1} other title${getTitleOptions().length - 1 !== 1 ? 's' : ''} available`
                   : 'Select from available titles'
                 }
               </span>
             </div>
             
             <div className="flex flex-wrap gap-2">
               {getTitleOptions().map((option, index) => (
                 <button
                   key={index}
                   onClick={() => handleTitleVariantSelect(option.title)}
                   className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                     selectedTitleVariant === option.title
                       ? 'bg-vibrant-orange text-white border-vibrant-orange'
                                               : option.isSuggested 
                          ? 'bg-white text-vibrant-orange border-vibrant-orange hover:bg-orange-50'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-vibrant-orange hover:text-vibrant-orange'
                   }`}
                   title={option.isSuggested ? 'Suggested title' : 'Available title'}
                 >
                   {option.title}
                   {option.isSuggested && (
                     <span className="ml-1 text-vibrant-orange-200">★</span>
                   )}
                 </button>
               ))}
             </div>
           </div>
         )}
         
         {/* Game Condition Section */}
         {selectedGame && showGameCondition && (
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
             <div className="mb-4">
               <h4 className="font-medium text-dark-green">Game Condition</h4>
               <p className="text-xs text-gray-600 mt-1">
                 Choose the overall condition and list any missing or extra pieces — buyers will thank you!
               </p>
             </div>
             
             {/* Overall Condition */}
             <div className="mb-6">
               <h5 className="font-medium text-sm text-dark-green mb-3">Overall Condition</h5>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {[
                   {
                     id: 'in-shrink',
                     title: 'In Shrink',
                     description: 'Sealed',
                     icon: Box
                   },
                   {
                     id: 'opened',
                     title: 'Opened',
                     description: 'But unplayed',
                     icon: PackageOpen
                   },
                   {
                     id: 'like-new',
                     title: 'Like New',
                     description: 'Played once or twice',
                     icon: Star
                   },
                   {
                     id: 'well-played',
                     title: 'Well Played',
                     description: 'Some wear, still playable',
                     icon: ThumbsUp
                   },
                   {
                     id: 'heavily-played',
                     title: 'Heavily Played',
                     description: 'Heavy wear or damage, still playable',
                     icon: Repeat
                   },
                   {
                     id: 'for-parts',
                     title: 'For Parts',
                     description: 'Missing key components',
                     icon: XCircle
                   }
                 ].map((condition) => {
                   const IconComponent = condition.icon
                   return (
                     <Card
                       key={condition.id}
                       className={`cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange ${
                         formData.gameCondition?.overallCondition === condition.id
                           ? 'border-2 border-vibrant-orange bg-vibrant-orange/5 shadow-md'
                           : 'border border-gray-200 hover:border-vibrant-orange'
                       }`}
                       onClick={() => updateFormData({
                         gameCondition: {
                           overallCondition: condition.id,
                           completeness: formData.gameCondition?.completeness || null,
                           missingDescription: formData.gameCondition?.missingDescription || null,
                           extras: formData.gameCondition?.extras || [],
                           customExtras: formData.gameCondition?.customExtras || null,
                           photos: formData.gameCondition?.photos || []
                         }
                       })}
                     >
                       <CardContent className="p-3">
                         <div className="flex items-center space-x-3">
                           <div className="flex-shrink-0">
                             <IconComponent className="w-5 h-5 text-vibrant-orange" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <h6 className="font-medium text-sm text-dark-green mb-1">{condition.title}</h6>
                             <p className="text-xs text-gray-600 leading-tight">{condition.description}</p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   )
                 })}
               </div>
             </div>
             
             {/* Components Completeness */}
             <div className="mb-6">
               <h5 className="font-medium text-sm text-dark-green mb-3">Components (Completeness)</h5>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                 {[
                   {
                     id: 'complete',
                     title: 'Complete',
                     description: 'Every piece accounted for.',
                     icon: CheckCircle
                   },
                   {
                     id: 'missing',
                     title: 'Missing',
                     description: 'Some pieces missing or slightly damaged.',
                     icon: AlertTriangle
                   }
                 ].map((completeness) => {
                   const IconComponent = completeness.icon
                   return (
                     <Card
                       key={completeness.id}
                       className={`cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange ${
                         formData.gameCondition?.completeness === completeness.id
                           ? 'border-2 border-vibrant-orange bg-vibrant-orange/5 shadow-md'
                           : 'border border-gray-200 hover:border-vibrant-orange'
                       }`}
                       onClick={() => updateFormData({
                         gameCondition: {
                           overallCondition: formData.gameCondition?.overallCondition || null,
                           completeness: completeness.id,
                           missingDescription: formData.gameCondition?.missingDescription || null,
                           extras: formData.gameCondition?.extras || [],
                           customExtras: formData.gameCondition?.customExtras || null,
                           photos: formData.gameCondition?.photos || []
                         }
                       })}
                     >
                       <CardContent className="p-3">
                         <div className="flex items-center space-x-3">
                           <div className="flex-shrink-0">
                             <IconComponent className="w-5 h-5 text-vibrant-orange" />
                           </div>
                           <div className="flex-1">
                             <h6 className="font-medium text-sm text-dark-green">{completeness.title}</h6>
                             <p className="text-xs text-gray-600">{completeness.description}</p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   )
                 })}
               </div>
               
               {/* Missing Description Field */}
               {formData.gameCondition?.completeness === 'missing' && (
                 <div className="mt-3">
                   <textarea
                     placeholder="Describe missing pieces or damage..."
                     value={formData.gameCondition?.missingDescription || ''}
                     onChange={(e) => updateFormData({
                       gameCondition: {
                         overallCondition: formData.gameCondition?.overallCondition || null,
                         completeness: formData.gameCondition?.completeness || null,
                         missingDescription: e.target.value,
                         extras: formData.gameCondition?.extras || [],
                         customExtras: formData.gameCondition?.customExtras || null,
                         photos: formData.gameCondition?.photos || []
                       }
                     })}
                     className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                     rows={3}
                   />
                 </div>
               )}
             </div>
             
             {/* Extras & Add-Ons */}
             <div className="mb-6">
               <h5 className="font-medium text-sm text-dark-green mb-3">Extras & Add-Ons (Optional)</h5>
               <div className="flex flex-wrap gap-2 mb-3">
                 {[
                   'Sleeved cards',
                   'Custom insert',
                   'Painted minis'
                 ].map((extra) => (
                   <button
                     key={extra}
                     type="button"
                     onClick={() => {
                       const currentExtras = formData.gameCondition?.extras || []
                       const newExtras = currentExtras.includes(extra)
                         ? currentExtras.filter(item => item !== extra)
                         : [...currentExtras, extra]
                       updateFormData({
                         gameCondition: {
                           overallCondition: formData.gameCondition?.overallCondition || null,
                           completeness: formData.gameCondition?.completeness || null,
                           missingDescription: formData.gameCondition?.missingDescription || null,
                           extras: newExtras,
                           customExtras: formData.gameCondition?.customExtras || null,
                           photos: formData.gameCondition?.photos || []
                         }
                       })
                     }}
                     className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                       formData.gameCondition?.extras?.includes(extra)
                         ? 'bg-vibrant-orange text-white border-vibrant-orange'
                         : 'bg-white text-gray-600 border-gray-300 hover:border-vibrant-orange hover:text-vibrant-orange'
                     }`}
                   >
                     {extra}
                   </button>
                 ))}
               </div>
               
               {/* Custom Extras Text Field */}
               <div>
                 <textarea
                   placeholder="Describe any extras or upgrades your game includes..."
                   value={formData.gameCondition?.customExtras || ''}
                   onChange={(e) => updateFormData({
                     gameCondition: {
                       overallCondition: formData.gameCondition?.overallCondition || null,
                       completeness: formData.gameCondition?.completeness || null,
                       missingDescription: formData.gameCondition?.missingDescription || null,
                       extras: formData.gameCondition?.extras || [],
                       customExtras: e.target.value,
                       photos: formData.gameCondition?.photos || []
                     }
                   })}
                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                   rows={2}
                 />
               </div>
             </div>
             
             {/* Photos Section */}
             <div>
               <h5 className="font-medium text-sm text-dark-green mb-3">Photos</h5>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-vibrant-orange transition-colors">
                 <div className="text-gray-400 mb-2">
                   <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                     <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                 </div>
                 <p className="text-sm text-gray-600 mb-2">
                   <strong>Drag & Drop</strong> or <strong>Click to Upload</strong>
                 </p>
                 <p className="text-xs text-gray-500 mb-4">
                   Recommended: 2 photos (max 3)<br />
                   Include box front + inside and any special extras<br />
                   Keep photos clear and well-lit
                 </p>
                 <div className="text-xs text-gray-500 space-y-1">
                   <p>💡 <em>&ldquo;Don&apos;t hide the dents — honesty makes for a better second turn!&rdquo;</em></p>
                   <p>💡 <em>&ldquo;Show any missing pieces or wear so buyers know what to expect.&rdquo;</em></p>
                 </div>
               </div>
             </div>
           </div>
         )}
         
         

        {/* Next Steps Placeholder */}
        {selectedGame && selectedVersion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 text-sm mb-2">Ready for next steps!</h4>
            <p className="text-xs text-blue-600">
              Game and version selected. Next we&apos;ll add condition, photos, price, and shipping details.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
  )
}
