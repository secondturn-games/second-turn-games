"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'


import { Search, Calendar, Package, Type, Languages, Building2, HelpCircle, Users, Clock, Cake } from 'lucide-react'
import { bggServiceClient } from '@/lib/bgg/bgg-service-client'
import type { BGGSearchResult, BGGGameDetails, LanguageMatchedVersion } from '@/lib/bgg'
import type { ListingFormData } from '../listing-wizard'


interface GameSelectionStepProps {
  formData: ListingFormData
  updateFormData: (updates: Partial<ListingFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function GameSelectionStep({ formData, updateFormData, onNext, onBack }: GameSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [gameType, setGameType] = useState<'base-game' | 'expansion'>('base-game')
  
  // Predefined languages for filtering
  const predefinedLanguages = [
    'English', 'German', 'Russian', 'Latvian', 'Estonian', 'Lithuanian',
    'French', 'Spanish', 'Italian', 'Dutch', 'Polish', 'Czech'
  ]
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [selectedGame, setSelectedGame] = useState<BGGGameDetails | null>(null)
  const [versions, setVersions] = useState<LanguageMatchedVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<LanguageMatchedVersion | null>(null)
  const [selectedTitleVariant, setSelectedTitleVariant] = useState<string>('main-title')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
         const [showSearchResults, setShowSearchResults] = useState(true)
    const [showSearchBar, setShowSearchBar] = useState(true)
    const [showVersions, setShowVersions] = useState(true)
    const [showTitleSelection, setShowTitleSelection] = useState(false)
   const [selectedLanguage, setSelectedLanguage] = useState<string>('all')

     // Restore user selections from formData when component mounts or formData changes
   useEffect(() => {
     if (formData.bggGameId && formData.gameName) {
       // We need to fetch the actual game details to get alternate names
       const restoreGameData = async () => {
         try {
           const gameDetails = await bggServiceClient.getGameDetails(formData.bggGameId!)
           const gameVersions = await bggServiceClient.getLanguageMatchedVersions(formData.bggGameId!)
           
           setSelectedGame(gameDetails)
           setVersions(gameVersions)
           
           // Update form data with game details if not already set
           if (!formData.gameDetails) {
             updateFormData({
               gameDetails: {
                 minPlayers: gameDetails?.minplayers || '',
                 maxPlayers: gameDetails?.maxplayers || '',
                 playingTime: gameDetails?.playingtime || '',
                 minAge: gameDetails?.minage || '',
                 yearPublished: gameDetails?.yearpublished || '',
                 languages: [],
                 publishers: []
               }
             })
           }
           
           // Restore selected version if available
           if (formData.bggVersionId && formData.versionName) {
             const version = gameVersions.find(v => v.version.id === formData.bggVersionId)
             if (version) {
               setSelectedVersion(version)
               
               // Update form data with version-specific details
               updateFormData({
                 gameDetails: {
                   minPlayers: gameDetails?.minplayers || '',
                   maxPlayers: gameDetails?.maxplayers || '',
                   playingTime: gameDetails?.playingtime || '',
                   minAge: gameDetails?.minage || '',
                   yearPublished: version.version.yearpublished || gameDetails?.yearpublished || '',
                   languages: version.version.languages || [],
                   publishers: version.version.publishers || []
                 }
               })
               
               // Restore title selection
               if (formData.customTitle) {
                 setSelectedTitleVariant(formData.customTitle)
               } else {
                 setSelectedTitleVariant(formData.gameName)
               }
               
               // Collapse sections since we have a complete selection
               setShowSearchResults(false)
               setShowSearchBar(false)
               setShowVersions(false)
               setShowTitleSelection(false)
             }
           } else {
             // Only game is selected, keep versions expanded
             setShowSearchResults(false)
             setShowSearchBar(false)
             setShowVersions(true)
             setShowTitleSelection(false)
             
             // Restore title selection
             setSelectedTitleVariant(formData.gameName)
           }
         } catch (err) {
           console.error('Failed to restore game data:', err)
           // Fallback to basic data if API call fails
           setSelectedGame({
             id: formData.bggGameId,
             name: formData.gameName,
             thumbnail: formData.gameImage || '',
             alternateNames: [],
             type: 'boardgame',
             yearpublished: '',
             minplayers: '',
             maxplayers: '',
             playingtime: '',
             minage: '',
             description: '',
             weight: '',
             mechanics: [],
             categories: [],
             designers: [],
             versions: [],
             hasInboundExpansionLink: false,
             inboundExpansionLinks: [],
             image: formData.gameImage || '',
             rating: '',
             rank: '',
             isExpansion: false
           } as BGGGameDetails)
         }
       }
       
              restoreGameData()
     }
   }, [formData.bggGameId, formData.bggVersionId, formData.gameName, formData.versionName])

  const performSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchError('Please enter at least 2 characters to search')
      return
    }

    setIsSearching(true)
    setSearchError('')
    setSearchResults([])
    setSelectedGame(null)
    setVersions([])
    setSelectedVersion(null)
    setHasSearched(true)

    try {
      const searchResults = await bggServiceClient.searchGames(searchTerm, { gameType })
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
             publishers: bestVersion.version.publishers || []
           }
         })
         
                   // Keep sections collapsed but allow user to expand for editing
          setShowSearchResults(false)
          setShowSearchBar(false)
          setShowVersions(false)
          setShowTitleSelection(false)
       } else {
         // Fallback: no version selected
         setSelectedVersion(null)
         setSelectedTitleVariant(game.name)
         
         // Keep versions expanded for manual selection
         setShowVersions(true)
       }
      
                      // Update form data with game info (version will be set by auto-selection)
         updateFormData({
           bggGameId: game.id,
           gameName: game.name,
           gameImage: gameDetails?.image || gameDetails?.thumbnail || null,
         })
      
             // Sections will be collapsed by auto-selection logic above
      
      // Reset language filter for new game
      setSelectedLanguage('all')
     } catch (err) {
       setSearchError(err instanceof Error ? err.message : 'Failed to get game details')
     }
   }

           const handleVersionSelect = (version: LanguageMatchedVersion) => {
      setSelectedVersion(version)
      
             // Always use primary title (game name)
       setSelectedTitleVariant(selectedGame?.name || '')
      
             // Update form data with version and auto-selected title
       updateFormData({
         bggVersionId: version.version.id,
         versionName: version.version.name,
         suggestedAlternateName: version.suggestedAlternateName,
         versionImage: version.version.image || version.version.thumbnail || null,
                    customTitle: null, // Always use primary title
         gameDetails: {
           minPlayers: selectedGame?.minplayers || '',
           maxPlayers: selectedGame?.maxplayers || '',
           playingTime: selectedGame?.playingtime || '',
           minAge: selectedGame?.minage || '',
           yearPublished: version.version.yearpublished || selectedGame?.yearpublished || '',
           languages: version.version.languages || [],
           publishers: version.version.publishers || []
         }
       })
      
      // Collapse version section after selection
      setShowVersions(false)
      // Expand title selection so user can see the auto-selected title and make changes if needed
      setShowTitleSelection(true)
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

   // Debug function to check title options
   const getTitleOptions = () => {
     if (!selectedGame) return []
     
     console.log('getTitleOptions called with:', {
       selectedGame: selectedGame.name,
       alternateNames: selectedGame.alternateNames,
       selectedVersion: selectedVersion?.version.name,
       suggestedAlternateName: selectedVersion?.suggestedAlternateName
     })
     
     const uniqueTitles = new Set<string>()
     const titleOptions: Array<{ title: string; isSuggested: boolean }> = []
     
     // Add primary title first
     uniqueTitles.add(selectedGame.name)
     titleOptions.push({ title: selectedGame.name, isSuggested: false })
     
     // Add suggested match if available and different from primary
     if (selectedVersion?.suggestedAlternateName && 
         selectedVersion.suggestedAlternateName !== selectedGame.name &&
         !uniqueTitles.has(selectedVersion.suggestedAlternateName)) {
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
     
     console.log('Title options generated:', titleOptions)
     return titleOptions
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

   const canContinue = !!selectedGame && !!selectedVersion

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

    setIsSearching(true)
    setSearchError('')
         setSearchResults([])
     setSelectedGame(null)
     setVersions([])
     setSelectedVersion(null)
     setShowSearchResults(true)
     setShowSearchBar(true)
     setShowVersions(true)
     setShowTitleSelection(false)

    try {
      const searchResults = await bggServiceClient.searchGames(searchTerm, { gameType: newGameType })
      setSearchResults(searchResults)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Card>
             <CardHeader>
         <CardTitle className="text-dark-green text-lg lg:text-xl">Find Your Game</CardTitle>
         {!selectedGame && (
           <p className="text-sm text-gray-600">Search for a base game or expansion and we&apos;ll load the details from BGG</p>
         )}
       </CardHeader>
      <CardContent className="space-y-6">
        {/* Collapsible Search Section (Game Type + Search Bar) */}
        {showSearchBar ? (
          <div className="space-y-3">
            {/* Game Type Switch */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                                                        setGameType('base-game')
                   setSearchResults([])
                   setSearchError('')
                   setSelectedVersion(null)
                   setShowSearchBar(true)
                   setShowVersions(true)
                   setShowTitleSelection(false)
                  // Only search if we have a valid search term
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
                   setShowSearchBar(true)
                   setShowVersions(true)
                   setShowTitleSelection(false)
                  // Only search if we have a valid search term
                  if (searchTerm.trim() && searchTerm.trim().length >= 2) {
                    performSearchWithGameType('expansion')
                  }
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

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Type in the name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  className="pl-10 pr-10 border-gray-300 focus:border-vibrant-orange"
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
                       setShowSearchBar(true)
                       setShowVersions(true)
                       setShowTitleSelection(false)
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                disabled={!searchTerm.trim() || searchTerm.trim().length < 2 || isSearching}
                className="bg-vibrant-orange hover:bg-vibrant-orange/90 w-full sm:w-auto"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
                 ) : (
           <div 
             className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
             onClick={() => setShowSearchBar(true)}
           >
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <div className="flex items-center space-x-2">
                   <div className="w-5 h-5 bg-vibrant-orange/20 rounded flex items-center justify-center">
                     <span className="text-xs font-medium text-vibrant-orange">
                       {gameType === 'base-game' ? 'BG' : 'EX'}
                     </span>
                   </div>
                   <Search className="w-5 h-5 text-gray-500" />
                 </div>
                 <div>
                   <h4 className="font-medium text-dark-green text-sm">
                     {gameType === 'base-game' ? 'Base Game' : 'Expansion'} Search Complete
                   </h4>
                   <p className="text-xs text-gray-600">Click to search for a different game</p>
                 </div>
               </div>
               <div className="text-vibrant-orange">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
             </div>
           </div>
         )}

        {/* Search Error */}
        {searchError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{searchError}</p>
          </div>
        )}

                 {/* Live Preview Card - Shows after game selection */}
         {selectedGame && (
           <div className="space-y-4">
             {/* Game Selection Summary (Collapsible) */}
             <div 
               className="bg-vibrant-orange/5 border border-vibrant-orange/20 rounded-lg p-3 cursor-pointer hover:bg-vibrant-orange/10 transition-colors"
               onClick={() => setShowSearchResults(!showSearchResults)}
             >
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   {selectedGame.thumbnail && (
                     <img 
                       src={selectedGame.thumbnail} 
                       alt={selectedGame.name}
                       className="w-10 h-10 rounded object-cover flex-shrink-0"
                     />
                   )}
                   <div>
                     <h4 className="font-medium text-dark-green text-sm">{selectedGame.name}</h4>
                     <p className="text-xs text-gray-600">Click to change game selection</p>
                   </div>
                 </div>
                 <div className="text-vibrant-orange">
                   {showSearchResults ? (
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                     </svg>
                   ) : (
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   )}
                 </div>
               </div>
             </div>

             {/* Live Preview Card */}
             <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
               {/* Preview Header */}
               <div className="bg-gradient-to-r from-dark-green-50 to-light-beige-50 px-4 py-3 border-b border-gray-200">
                 <h4 className="font-medium text-dark-green text-sm">Listing Preview</h4>
                 <p className="text-xs text-gray-600">This is how your listing will appear</p>
               </div>
               
                               {/* Preview Content */}
                <div className="p-4">
                  {/* Mobile Layout: Image above game info */}
                  <div className="block sm:hidden space-y-4">
                    {/* Game Image - Mobile */}
                    <div className="w-40 h-40 rounded-lg overflow-hidden mx-auto bg-light-beige">
                      {formData.versionImage || formData.gameImage ? (
                        <img 
                          src={formData.versionImage || formData.gameImage || ''} 
                          alt={selectedGame.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-light-beige rounded flex items-center justify-center">
                          <Package className="w-16 h-16 text-dark-green" />
                        </div>
                      )}
                    </div>
                    
                    {/* Game Details - Mobile */}
                    <div className="text-center sm:text-left">
                      {/* Game Title */}
                      <h3 className="font-game-titles font-semibold text-dark-green-600 text-2xl leading-tight mb-2">
                        {formData.gameName || selectedGame.name}
                      </h3>
                      
                                             {/* Version Info */}
                       {selectedVersion && (
                         <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                           <Package className="w-4 h-4 text-vibrant-orange" />
                           <span>{selectedVersion.version.name}</span>
                         </div>
                       )}
                       
                       {/* Alternate Name - Mobile */}
                       {formData.customTitle && formData.customTitle !== selectedGame.name && (
                         <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                           <Type className="w-4 h-4 text-vibrant-orange" />
                           <span className="italic">{formData.customTitle}</span>
                         </div>
                       )}
                       
                       {/* Game Stats */}
                      {formData.gameDetails && (
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 mb-3">
                          {formData.gameDetails.minPlayers && formData.gameDetails.maxPlayers && (
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1 text-vibrant-orange" />
                              <span>{formData.gameDetails.minPlayers}-{formData.gameDetails.maxPlayers}</span>
                            </div>
                          )}
                          {formData.gameDetails.playingTime && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-vibrant-orange" />
                              <span>{formData.gameDetails.playingTime} min</span>
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
                      
                      {/* Version Details */}
                      {selectedVersion && formData.gameDetails && (
                        <div className="space-y-1 text-xs text-gray-600">
                          {formData.gameDetails.yearPublished && (
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.yearPublished}</span>
                            </div>
                          )}
                          {formData.gameDetails.languages && formData.gameDetails.languages.length > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              <Languages className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.languages.join(', ')}</span>
                            </div>
                          )}
                          {formData.gameDetails.publishers && formData.gameDetails.publishers.length > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              <Building2 className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.publishers.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout: Image and game info side by side */}
                  <div className="hidden sm:flex items-start space-x-4">
                    {/* Game Image - Desktop */}
                    <div className="w-40 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-light-beige">
                      {formData.versionImage || formData.gameImage ? (
                        <img 
                          src={formData.versionImage || formData.gameImage || ''} 
                          alt={selectedGame.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-light-beige rounded flex items-center justify-center">
                          <Package className="w-16 h-16 text-dark-green" />
                        </div>
                      )}
                    </div>
                    
                    {/* Game Details - Desktop */}
                    <div className="flex-1 min-w-0">
                                           {/* Game Title */}
                      <h3 className="font-game-titles font-semibold text-dark-green-600 text-2xl leading-tight mb-2">
                        {formData.gameName || selectedGame.name}
                      </h3>
                     
                                           {/* Version Info */}
                      {selectedVersion && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Package className="w-4 h-4 text-vibrant-orange" />
                          <span>{selectedVersion.version.name}</span>
                        </div>
                      )}
                      
                      {/* Alternate Name - Desktop */}
                      {formData.customTitle && formData.customTitle !== selectedGame.name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Type className="w-4 h-4 text-vibrant-orange" />
                          <span className="italic">{formData.customTitle}</span>
                        </div>
                       )}
                      
                      {/* Game Stats */}
                      {formData.gameDetails && (
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                          {formData.gameDetails.minPlayers && formData.gameDetails.maxPlayers && (
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1 text-vibrant-orange" />
                              <span>{formData.gameDetails.minPlayers}-{formData.gameDetails.maxPlayers}</span>
                            </div>
                          )}
                          {formData.gameDetails.playingTime && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-vibrant-orange" />
                              <span>{formData.gameDetails.playingTime} min</span>
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
                      
                      {/* Version Details */}
                      {selectedVersion && formData.gameDetails && (
                        <div className="space-y-1 text-xs text-gray-600">
                          {formData.gameDetails.yearPublished && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.yearPublished}</span>
                            </div>
                          )}
                          {formData.gameDetails.languages && formData.gameDetails.languages.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Languages className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.languages.join(', ')}</span>
                            </div>
                          )}
                          {formData.gameDetails.publishers && formData.gameDetails.publishers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-vibrant-orange" />
                              <span>{formData.gameDetails.publishers.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                   </div>
                 </div>
                 
                 {/* Edit Buttons */}
                 <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setShowVersions(!showVersions)}
                     className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                   >
                     {selectedVersion ? 'Change Version' : 'Select Version'}
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setShowTitleSelection(!showTitleSelection)}
                     className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                   >
                     {formData.customTitle ? 'Change Title' : 'Change Title'}
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         )}

        {/* Search Results */}
        {searchResults.length > 0 && showSearchResults && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.map((game) => (
              <Card
                key={game.id}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange ${
                  selectedGame?.id === game.id
                    ? 'border-2 border-vibrant-orange bg-vibrant-orange/5 shadow-md'
                    : 'border border-gray-200 hover:border-vibrant-orange'
                }`}
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
                      <h4 className={`font-medium text-sm leading-tight mb-1 ${
                        selectedGame?.id === game.id ? 'text-vibrant-orange' : 'text-dark-green'
                      }`}>
                        {game.name}
                      </h4>
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
                 {predefinedLanguages.map((language) => {
                   const hasLanguage = versions.some(version => 
                     version.version.languages?.some(lang => 
                       lang.toLowerCase() === language.toLowerCase()
                     )
                   )
                   if (!hasLanguage) return null
                   
                   return (
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
                   )
                 })}
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
                     <div className="flex items-center space-x-3">
                       <div className="w-12 h-12 overflow-hidden rounded-lg flex-shrink-0">
                         {version.version.thumbnail ? (
                           <img
                             src={version.version.thumbnail}
                             alt={version.version.name}
                             className="w-full h-full object-cover"
                           />
                         ) : (
                           <div className="w-full h-full bg-light-beige rounded flex items-center justify-center">
                             <Package className="w-6 h-6 text-dark-green" />
                           </div>
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <h4 className={`font-medium text-sm leading-tight mb-1 ${
                           selectedVersion?.version.id === version.version.id ? 'text-vibrant-orange' : 'text-dark-green'
                         }`}>
                           {version.version.name}
                         </h4>
                         <div className="space-y-1">
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
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </div>
         )}

                          {/* Title Selection - Integrated with Preview Card */}
         {selectedGame && showTitleSelection && (
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
             <div className="flex items-center justify-between mb-4">
               <h4 className="font-medium text-dark-green">Choose Title</h4>
               <span className="text-xs text-gray-500">
                 {selectedVersion?.suggestedAlternateName ? 'Suggested match available' : 'Primary title only'}
               </span>
             </div>
             
             <div className="max-h-64 overflow-y-auto space-y-2">
               {getTitleOptions().map((option, index) => (
                 <Card
                   key={index}
                   className={`cursor-pointer transition-all hover:shadow-md hover:border-vibrant-orange ${
                     selectedTitleVariant === option.title
                       ? 'border-2 border-vibrant-orange bg-vibrant-orange/5 shadow-md'
                       : 'border border-gray-200 hover:border-vibrant-orange'
                   }`}
                   onClick={() => handleTitleVariantSelect(option.title)}
                 >
                   <CardContent className="p-3">
                     <div className="flex items-center space-x-3">
                       <div className={`w-10 h-10 rounded flex items-center justify-center ${
                         option.isSuggested 
                           ? 'bg-vibrant-orange/20' 
                           : 'bg-light-beige'
                       }`}>
                         <Type className={`w-5 h-5 ${
                           option.isSuggested 
                             ? 'text-vibrant-orange' 
                             : 'text-dark-green'
                         }`} />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h4 className={`font-medium text-sm leading-tight ${
                           selectedTitleVariant === option.title ? 'text-vibrant-orange' : 'text-dark-green'
                         }`}>
                           {option.title}
                         </h4>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
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
