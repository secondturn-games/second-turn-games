"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Calendar, Package, Type, Languages, Building2, HelpCircle, Users, Clock, Cake, ChevronDown, ChevronUp, Box, CheckCircle, AlertTriangle, ThumbsUp, ExternalLink, Cog, PackageCheck, Archive, PackageX, AlertCircle, Sparkles, Smile, BookOpenCheck, Book, BookX, Lock, Gift, Camera, Cuboid, Puzzle, NotebookText, BookMinus, Globe, Euro, MessageCircleQuestion, Handshake, Container, Truck } from 'lucide-react'
import Image from 'next/image'
import { bggServiceClient } from '@/lib/bgg/bgg-service-client'
import type { BGGSearchResult, BGGGameDetails, LanguageMatchedVersion, LightweightSearchResult, EnhancedSearchResult } from '@/lib/bgg'

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
    activeFilter: 'box' | 'components' | 'rulebook' | 'extras' | 'photos' | null
    boxCondition: string | null
    boxDescription: string | null
    completeness: string | null
    missingDescription: string | null
    componentCondition: string | null
    rulebook: string | null
    rulebookDescription: string | null
    extras: string[]
    extrasDescription: string | null
    photos: string[]
    photoNotes: string | null
  } | null
  price: {
    amount: string | null
    negotiable: boolean
    notes: string | null
  } | null
  shipping: {
    activeFilter: 'pickup' | 'parcelLocker' | 'standardCourier' | null
    pickup: {
      enabled: boolean
      location: string | null
    }
    parcelLocker: {
      enabled: boolean
      priceType: 'included' | 'separate' | null
      price: string | null
      location: string | null
      countries: string[]
      countryPrices: Record<string, string>
    }
    standardCourier: {
      enabled: boolean
      priceType: 'included' | 'separate' | null
      price: string | null
      location: string | null
      countries: string[]
      countryPrices: Record<string, string>
    }
    notes: string | null
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
  const [showPrice, setShowPrice] = useState(false)
  const [showShipping, setShowShipping] = useState(false)

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
    gameCondition: null,
    price: null,
    shipping: null
  })

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateGameCondition = (updates: Partial<NonNullable<ListingFormData['gameCondition']>>) => {
    updateFormData({
      gameCondition: {
        activeFilter: formData.gameCondition?.activeFilter || null,
        boxCondition: formData.gameCondition?.boxCondition || null,
        boxDescription: formData.gameCondition?.boxDescription || null,
        completeness: formData.gameCondition?.completeness || null,
        missingDescription: formData.gameCondition?.missingDescription || null,
        componentCondition: formData.gameCondition?.componentCondition || null,
        rulebook: formData.gameCondition?.rulebook || null,
        rulebookDescription: formData.gameCondition?.rulebookDescription || null,
        extras: formData.gameCondition?.extras || [],
        extrasDescription: formData.gameCondition?.extrasDescription || null,
        photos: formData.gameCondition?.photos || [],
        photoNotes: formData.gameCondition?.photoNotes || null,
        ...updates
      }
    })
  }

  const updatePrice = (updates: Partial<NonNullable<ListingFormData['price']>>) => {
    updateFormData({
      price: {
        amount: formData.price?.amount || null,
        negotiable: formData.price?.negotiable || false,
        notes: formData.price?.notes || null,
        ...updates
      }
    })
  }

  const updateShipping = (updates: Partial<NonNullable<ListingFormData['shipping']>>) => {
    const currentShipping = formData.shipping || {
      activeFilter: null,
      pickup: { enabled: false, location: null },
      parcelLocker: { enabled: false, priceType: null, price: null, location: null, countries: [], countryPrices: {} },
      standardCourier: { enabled: false, priceType: null, price: null, location: null, countries: [], countryPrices: {} },
      notes: null
    }
    
    updateFormData({
      shipping: {
        ...currentShipping,
        ...updates
      }
    })
  }

  const performSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchError('Please enter at least 2 characters to search')
      return
    }

    // Add mobile detection and enhanced logging
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log('🔍 Lightweight search initiated:', { 
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
      console.log('🔍 Starting lightweight search...')
      // Use exact matching for short search terms (likely specific game names)
      const useExact = searchTerm.length <= 10 && !searchTerm.includes(' ')
      const lightResults = await bggServiceClient.searchGames(searchTerm, { 
        gameType, 
        exact: useExact 
      })
      console.log('✅ Light search returned:', { 
        resultsCount: lightResults.length, 
        results: lightResults,
        exact: useExact
      })
      setSearchResults(lightResults)
      
      // If only one result, auto-select it
      if (lightResults.length === 1) {
        await handleGameSelect(lightResults[0])
      }
    } catch (err) {
      console.error('❌ Light search error:', { 
        error: err, 
        message: err instanceof Error ? err.message : 'Unknown error',
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
      gameCondition: null,
      price: null,
      shipping: null
    })
    setShowGameCondition(false)
    setShowPrice(false)
    setShowShipping(false)
  }

  const handleGameSelect = async (game: LightweightSearchResult | EnhancedSearchResult) => {
    try {
      // Reset Game Condition data for new game
      resetGameCondition()
      
      // Get full game details and versions in a single optimized API call
      const { game: gameDetails, versions: gameVersions } = await bggServiceClient.getGameDetailsWithVersions(game.id)
      
      setSelectedGame(gameDetails)
      setVersions(gameVersions)
      
      // Auto-select the best version based on priority
      const bestVersion = selectBestVersion(gameVersions)
      if (bestVersion) {
        setSelectedVersion(bestVersion)
        setSelectedTitleVariant(game.name) // Always use primary title
        
        // Update form data with auto-selected version and title
        updateFormData({
          bggGameId: game.id,
          gameName: game.name,
          gameImage: gameDetails?.image || gameDetails?.thumbnail || null,
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
                  <div className="space-y-3">
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {searchResults.map((game) => {
                        // BGGSearchResult already has all the metadata we need
                        const displayGame = game
                        
                        return (
                          <Card
                            key={game.id}
                            className={`cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange ${
                              selectedGame && (selectedGame as BGGGameDetails).id === game.id ? 'border-2 border-vibrant-orange bg-vibrant-orange/5 shadow-md' : 'border border-gray-200 hover:border-vibrant-orange'
                            }`}
                            onClick={() => handleGameSelect(displayGame)}
                          >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              {displayGame.thumbnail ? (
                                <Image 
                                  src={displayGame.thumbnail} 
                                  alt={displayGame.name}
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
                                  selectedGame && (selectedGame as BGGGameDetails).id === game.id ? 'text-vibrant-orange' : 'text-dark-green'
                                }`}>
                                  {displayGame.name}
                                </h4>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  {displayGame.yearpublished && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {displayGame.yearpublished}
                                    </span>
                                  )}
                                  {displayGame.rank && (
                                    <span className="flex items-center gap-1">
                                      <span>#{displayGame.rank}</span>
                                    </span>
                                  )}
                                  <a
                                    href={displayGame.bggLink}
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
                      
                      {/* Version Details */}
                      {selectedVersion && formData.gameDetails && (
                        <div className="space-y-1 text-xs text-gray-600">
                          {/* Version Info */}
                          {selectedVersion && (
                            <div className="flex items-center justify-center gap-1">
                              <Globe className="w-3 h-3 text-vibrant-orange" />
                              <span>{selectedVersion.version.name}</span>
                            </div>
                          )}
                          
                          {/* Alternate Name */}
                          {formData.customTitle && formData.customTitle !== selectedGame.name && (
                            <div className="flex items-center justify-center gap-1">
                              <Type className="w-3 h-3 text-vibrant-orange" />
                              <span className="italic">{formData.customTitle}</span>
                            </div>
                          )}
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
                      <div className="border-t border-gray-100 pt-4 text-center">
                        <div className="text-xs text-gray-600 space-y-1">
                          {(() => {
                            const conditions = []
                            
                            // Box Condition - Only show if explicitly selected
                            if (formData.gameCondition.boxCondition && formData.gameCondition.boxCondition !== null) {
                              const boxMap = {
                                'new': { icon: Lock, label: 'Sealed' },
                                'like-new': { icon: PackageCheck, label: 'Like New' },
                                'lightly-worn': { icon: Box, label: 'Lightly Worn' },
                                'worn': { icon: Archive, label: 'Worn' },
                                'damaged': { icon: PackageX, label: 'Damaged' }
                              }
                              const box = boxMap[formData.gameCondition.boxCondition as keyof typeof boxMap]
                              if (box) {
                                const IconComponent = box.icon
                                conditions.push(
                                  <div key="box" className="flex items-center justify-center gap-1">
                                    <IconComponent className="w-3 h-3 text-vibrant-orange" />
                                    <span>{box.label}</span>
                                  </div>
                                )
                              }
                            }
                            
                            // Components - Only show if box is not "new" (sealed)
                            if (formData.gameCondition.boxCondition !== 'new' && 
                                formData.gameCondition.completeness && 
                                formData.gameCondition.componentCondition) {
                              const completenessMap = {
                                'complete': 'Complete',
                                'incomplete': 'Incomplete'
                              }
                              const componentMap = {
                                'like-new': 'Like New',
                                'lightly-used': 'Lightly Used',
                                'well-played': 'Well Played',
                                'damaged': 'Damaged'
                              }
                              const completeness = completenessMap[formData.gameCondition.completeness as keyof typeof completenessMap]
                              const component = componentMap[formData.gameCondition.componentCondition as keyof typeof componentMap]
                              if (completeness && component) {
                                conditions.push(
                                  <div key="components" className="flex items-center justify-center gap-1">
                                    <Puzzle className="w-3 h-3 text-vibrant-orange" />
                                    <span>{completeness} / {component}</span>
                                  </div>
                                )
                              }
                            }
                            
                            // Rulebook - Only show if box is not "new" (sealed)
                            if (formData.gameCondition.boxCondition !== 'new' && 
                                formData.gameCondition.rulebook) {
                              const rulebookMap = {
                                'included-good': 'Included',
                                'included-worn': 'Included (worn)',
                                'missing': 'Missing',
                                'partially-included': 'Partially Included'
                              }
                              const rulebook = rulebookMap[formData.gameCondition.rulebook as keyof typeof rulebookMap]
                              if (rulebook) {
                                conditions.push(
                                  <div key="rulebook" className="flex items-center justify-center gap-1">
                                    <NotebookText className="w-3 h-3 text-vibrant-orange" />
                                    <span>{rulebook}</span>
                                  </div>
                                )
                              }
                            }
                            
                            // Extras
                            if (formData.gameCondition.extras && formData.gameCondition.extras.length > 0) {
                              const firstExtra = formData.gameCondition.extras[0]
                              const remainingCount = formData.gameCondition.extras.length - 1
                              const moreText = remainingCount > 0 ? ` +${remainingCount} more` : ''
                              conditions.push(
                                <div key="extras" className="flex items-center justify-center gap-1">
                                  <Gift className="w-3 h-3 text-vibrant-orange" />
                                  <span>{firstExtra}{moreText}</span>
                                </div>
                              )
                            }
                            
                            return conditions
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* Section 4: Price Information */}
                    {formData.price && formData.price.amount && (
                      <div className="border-t border-gray-100 pt-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-display font-semibold text-dark-green-600 text-2xl leading-tight">
                            €{parseFloat(formData.price.amount).toFixed(2)}
                          </span>
                          {formData.price.negotiable && (
                            <MessageCircleQuestion className="w-4 h-4 text-vibrant-orange" />
                          )}
                        </div>
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
                            {/* Version Details */}
                            {selectedVersion && formData.gameDetails && (
                              <div className="space-y-1 text-xs text-gray-600">
                                {/* Version Info */}
                                {selectedVersion && (
                                  <div className="flex items-center gap-1">
                                    <Globe className="w-3 h-3 text-vibrant-orange" />
                                    <span>{selectedVersion.version.name}</span>
                                  </div>
                                )}
                                
                                {/* Alternate Name */}
                                {formData.customTitle && formData.customTitle !== selectedGame.name && (
                                  <div className="flex items-center gap-1">
                                    <Type className="w-3 h-3 text-vibrant-orange" />
                                    <span className="italic">{formData.customTitle}</span>
                                  </div>
                                )}
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
                          
                          {/* Column 3: User-Provided Game Condition & Price */}
                          {(formData.gameCondition || formData.price) && (
                            <div className="w-56 flex-shrink-0">
                              <div className="text-xs text-gray-600 space-y-1">
                                {(() => {
                                  const conditions = []
                                  
                                  // Box Condition - Only show if explicitly selected
                                  if (formData.gameCondition?.boxCondition && formData.gameCondition.boxCondition !== null) {
                                    const boxMap = {
                                      'new': { icon: Lock, label: 'Sealed' },
                                      'like-new': { icon: PackageCheck, label: 'Like New' },
                                      'lightly-worn': { icon: Box, label: 'Lightly Worn' },
                                      'worn': { icon: Archive, label: 'Worn' },
                                      'damaged': { icon: PackageX, label: 'Damaged' }
                                    }
                                    const box = boxMap[formData.gameCondition.boxCondition as keyof typeof boxMap]
                                    if (box) {
                                      const IconComponent = box.icon
                                      conditions.push(
                                        <div key="box" className="flex items-center gap-1">
                                          <IconComponent className="w-3 h-3 text-vibrant-orange" />
                                          <span>{box.label}</span>
                                        </div>
                                      )
                                    }
                                  }
                                  
                                  // Components - Only show if box is not "new" (sealed)
                                  if (formData.gameCondition?.boxCondition !== 'new' && 
                                      formData.gameCondition?.completeness && 
                                      formData.gameCondition?.componentCondition) {
                                    const completenessMap = {
                                      'complete': 'Complete',
                                      'incomplete': 'Incomplete'
                                    }
                                    const componentMap = {
                                      'like-new': 'Like New',
                                      'lightly-used': 'Lightly Used',
                                      'well-played': 'Well Played',
                                      'damaged': 'Damaged'
                                    }
                                    const completeness = completenessMap[formData.gameCondition.completeness as keyof typeof completenessMap]
                                    const component = componentMap[formData.gameCondition.componentCondition as keyof typeof componentMap]
                                    if (completeness && component) {
                                      conditions.push(
                                        <div key="components" className="flex items-center gap-1">
                                          <Puzzle className="w-3 h-3 text-vibrant-orange" />
                                          <span>{completeness} / {component}</span>
                                        </div>
                                      )
                                    }
                                  }
                                  
                                  // Rulebook - Only show if box is not "new" (sealed)
                                  if (formData.gameCondition?.boxCondition !== 'new' && 
                                      formData.gameCondition?.rulebook) {
                                    const rulebookMap = {
                                      'included-good': 'Included',
                                      'included-worn': 'Included (worn)',
                                      'missing': 'Missing',
                                      'partially-included': 'Partially Included'
                                    }
                                    const rulebook = rulebookMap[formData.gameCondition.rulebook as keyof typeof rulebookMap]
                                    if (rulebook) {
                                      conditions.push(
                                        <div key="rulebook" className="flex items-center gap-1">
                                          <NotebookText className="w-3 h-3 text-vibrant-orange" />
                                          <span>{rulebook}</span>
                                        </div>
                                      )
                                    }
                                  }
                                  
                                  // Extras
                                  if (formData.gameCondition?.extras && formData.gameCondition.extras.length > 0) {
                                    const firstExtra = formData.gameCondition.extras[0]
                                    const remainingCount = formData.gameCondition.extras.length - 1
                                    const moreText = remainingCount > 0 ? ` +${remainingCount} more` : ''
                                    conditions.push(
                                      <div key="extras" className="flex items-center gap-1">
                                        <Gift className="w-3 h-3 text-vibrant-orange" />
                                        <span>{firstExtra}{moreText}</span>
                                      </div>
                                    )
                                  }
                                  
                                  // Price
                                  if (formData.price?.amount) {
                                    conditions.push(
                                      <div key="price" className="flex items-center gap-2">
                                        <span className="font-display font-semibold text-dark-green-600 text-2xl leading-tight">
                                          €{parseFloat(formData.price.amount).toFixed(2)}
                                        </span>
                                        {formData.price.negotiable && (
                                          <MessageCircleQuestion className="w-4 h-4 text-vibrant-orange" />
                                        )}
                                      </div>
                                    )
                                  }
                                  
                                  return conditions
                                })()}
                              </div>
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
                            Other Versions ⌵
                          </Button>
                        )}
                        
                        {/* Game Condition Button - Always visible */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!formData.gameCondition) {
                              updateFormData({
                                gameCondition: {
                                  activeFilter: null,
                                  boxCondition: null,
                                  boxDescription: null,
                                  completeness: null,
                                  missingDescription: null,
                                  componentCondition: null,
                                  rulebook: null,
                                  rulebookDescription: null,
                                  extras: [],
                                  extrasDescription: null,
                                  photos: [],
                                  photoNotes: null
                                }
                              })
                            }
                            setShowGameCondition(!showGameCondition)
                          }}
                          className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Game Condition ⌵
                        </Button>
                        
                        {/* Price Button - Always visible */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!formData.price) {
                              updateFormData({
                                price: {
                                  amount: null,
                                  negotiable: false,
                                  notes: null
                                }
                              })
                            }
                            setShowPrice(!showPrice)
                          }}
                          className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Price ⌵
                        </Button>
                        
                        {/* Shipping Button - Always visible */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!formData.shipping) {
                              updateFormData({
                                shipping: {
                                  activeFilter: null,
                                  pickup: {
                                    enabled: false,
                                    location: null
                                  },
                                  parcelLocker: {
                                    enabled: false,
                                    priceType: null,
                                    price: null,
                                    location: null,
                                    countries: [],
                                    countryPrices: {}
                                  },
                                  standardCourier: {
                                    enabled: false,
                                    priceType: null,
                                    price: null,
                                    location: null,
                                    countries: [],
                                    countryPrices: {}
                                  },
                                  notes: null
                                }
                              })
                            }
                            setShowShipping(!showShipping)
                          }}
                          className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Shipping ⌵
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
            
            <p className="text-xs text-gray-600 mb-4">
              Board games travel the world — and so do their editions! Pick the exact version you own so buyers know what to expect. You can filter by language to make sure the right rulebook and components are included.
            </p>
            
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
               Every game tells a story — some are fresh from the shelf, others have been on many adventures. Let buyers know what kind of journey your copy has had. The more detail you share, the easier it is for someone else to make their next move with confidence.
               </p>
             </div>
             
             {/* Condition Filter Buttons */}
             <div className="mb-4">
               <div className="flex flex-wrap gap-2">
                 {[
                   { id: 'box', label: 'Box *', icon: Cuboid },
                   { id: 'components', label: 'Components *', icon: Puzzle },
                   { id: 'rulebook', label: 'Rulebook *', icon: NotebookText },
                   { id: 'extras', label: 'Extras', icon: Gift },
                   { id: 'photos', label: 'Photos', icon: Camera }
                 ].map((filter) => {
                   const IconComponent = filter.icon
                   const isSelected = formData.gameCondition?.activeFilter === filter.id
                   const isNewBox = formData.gameCondition?.boxCondition === 'new'
                   const isDisabled = (filter.id === 'components' || filter.id === 'rulebook') && isNewBox
                   
                   return (
                     <button
                       key={filter.id}
                       onClick={() => {
                         if (!isDisabled) {
                           updateGameCondition({ activeFilter: filter.id as 'box' | 'components' | 'rulebook' | 'extras' | 'photos' })
                         }
                       }}
                       disabled={isDisabled}
                       className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs border transition-all ${
                         isDisabled
                           ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                           : isSelected 
                             ? 'border-vibrant-orange bg-orange-50 text-vibrant-orange' 
                             : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                       }`}
                     >
                       <IconComponent className="w-4 h-4" />
                       {isDisabled ? filter.label.replace(' *', '') : filter.label}
                     </button>
                   )
                 })}
               </div>
             </div>
             
             {/* Condition Options */}
             {formData.gameCondition?.activeFilter && (
               <div className="bg-white border border-gray-200 rounded-lg p-4">
                 {formData.gameCondition.activeFilter === 'box' && (
                   <div>
                     <p className="text-xs text-gray-600 mb-4">
                       Tell buyers about the game&apos;s outer box — is it fresh and sturdy, or has it seen a few gaming nights?
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                       {[
                         { id: 'new', icon: Lock, title: 'New', description: 'Still in shrink wrap' },
                         { id: 'like-new', icon: PackageCheck, title: 'Like New', description: 'No visible wear' },
                         { id: 'lightly-worn', icon: Box, title: 'Lightly Worn', description: 'Small scuffs or corner wear' },
                         { id: 'worn', icon: Archive, title: 'Worn', description: 'Noticeable wear, but intact' },
                         { id: 'damaged', icon: PackageX, title: 'Damaged', description: 'Tears, dents, or water damage' }
                       ].map((condition) => {
                         const IconComponent = condition.icon
                         const isSelected = formData.gameCondition?.boxCondition === condition.id
                         return (
                           <button
                             key={condition.id}
                             onClick={() => updateGameCondition({ boxCondition: condition.id as string })}
                             className={`p-3 rounded-lg border-2 text-left transition-all ${
                               isSelected 
                                 ? 'border-vibrant-orange bg-orange-50' 
                                 : 'border-gray-200 bg-white hover:border-gray-300'
                             }`}
                           >
                             <div className="flex items-start gap-3">
                               <IconComponent className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-vibrant-orange' : 'text-gray-400'}`} />
                               <div>
                                 <h6 className="font-medium text-sm text-gray-900">{condition.title}</h6>
                                 <p className="text-xs text-gray-600 mt-1">{condition.description}</p>
                               </div>
                             </div>
                           </button>
                         )
                       })}
                     </div>
                     
                     {/* Optional text field */}
                     <div>
                       <textarea
                         placeholder="Anything else about the box condition?"
                         value={formData.gameCondition?.boxDescription || ''}
                         onChange={(e) => updateGameCondition({ boxDescription: e.target.value })}
                         className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                         rows={2}
                       />
                     </div>
                   </div>
                 )}
                 
                 {formData.gameCondition.activeFilter === 'components' && (
                   <div>
                     <p className="text-xs text-gray-600 mb-4">
                       Are all the pieces present and in what shape are they? Buyers want to know they can play right out of the box.
                     </p>
                     
                     {/* Completeness Options */}
                     <div className="mb-4">
                       <h6 className="font-medium text-sm text-gray-900 mb-3">Completeness</h6>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {[
                           { id: 'complete', icon: CheckCircle, title: 'Complete', description: 'All components included' },
                           { id: 'incomplete', icon: AlertCircle, title: 'Incomplete', description: 'Something is missing (please list below)' }
                         ].map((completeness) => {
                           const IconComponent = completeness.icon
                           const isSelected = formData.gameCondition?.completeness === completeness.id
                           return (
                             <button
                               key={completeness.id}
                               onClick={() => updateGameCondition({ completeness: completeness.id as string })}
                               className={`p-3 rounded-lg border-2 text-left transition-all ${
                                 isSelected 
                                   ? 'border-vibrant-orange bg-orange-50' 
                                   : 'border-gray-200 bg-white hover:border-gray-300'
                               }`}
                             >
                               <div className="flex items-start gap-3">
                                 <IconComponent className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-vibrant-orange' : 'text-gray-400'}`} />
                                 <div>
                                   <h6 className="font-medium text-sm text-gray-900">{completeness.title}</h6>
                                   <p className="text-xs text-gray-600 mt-1">{completeness.description}</p>
                                 </div>
                               </div>
                             </button>
                           )
                         })}
                       </div>
                     </div>
                     
                     {/* Component Condition Options */}
                     <div className="mb-4">
                       <h6 className="font-medium text-sm text-gray-900 mb-3">Component Condition</h6>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {[
                           { id: 'like-new', icon: Sparkles, title: 'Like New', description: 'Unplayed or barely used' },
                           { id: 'lightly-used', icon: Smile, title: 'Lightly Used', description: 'Minor wear' },
                           { id: 'well-played', icon: ThumbsUp, title: 'Well Played', description: 'Visible wear, but fully usable' },
                           { id: 'damaged', icon: AlertTriangle, title: 'Damaged', description: 'Some pieces / cards are marked, bent, or broken' }
                         ].map((condition) => {
                           const IconComponent = condition.icon
                           const isSelected = formData.gameCondition?.componentCondition === condition.id
                           return (
                             <button
                               key={condition.id}
                               onClick={() => updateGameCondition({ componentCondition: condition.id as string })}
                               className={`p-3 rounded-lg border-2 text-left transition-all ${
                                 isSelected 
                                   ? 'border-vibrant-orange bg-orange-50' 
                                   : 'border-gray-200 bg-white hover:border-gray-300'
                               }`}
                             >
                               <div className="flex items-start gap-3">
                                 <IconComponent className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-vibrant-orange' : 'text-gray-400'}`} />
                                 <div>
                                   <h6 className="font-medium text-sm text-gray-900">{condition.title}</h6>
                                   <p className="text-xs text-gray-600 mt-1">{condition.description}</p>
                                 </div>
                               </div>
                             </button>
                           )
                         })}
                       </div>
                     </div>
                     
                     {/* Optional text field */}
                     <div>
                       <textarea
                         placeholder="List missing or damaged components, if any."
                         value={formData.gameCondition?.missingDescription || ''}
                         onChange={(e) => updateGameCondition({ missingDescription: e.target.value })}
                         className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                         rows={2}
                       />
                     </div>
                   </div>
                 )}
                 
                 {formData.gameCondition.activeFilter === 'rulebook' && (
                   <div>
                     <p className="text-xs text-gray-600 mb-4">
                       Games are easier to play with the rulebook — let buyers know what&apos;s included.
                     </p>
                     
                     {/* Rulebook Options */}
                     <div className="mb-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {[
                           { id: 'included-good', icon: BookOpenCheck, title: 'Included', description: 'Original in good condition' },
                           { id: 'included-worn', icon: Book, title: 'Included', description: 'Worn (folds, marks, small tears)' },
                           { id: 'missing', icon: BookX, title: 'Missing', description: 'Rulebook not included' },
                           { id: 'partially-included', icon: BookMinus, title: 'Partially Included', description: 'Only some languages (please specify)' }
                         ].map((rulebook) => {
                           const IconComponent = rulebook.icon
                           const isSelected = formData.gameCondition?.rulebook === rulebook.id
                           return (
                             <button
                               key={rulebook.id}
                               onClick={() => updateGameCondition({ rulebook: rulebook.id as string })}
                               className={`p-3 rounded-lg border-2 text-left transition-all ${
                                 isSelected 
                                   ? 'border-vibrant-orange bg-orange-50' 
                                   : 'border-gray-200 bg-white hover:border-gray-300'
                               }`}
                             >
                               <div className="flex items-start gap-3">
                                 <IconComponent className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-vibrant-orange' : 'text-gray-400'}`} />
                                 <div>
                                   <h6 className="font-medium text-sm text-gray-900">{rulebook.title}</h6>
                                   <p className="text-xs text-gray-600 mt-1">{rulebook.description}</p>
                                 </div>
                               </div>
                             </button>
                           )
                         })}
                       </div>
                     </div>
                     
                     {/* Optional text field */}
                     <div>
                       <textarea
                         placeholder="Which rulebooks are included or missing?"
                         value={formData.gameCondition?.rulebookDescription || ''}
                         onChange={(e) => updateGameCondition({ rulebookDescription: e.target.value })}
                         className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                         rows={2}
                       />
                     </div>
                   </div>
                 )}
                 
                 {formData.gameCondition.activeFilter === 'extras' && (
                   <div>
                     <p className="text-xs text-gray-600 mb-4">
                       Sometimes games come with a little extra magic. Mention anything special that makes your copy unique.
                     </p>
                     
                     {/* Extras Options */}
                     <div className="mb-4">
                       <div className="flex flex-wrap gap-2">
                         {[
                           'Card sleeves',
                           'Upgraded components',
                           'Custom insert',
                           'Playmat',
                           'Painted miniatures',
                           'Promos'
                         ].map((extra) => {
                           const isSelected = formData.gameCondition?.extras?.includes(extra) || false
                           return (
                             <button
                               key={extra}
                               onClick={() => {
                                 const currentExtras = formData.gameCondition?.extras || []
                                 const newExtras = isSelected 
                                   ? currentExtras.filter(e => e !== extra)
                                   : [...currentExtras, extra]
                                 updateGameCondition({ extras: newExtras })
                               }}
                               className={`px-3 py-2 rounded-md text-xs border transition-all ${
                                 isSelected 
                                   ? 'border-vibrant-orange bg-orange-50 text-vibrant-orange' 
                                   : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                               }`}
                             >
                               {extra}
                             </button>
                           )
                         })}
                       </div>
                     </div>
                     
                     {/* Optional text field */}
                     <div>
                       <textarea
                         placeholder="Describe any extras or modifications."
                         value={formData.gameCondition?.extrasDescription || ''}
                         onChange={(e) => updateGameCondition({ extrasDescription: e.target.value })}
                         className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                         rows={2}
                       />
                     </div>
                   </div>
                 )}
                 
                 {formData.gameCondition.activeFilter === 'photos' && (
                   <div>
                     <p className="text-xs text-gray-600 mb-4">
                       A picture says more than a thousand dice rolls — add up to 3 photos so buyers see what they&apos;re getting.
                     </p>
                     
                     {/* Upload Interface */}
                     <div className="mb-4">
                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-vibrant-orange transition-colors">
                         <div className="space-y-2">
                           <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                             <Camera className="w-6 h-6 text-gray-400" />
                           </div>
                           <div>
                             <p className="text-sm font-medium text-gray-900">Upload photos</p>
                             <p className="text-xs text-gray-600">Drag & drop or click to upload</p>
                           </div>
                           <div className="text-xs text-gray-500 space-y-1">
                             <p>Up to 3 photos allowed</p>
                             <p>Include box front + inside and any special extras</p>
                             <p>Keep photos clear and well-lit</p>
                           </div>
                         </div>
                       </div>
                       
                       {/* Photo Thumbnails */}
                       {formData.gameCondition?.photos && formData.gameCondition.photos.length > 0 && (
                         <div className="mt-4">
                           <div className="grid grid-cols-3 gap-3">
                             {formData.gameCondition.photos.map((photo, index) => (
                               <div key={index} className="relative group">
                                 <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                   <Image
                                     src={photo}
                                     alt={`Game photo ${index + 1}`}
                                     width={150}
                                     height={150}
                                     className="w-full h-full object-cover"
                                   />
                                 </div>
                                 <button
                                   onClick={() => {
                                     const newPhotos = formData.gameCondition?.photos?.filter((_, i) => i !== index) || []
                                     updateGameCondition({ photos: newPhotos })
                                   }}
                                   className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                 >
                                   ×
                                 </button>
                               </div>
                             ))}
                           </div>
                           
                           {/* Reorder hint */}
                           {formData.gameCondition.photos.length > 1 && (
                             <p className="text-xs text-gray-500 mt-2 text-center">
                               Drag to reorder photos (coming soon)
                             </p>
                           )}
                         </div>
                       )}
                     </div>
                     
                     {/* Optional text field */}
                     <div>
                       <textarea
                         placeholder="Add notes about the photos (e.g., highlighting wear, scratches, or missing components)."
                         value={formData.gameCondition?.photoNotes || ''}
                         onChange={(e) => updateGameCondition({ photoNotes: e.target.value })}
                         className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                         rows={2}
                       />
                     </div>
                   </div>
                 )}
               </div>
             )}
           </div>
         )}
         
         {/* Price Section */}
         {selectedGame && showPrice && (
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
             <div className="mb-4">
               <h4 className="font-medium text-dark-green">Price</h4>
               <p className="text-xs text-gray-600 mt-1">
                 Set the value of your game so buyers know what to expect. Fair pricing helps trades happen faster!
               </p>
             </div>
             
             <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
               {/* Price Amount and Negotiable Card - Two Columns */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Price Amount */}
                 <div>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Euro className="h-4 w-4 text-gray-400" />
                     </div>
                     <input
                       type="number"
                       step="0.01"
                       min="0.01"
                       placeholder="0.00"
                       value={formData.price?.amount || ''}
                       onChange={(e) => {
                         const value = e.target.value
                         // Validate: must be > 0 and allow up to 2 decimal places
                         if (value === '' || (parseFloat(value) > 0 && /^\d+(\.\d{1,2})?$/.test(value))) {
                           updatePrice({ amount: value })
                         }
                       }}
                       onBlur={(e) => {
                         // Format to 2 decimals when user leaves the field
                         if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                           updatePrice({ amount: parseFloat(e.target.value).toFixed(2) })
                         }
                       }}
                       className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                     />
                   </div>
                 </div>
                 
                 {/* Negotiable Checkbox */}
                 <div>
                   <label className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       checked={formData.price?.negotiable || false}
                       onChange={(e) => updatePrice({ negotiable: e.target.checked })}
                       className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300 rounded hover:border-vibrant-orange"
                     />
                     <div>
                       <span className="text-sm font-medium text-gray-700">Negotiable?</span>
                       <p className="text-xs text-gray-500">Allow buyers to make offers if selected.</p>
                     </div>
                   </label>
                 </div>
               </div>
               
               {/* Optional Notes */}
               <div>
                 <textarea
                   placeholder="Want to add context to the price?"
                   value={formData.price?.notes || ''}
                   onChange={(e) => updatePrice({ notes: e.target.value })}
                   className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                   rows={2}
                 />
               </div>
             </div>
           </div>
         )}
         
         {/* Shipping Section */}
         {selectedGame && showShipping && (
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
             <div className="mb-4">
               <h4 className="font-medium text-dark-green">Shipping</h4>
               <p className="text-xs text-gray-600 mt-1">
                 Tell buyers how their game will get to them and where it can travel. Clear shipping info avoids surprises and keeps everyone happy.
               </p>
             </div>
             
             <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
               {/* Shipping Filter Buttons */}
               <div className="flex flex-wrap gap-2">
                 {[
                   { id: 'pickup', label: 'Pickup / Local delivery', icon: Handshake },
                   { id: 'parcelLocker', label: 'Parcel locker', icon: Container },
                   { id: 'standardCourier', label: 'Standard courier', icon: Truck }
                 ].map((filter) => {
                   const IconComponent = filter.icon
                   const isSelected = formData.shipping?.activeFilter === filter.id
                   return (
                     <button
                       key={filter.id}
                       onClick={() => updateShipping({ activeFilter: filter.id as 'pickup' | 'parcelLocker' | 'standardCourier' })}
                       className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs border transition-all ${
                         isSelected 
                           ? 'border-vibrant-orange bg-orange-50 text-vibrant-orange' 
                           : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                       }`}
                     >
                       <IconComponent className="h-4 w-4" />
                       <span>{filter.label}</span>
                     </button>
                   )
                 })}
               </div>
               
               {/* Shipping Options Content */}
               {formData.shipping?.activeFilter && (
                 <div className="border-t border-gray-100 pt-4">
                   {formData.shipping?.activeFilter === 'pickup' && (
                     <div className="space-y-4">
                       <div>
                         <p className="text-xs text-gray-600 mb-3">Perfect for local buyers who can meet you in person.</p>
                         
                         {/* Enable/Disable Toggle */}
                         <div className="mb-4">
                           <label className="flex items-center space-x-3">
                             <input
                               type="checkbox"
                               checked={formData.shipping?.pickup?.enabled || false}
                                                                                              onChange={(e) => updateShipping({
                                 pickup: {
                                   enabled: e.target.checked,
                                   location: formData.shipping?.pickup?.location || null
                                 }
                               })}
                               className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300 rounded hover:border-vibrant-orange"
                             />
                             <span className="text-sm font-medium text-gray-700">Enable pickup / local delivery</span>
                           </label>
                         </div>
                         
                         {/* Location Field */}
                         {formData.shipping?.pickup?.enabled && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Location *
                             </label>
                             <input
                               type="text"
                               placeholder="City, area, or meeting point"
                               value={formData.shipping?.pickup?.location || ''}
                               onChange={(e) => updateShipping({
                                 pickup: {
                                   enabled: formData.shipping?.pickup?.enabled || false,
                                   location: e.target.value
                                 }
                               })}
                               className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                             />
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                   
                   {formData.shipping.activeFilter === 'parcelLocker' && (
                     <div className="space-y-4">
                       <div>
                         <p className="text-xs text-gray-600 mb-3">Convenient automated pickup points for buyers.</p>
                         
                         {/* Enable/Disable Toggle */}
                         <div className="mb-4">
                           <label className="flex items-center space-x-3">
                             <input
                               type="checkbox"
                               checked={formData.shipping?.parcelLocker.enabled || false}
                                                                onChange={(e) => updateShipping({
                                   parcelLocker: {
                                     enabled: e.target.checked,
                                     priceType: formData.shipping?.parcelLocker?.priceType || null,
                                     price: formData.shipping?.parcelLocker?.price || null,
                                     location: formData.shipping?.parcelLocker?.location || null,
                                     countries: formData.shipping?.parcelLocker?.countries || [],
                                     countryPrices: formData.shipping?.parcelLocker?.countryPrices || {}
                                   }
                                 })}
                               className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300 rounded hover:border-vibrant-orange"
                             />
                             <span className="text-sm font-medium text-gray-700">Enable parcel locker shipping</span>
                           </label>
                         </div>
                         
                         {/* Parcel Locker Options */}
                         {formData.shipping?.parcelLocker.enabled && (
                           <div className="space-y-4">
                             {/* Price Type */}
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Shipping Price *
                               </label>
                               <div className="space-y-2">
                                 <label className="flex items-center space-x-3">
                                   <input
                                     type="radio"
                                     name="parcelLocker-priceType"
                                     value="included"
                                     checked={formData.shipping?.parcelLocker.priceType === 'included'}
                                                                          onChange={(e) => updateShipping({
                                       parcelLocker: {
                                         enabled: formData.shipping?.parcelLocker?.enabled || false,
                                         priceType: e.target.value as 'included',
                                         price: formData.shipping?.parcelLocker?.price || null,
                                         location: formData.shipping?.parcelLocker?.location || null,
                                         countries: formData.shipping?.parcelLocker?.countries || [],
                                         countryPrices: formData.shipping?.parcelLocker?.countryPrices || {}
                                       }
                                     })}
                                     className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300"
                                   />
                                   <span className="text-sm text-gray-700">Included in game price</span>
                                 </label>
                                 <label className="flex items-center space-x-3">
                                   <input
                                     type="radio"
                                     name="parcelLocker-priceType"
                                     value="separate"
                                     checked={formData.shipping?.parcelLocker.priceType === 'separate'}
                                                                          onChange={(e) => updateShipping({
                                       parcelLocker: {
                                         enabled: formData.shipping?.parcelLocker?.enabled || false,
                                         priceType: e.target.value as 'separate',
                                         price: formData.shipping?.parcelLocker?.price || null,
                                         location: formData.shipping?.parcelLocker?.location || null,
                                         countries: formData.shipping?.parcelLocker?.countries || [],
                                         countryPrices: formData.shipping?.parcelLocker?.countryPrices || {}
                                       }
                                     })}
                                     className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300"
                                   />
                                   <span className="text-sm text-gray-700">Separate shipping price</span>
                                 </label>
                               </div>
                             </div>
                             
                             {/* Separate Price Input */}
                             {formData.shipping?.parcelLocker.priceType === 'separate' && (
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                                   Base Shipping Price *
                                 </label>
                                 <div className="relative">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                     <Euro className="h-4 w-4 text-gray-400" />
                                   </div>
                                   <input
                                     type="number"
                                     step="0.01"
                                     min="0.01"
                                     placeholder="0.00"
                                     value={formData.shipping?.parcelLocker.price || ''}
                                     onChange={(e) => {
                                       const value = e.target.value
                                       if (value === '' || (parseFloat(value) > 0 && /^\d+(\.\d{1,2})?$/.test(value))) {
                                         updateShipping({
                                           parcelLocker: {
                                             enabled: formData.shipping?.parcelLocker?.enabled || false,
                                             priceType: formData.shipping?.parcelLocker?.priceType || null,
                                             price: value,
                                             location: formData.shipping?.parcelLocker?.location || null,
                                             countries: formData.shipping?.parcelLocker?.countries || [],
                                             countryPrices: formData.shipping?.parcelLocker?.countryPrices || {}
                                           }
                                         })
                                       }
                                     }}
                                     onBlur={(e) => {
                                       if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                         updateShipping({
                                           parcelLocker: {
                                             enabled: formData.shipping?.parcelLocker?.enabled || false,
                                             priceType: formData.shipping?.parcelLocker?.priceType || null,
                                             price: parseFloat(e.target.value).toFixed(2),
                                             location: formData.shipping?.parcelLocker?.location || null,
                                             countries: formData.shipping?.parcelLocker?.countries || [],
                                             countryPrices: formData.shipping?.parcelLocker?.countryPrices || {}
                                           }
                                         })
                                       }
                                     }}
                                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                                   />
                                 </div>
                               </div>
                             )}
                             
                             {/* Game Location */}
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Game Location *
                               </label>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <div>
                                   <select
                                     value="Estonia"
                                     onChange={(e) => {
                                       // TODO: Update with user's country from profile
                                       console.log('Parcel Locker Country selected:', e.target.value)
                                     }}
                                     className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                                   >
                                     <option value="Estonia">Estonia</option>
                                     <option value="Latvia">Latvia</option>
                                     <option value="Lithuania">Lithuania</option>
                                   </select>
                                 </div>
                                 <div>
                                   <input
                                     type="text"
                                     placeholder="City, area"
                                     value={formData.shipping?.parcelLocker.location || ''}
                                     onChange={(e) => updateShipping({
                                       parcelLocker: {
                                         enabled: formData.shipping?.parcelLocker?.enabled || false,
                                         priceType: formData.shipping?.parcelLocker?.priceType || null,
                                         price: formData.shipping?.parcelLocker?.price || null,
                                         location: e.target.value,
                                         countries: formData.shipping?.parcelLocker?.countries || [],
                                         countryPrices: formData.shipping?.parcelLocker?.countryPrices || {}
                                       }
                                     })}
                                     className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                                   />
                                 </div>
                               </div>
                             </div>
                             
                             {/* Shipping To Countries */}
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Shipping To
                               </label>
                               <div className="space-y-2">
                                 {['Estonia', 'Latvia', 'Lithuania', 'Finland', 'Sweden', 'Denmark'].map((country) => {
                                   const isSelected = formData.shipping?.parcelLocker?.countries?.includes(country) || false
                                   return (
                                     <div key={country} className="flex items-center justify-between">
                                       <label className="flex items-center space-x-3">
                                         <input
                                           type="checkbox"
                                           checked={isSelected}
                                           onChange={(e) => {
                                             const newCountries = e.target.checked
                                               ? [...(formData.shipping?.parcelLocker?.countries || []), country]
                                               : (formData.shipping?.parcelLocker?.countries || []).filter(c => c !== country)
                                                                                            updateShipping({
                                                 parcelLocker: {
                                                   enabled: formData.shipping?.parcelLocker?.enabled || false,
                                                   priceType: formData.shipping?.parcelLocker?.priceType || null,
                                                   price: formData.shipping?.parcelLocker?.price || null,
                                                   location: formData.shipping?.parcelLocker?.location || null,
                                                   countries: newCountries,
                                                   countryPrices: formData.shipping?.parcelLocker?.countryPrices || {}
                                                 }
                                               })
                                           }}
                                           className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300 rounded hover:border-vibrant-orange"
                                         />
                                         <span className="text-sm text-gray-700">{country}</span>
                                       </label>
                                       {isSelected && formData.shipping?.parcelLocker.priceType === 'separate' && (
                                         <div className="flex items-center gap-1">
                                           <Euro className="h-3 w-3 text-gray-400" />
                                           <input
                                             type="number"
                                             step="0.01"
                                             min="0.01"
                                             placeholder="0.00"
                                             value={formData.shipping?.parcelLocker.countryPrices[country] || ''}
                                             onChange={(e) => {
                                               const value = e.target.value
                                               if (value === '' || (parseFloat(value) > 0 && /^\d+(\.\d{1,2})?$/.test(value))) {
                                                 updateShipping({
                                                   parcelLocker: {
                                                     enabled: formData.shipping?.parcelLocker?.enabled || false,
                                                     priceType: formData.shipping?.parcelLocker?.priceType || null,
                                                     price: formData.shipping?.parcelLocker?.price || null,
                                                     location: formData.shipping?.parcelLocker?.location || null,
                                                     countries: formData.shipping?.parcelLocker?.countries || [],
                                                     countryPrices: {
                                                       ...formData.shipping?.parcelLocker?.countryPrices,
                                                       [country]: value
                                                     }
                                                   }
                                                 })
                                               }
                                             }}
                                             onBlur={(e) => {
                                               if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                                 updateShipping({
                                                   parcelLocker: {
                                                     enabled: formData.shipping?.parcelLocker?.enabled || false,
                                                     priceType: formData.shipping?.parcelLocker?.priceType || null,
                                                     price: formData.shipping?.parcelLocker?.price || null,
                                                     location: formData.shipping?.parcelLocker?.location || null,
                                                     countries: formData.shipping?.parcelLocker?.countries || [],
                                                     countryPrices: {
                                                       ...formData.shipping?.parcelLocker?.countryPrices,
                                                       [country]: parseFloat(e.target.value).toFixed(2)
                                                     }
                                                   }
                                                 })
                                               }
                                             }}
                                             className="w-20 pl-6 pr-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-vibrant-orange focus:border-vibrant-orange"
                                           />
                                         </div>
                                       )}
                                     </div>
                                   )
                                 })}
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                   
                   {formData.shipping.activeFilter === 'standardCourier' && (
                     <div className="space-y-4">
                       <div>
                         <p className="text-xs text-gray-600 mb-3">Traditional shipping via postal services or courier companies.</p>
                         
                         {/* Enable/Disable Toggle */}
                         <div className="mb-4">
                           <label className="flex items-center space-x-3">
                             <input
                               type="checkbox"
                               checked={formData.shipping?.standardCourier.enabled || false}
                                                                onChange={(e) => updateShipping({
                                   standardCourier: {
                                     enabled: e.target.checked,
                                     priceType: formData.shipping?.standardCourier?.priceType || null,
                                     price: formData.shipping?.standardCourier?.price || null,
                                     location: formData.shipping?.standardCourier?.location || null,
                                     countries: formData.shipping?.standardCourier?.countries || [],
                                     countryPrices: formData.shipping?.standardCourier?.countryPrices || {}
                                   }
                                 })}
                               className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300 rounded hover:border-vibrant-orange"
                             />
                             <span className="text-sm font-medium text-gray-700">Enable standard courier shipping</span>
                           </label>
                         </div>
                         
                         {/* Standard Courier Options */}
                         {formData.shipping?.standardCourier.enabled && (
                           <div className="space-y-4">
                             {/* Price Type */}
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Shipping Price *
                               </label>
                               <div className="space-y-2">
                                 <label className="flex items-center space-x-3">
                                   <input
                                     type="radio"
                                     name="standardCourier-priceType"
                                     value="included"
                                     checked={formData.shipping?.standardCourier.priceType === 'included'}
                                                                          onChange={(e) => updateShipping({
                                       standardCourier: {
                                         enabled: formData.shipping?.standardCourier?.enabled || false,
                                         priceType: e.target.value as 'included',
                                         price: formData.shipping?.standardCourier?.price || null,
                                         location: formData.shipping?.standardCourier?.location || null,
                                         countries: formData.shipping?.standardCourier?.countries || [],
                                         countryPrices: formData.shipping?.standardCourier?.countryPrices || {}
                                       }
                                     })}
                                     className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300"
                                   />
                                   <span className="text-sm text-gray-700">Included in game price</span>
                                 </label>
                                 <label className="flex items-center space-x-3">
                                   <input
                                     type="radio"
                                     name="standardCourier-priceType"
                                     value="separate"
                                     checked={formData.shipping?.standardCourier.priceType === 'separate'}
                                                                          onChange={(e) => updateShipping({
                                       standardCourier: {
                                         enabled: formData.shipping?.standardCourier?.enabled || false,
                                         priceType: e.target.value as 'separate',
                                         price: formData.shipping?.standardCourier?.price || null,
                                         location: formData.shipping?.standardCourier?.location || null,
                                         countries: formData.shipping?.standardCourier?.countries || [],
                                         countryPrices: formData.shipping?.standardCourier?.countryPrices || {}
                                       }
                                     })}
                                     className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300"
                                   />
                                   <span className="text-sm text-gray-700">Separate shipping price</span>
                                 </label>
                               </div>
                             </div>
                             
                             {/* Separate Price Input */}
                             {formData.shipping?.standardCourier.priceType === 'separate' && (
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                                   Base Shipping Price *
                                 </label>
                                 <div className="relative">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                     <Euro className="h-4 w-4 text-gray-400" />
                                   </div>
                                   <input
                                     type="number"
                                     step="0.01"
                                     min="0.01"
                                     placeholder="0.00"
                                     value={formData.shipping?.standardCourier.price || ''}
                                     onChange={(e) => {
                                       const value = e.target.value
                                       if (value === '' || (parseFloat(value) > 0 && /^\d+(\.\d{1,2})?$/.test(value))) {
                                         updateShipping({
                                           standardCourier: {
                                             enabled: formData.shipping?.standardCourier?.enabled || false,
                                             priceType: formData.shipping?.standardCourier?.priceType || null,
                                             price: value,
                                             location: formData.shipping?.standardCourier?.location || null,
                                             countries: formData.shipping?.standardCourier?.countries || [],
                                             countryPrices: formData.shipping?.standardCourier?.countryPrices || {}
                                           }
                                         })
                                       }
                                     }}
                                     onBlur={(e) => {
                                       if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                         updateShipping({
                                           standardCourier: {
                                             enabled: formData.shipping?.standardCourier?.enabled || false,
                                             priceType: formData.shipping?.standardCourier?.priceType || null,
                                             price: parseFloat(e.target.value).toFixed(2),
                                             location: formData.shipping?.standardCourier?.location || null,
                                             countries: formData.shipping?.standardCourier?.countries || [],
                                             countryPrices: formData.shipping?.standardCourier?.countryPrices || {}
                                           }
                                         })
                                       }
                                     }}
                                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                                   />
                                 </div>
                               </div>
                             )}
                             
                             {/* Game Location */}
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Game Location *
                               </label>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <div>
                                   <select
                                     value="Estonia"
                                     onChange={(e) => {
                                       // TODO: Update with user's country from profile
                                       console.log('Standard Courier Country selected:', e.target.value)
                                     }}
                                     className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                                   >
                                     <option value="Estonia">Estonia</option>
                                     <option value="Latvia">Latvia</option>
                                     <option value="Lithuania">Lithuania</option>
                                   </select>
                                 </div>
                                 <div>
                                   <input
                                     type="text"
                                     placeholder="City, area"
                                     value={formData.shipping?.standardCourier.location || ''}
                                     onChange={(e) => updateShipping({
                                       standardCourier: {
                                         enabled: formData.shipping?.standardCourier?.enabled || false,
                                         priceType: formData.shipping?.standardCourier?.priceType || null,
                                         price: formData.shipping?.standardCourier?.price || null,
                                         location: e.target.value,
                                         countries: formData.shipping?.standardCourier?.countries || [],
                                         countryPrices: formData.shipping?.standardCourier?.countryPrices || {}
                                       }
                                     })}
                                     className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                                   />
                                 </div>
                               </div>
                             </div>
                             
                             {/* Shipping To Countries */}
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Shipping To
                               </label>
                               <div className="space-y-2">
                                 {['Estonia', 'Latvia', 'Lithuania', 'Finland', 'Sweden', 'Denmark'].map((country) => {
                                   const isSelected = formData.shipping?.standardCourier?.countries?.includes(country) || false
                                   return (
                                     <div key={country} className="flex items-center justify-between">
                                       <label className="flex items-center space-x-3">
                                         <input
                                           type="checkbox"
                                           checked={isSelected}
                                           onChange={(e) => {
                                             const newCountries = e.target.checked
                                               ? [...(formData.shipping?.standardCourier?.countries || []), country]
                                               : (formData.shipping?.standardCourier?.countries || []).filter(c => c !== country)
                                                                                            updateShipping({
                                                 standardCourier: {
                                                   enabled: formData.shipping?.standardCourier?.enabled || false,
                                                   priceType: formData.shipping?.standardCourier?.priceType || null,
                                                   price: formData.shipping?.standardCourier?.price || null,
                                                   location: formData.shipping?.standardCourier?.location || null,
                                                   countries: newCountries,
                                                   countryPrices: formData.shipping?.standardCourier?.countryPrices || {}
                                                 }
                                               })
                                           }}
                                           className="h-4 w-4 text-vibrant-orange focus:ring-vibrant-orange border-gray-300 rounded hover:border-vibrant-orange"
                                         />
                                         <span className="text-sm text-gray-700">{country}</span>
                                       </label>
                                       {isSelected && formData.shipping?.standardCourier.priceType === 'separate' && (
                                         <div className="flex items-center gap-1">
                                           <Euro className="h-3 w-3 text-gray-400" />
                                           <input
                                             type="number"
                                             step="0.01"
                                             min="0.01"
                                             placeholder="0.00"
                                             value={formData.shipping?.standardCourier.countryPrices[country] || ''}
                                             onChange={(e) => {
                                               const value = e.target.value
                                               if (value === '' || (parseFloat(value) > 0 && /^\d+(\.\d{1,2})?$/.test(value))) {
                                                 updateShipping({
                                                   standardCourier: {
                                                     enabled: formData.shipping?.standardCourier?.enabled || false,
                                                     priceType: formData.shipping?.standardCourier?.priceType || null,
                                                     price: formData.shipping?.standardCourier?.price || null,
                                                     location: formData.shipping?.standardCourier?.location || null,
                                                     countries: formData.shipping?.standardCourier?.countries || [],
                                                     countryPrices: {
                                                       ...formData.shipping?.standardCourier?.countryPrices,
                                                       [country]: value
                                                     }
                                                   }
                                                 })
                                               }
                                             }}
                                             onBlur={(e) => {
                                               if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                                 updateShipping({
                                                   standardCourier: {
                                                     enabled: formData.shipping?.standardCourier?.enabled || false,
                                                     priceType: formData.shipping?.standardCourier?.priceType || null,
                                                     price: formData.shipping?.standardCourier?.price || null,
                                                     location: formData.shipping?.standardCourier?.location || null,
                                                     countries: formData.shipping?.standardCourier?.countries || [],
                                                     countryPrices: {
                                                       ...formData.shipping?.standardCourier?.countryPrices,
                                                       [country]: parseFloat(e.target.value).toFixed(2)
                                                     }
                                                   }
                                                 })
                                               }
                                             }}
                                             className="w-20 pl-6 pr-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-vibrant-orange focus:border-vibrant-orange"
                                           />
                                         </div>
                                       )}
                                     </div>
                                   )
                                 })}
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               )}
               
               {/* Optional Notes */}
               <div>
                 <textarea
                   placeholder="Want to add shipping details or restrictions?"
                   value={formData.shipping?.notes || ''}
                   onChange={(e) => updateShipping({ notes: e.target.value })}
                   className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange"
                   rows={2}
                 />
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
