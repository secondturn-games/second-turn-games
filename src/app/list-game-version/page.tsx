"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import { bggServiceClient } from '@/lib/bgg/bgg-service-client'
import type { BGGSearchResult, BGGGameDetails, LanguageMatchedVersion, LightweightSearchResult, EnhancedSearchResult } from '@/lib/bgg'

// Import our new components
import { GameSearch } from '@/components/listing/GameSearch'
import { CollapsedSearchSection } from '@/components/listing/CollapsedSearchSection'
import { VersionSelection } from '@/components/listing/VersionSelection'
import { GameConditionForm } from '@/components/listing/GameConditionForm'
import { PriceForm } from '@/components/listing/PriceForm'
import { ShippingForm } from '@/components/listing/ShippingForm'
import { ListingPreview } from '@/components/listing/ListingPreview'

// Import our hooks and types
import { useListingForm } from '@/components/listing/hooks/useListingForm'
import { useSectionToggle } from '@/components/listing/hooks/useSectionToggle'
import type { ListingFormData, UserProfile } from '@/components/listing/types'

const initialFormData: ListingFormData = {
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
}

function ListGameVersionContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [gameType, setGameType] = useState<'base-game' | 'expansion'>('base-game')
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(true)
  
  // Game selection state
  const [selectedGame, setSelectedGame] = useState<BGGGameDetails | null>(null)
  const [versions, setVersions] = useState<LanguageMatchedVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<LanguageMatchedVersion | null>(null)
  const [selectedTitleVariant, setSelectedTitleVariant] = useState<string>('main-title')
  const [showTitleSelection, setShowTitleSelection] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  
  // User profile data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoadingListing, setIsLoadingListing] = useState(false)
  const [loadingError, setLoadingError] = useState('')
  
  // Custom hooks
  const { formData, update, updateGameCondition, updatePrice, updateShipping, resetGameCondition } = useListingForm(initialFormData)
  const { activeSection, showVersions, showGameCondition, showPrice, showShipping, toggleSection, closeAllSections } = useSectionToggle()

  // Load listing data for edit mode
  useEffect(() => {
    const loadListingForEdit = async () => {
      if (!editId || !user?.id) return
      
      setIsLoadingListing(true)
      setLoadingError('')
      setIsEditMode(true)
      
      try {
        const response = await fetch(`/api/listings/get?id=${editId}`)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to load listing')
        }
        
        const listing = result.listing
        
        // Populate form data with existing listing
        update({
          bggGameId: listing.bgg_game_id,
          gameName: listing.game_name,
          gameImage: listing.game_image_url,
          bggVersionId: listing.bgg_version_id,
          versionName: listing.version_name,
          suggestedAlternateName: listing.suggested_alternate_name,
          versionImage: listing.version_image_url,
          customTitle: listing.custom_title,
          gameDetails: listing.game_details,
          gameCondition: listing.game_condition,
          price: {
            amount: listing.price?.toString() || null,
            negotiable: listing.negotiable || false,
            notes: listing.price_notes
          },
          shipping: listing.shipping
        })
        
        // Set selected game and version for display
        if (listing.game_name) {
          setSelectedGame({
            id: listing.bgg_game_id,
            name: listing.game_name,
            image: listing.game_image_url,
            thumbnail: listing.game_image_url,
            description: '',
            minplayers: listing.game_details?.minPlayers,
            maxplayers: listing.game_details?.maxPlayers,
            playingtime: listing.game_details?.playingTime,
            minage: listing.game_details?.minAge,
            yearpublished: listing.game_details?.yearPublished,
            designers: listing.game_details?.designers,
            rank: listing.game_details?.rank,
            rating: listing.game_details?.rating,
            weight: '',
            mechanics: [],
            categories: [],
            alternateNames: [],
            versions: [],
            type: 'boardgame',
            isExpansion: false,
            hasInboundExpansionLink: false
          })
          
          if (listing.bgg_version_id && listing.version_name) {
            setSelectedVersion({
              version: {
                id: listing.bgg_version_id,
                name: listing.version_name,
                image: listing.version_image_url,
                thumbnail: listing.version_image_url,
                yearpublished: listing.game_details?.yearPublished || '',
                languages: listing.game_details?.languages || [],
                publishers: listing.game_details?.publishers || [],
                productcode: '',
                width: '',
                length: '',
                depth: '',
                weight: '',
                primaryLanguage: undefined,
                isMultilingual: false,
                languageCount: 0,
                dimensions: undefined,
                weightInfo: undefined
              },
              suggestedAlternateName: listing.suggested_alternate_name,
              languageMatch: 'none',
              confidence: 0,
              reasoning: ''
            })
          }
        }
        
        setShowSearchResults(false)
        
      } catch (error) {
        console.error('Error loading listing for edit:', error)
        setLoadingError(error instanceof Error ? error.message : 'Failed to load listing')
      } finally {
        setIsLoadingListing(false)
      }
    }
    
    loadListingForEdit()
  }, [editId, user?.id, update])

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Loading user profile for:', user?.id)
        }
        
        if (!user?.id) {
          if (process.env.NODE_ENV === 'development') {
            console.log('No user ID available yet')
          }
          return
        }
        
        const supabase = createClient()
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('clerk_id', user.id)
          .single()
        
        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to load user profile:', {
              error,
              errorCode: error.code,
              errorMessage: error.message,
              errorDetails: error.details,
              errorHint: error.hint,
              userId: user.id
            })
          }
          
          // If user profile doesn't exist, try to sync it
          if (error.code === 'PGRST116') {
            if (process.env.NODE_ENV === 'development') {
              console.log('User profile not found - attempting to sync...')
            }
            
            try {
              const syncResponse = await fetch('/api/sync-user', { method: 'POST' })
              if (syncResponse.ok) {
                // Retry loading the profile after sync
                const { data: retryData, error: retryError } = await supabase
                  .from('user_profiles')
                  .select('localArea, country')
                  .eq('clerkId', user.id)
                  .single()
                
                if (!retryError && retryData) {
                  setUserProfile({
                    localArea: retryData.localArea || null,
                    country: retryData.country || null
                  })
                  if (process.env.NODE_ENV === 'development') {
                    console.log('User profile synced and loaded successfully')
                  }
                  return
                }
              }
            } catch (syncError) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Failed to sync user profile:', syncError)
              }
            }
            
            // Fallback to null values if sync fails
            setUserProfile({ localArea: null, country: null })
            return
          }
          
          return
        }
        
        setUserProfile({
          localArea: data?.local_area || null,
          country: data?.country || null
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log('User profile loaded successfully:', { localArea: data?.local_area, country: data?.country })
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading user profile:', error)
        }
        // Set default values on error
        setUserProfile({ localArea: null, country: null })
      }
    }
    
    loadUserProfile()
  }, [user?.id])

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
    
    // Priority 3: If no English versions, select most recent overall
    return versions.sort((a, b) => {
      const yearA = parseInt(a.version.yearpublished || '0')
      const yearB = parseInt(b.version.yearpublished || '0')
      return yearB - yearA
    })[0]
  }

  const handleGameSelect = async (game: LightweightSearchResult | EnhancedSearchResult) => {
    try {
      // Reset Game Condition data for new game
      resetGameCondition()
      closeAllSections()
      
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
        update({
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
      }
      
      // Update form data with game info
      update({
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
        // Scenario C: No suggested title - show title selection with primary title as default
        selectedTitle = selectedGame?.name || ''
        customTitle = null
        shouldShowTitleSelection = true
      }
    }
    
    setSelectedTitleVariant(selectedTitle)
    
    // Update form data with selected version
    update({
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
    closeAllSections()
    
    // Show title selection only when needed
    if (shouldShowTitleSelection) {
      setShowTitleSelection(true)
    }
  }

  // Form submission handler
  const handleSubmitListing = async () => {
    if (!user) {
      setSubmitError('You must be logged in to create a listing')
      return
    }

    // Basic validation
    if (!formData.bggGameId || !formData.gameName) {
      setSubmitError('Please select a game first')
      return
    }

    if (!formData.bggVersionId || !formData.versionName) {
      setSubmitError('Please select a game version')
      return
    }

    if (!formData.price?.amount) {
      setSubmitError('Please set a price for your listing')
      return
    }

    if (!formData.gameCondition?.boxCondition) {
      setSubmitError('Please specify the game condition')
      return
    }

    if (!formData.shipping?.pickup?.enabled && !formData.shipping?.parcelLocker?.enabled) {
      setSubmitError('Please select at least one shipping option')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const requestData = {
        // Basic info
        title: formData.customTitle || formData.gameName,
        price: parseFloat(formData.price.amount),
        negotiable: formData.price.negotiable,
        price_notes: formData.price.notes,
        
        // BGG Integration
        bgg_game_id: formData.bggGameId,
        bgg_version_id: formData.bggVersionId,
        game_name: formData.gameName,
        game_image_url: formData.gameImage,
        version_name: formData.versionName,
        version_image_url: formData.versionImage,
        custom_title: formData.customTitle,
        suggested_alternate_name: formData.suggestedAlternateName,
        
        // Game Details
        game_details: formData.gameDetails,
        
        // Game Condition
        game_condition: formData.gameCondition,
        
        // Shipping
        shipping: formData.shipping,
      }

      const url = isEditMode ? `/api/listings/update?id=${editId}` : '/api/listings/create'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (!response.ok) {
        // Show detailed validation errors if available
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((detail: { field: string; message: string }) => 
            `${detail.field}: ${detail.message}`
          ).join(', ')
          throw new Error(`Validation failed: ${errorMessages}`)
        }
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} listing`)
      }

      setSubmitSuccess(true)
      
      // Redirect to success page with listing details
      const successUrl = new URL('/list-game-version/success', window.location.origin)
      successUrl.searchParams.set('id', result.listing.id)
      successUrl.searchParams.set('title', formData.customTitle || formData.gameName)
      successUrl.searchParams.set('price', formData.price.amount.toString())
      successUrl.searchParams.set('negotiable', formData.price.negotiable.toString())
      successUrl.searchParams.set('game_name', formData.gameName)
      if (formData.gameImage) successUrl.searchParams.set('game_image_url', formData.gameImage)
      if (formData.versionName) successUrl.searchParams.set('version_name', formData.versionName)
      if (formData.gameCondition?.boxCondition) successUrl.searchParams.set('box_condition', formData.gameCondition.boxCondition)
      if (formData.gameCondition?.completeness) successUrl.searchParams.set('completeness', formData.gameCondition.completeness)
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        window.location.href = successUrl.toString()
      }, 1500)

    } catch (error) {
      console.error('Error submitting listing:', error)
      setSubmitError(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} listing`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleSection = (section: 'versions' | 'condition' | 'price' | 'shipping') => {
    // Initialize form data if needed
    if (section === 'condition' && !formData.gameCondition) {
      updateGameCondition({
        activeFilter: 'box', // Set 'box' as default
        boxCondition: null,
        boxDescription: null,
        completeness: null,
        missingDescription: null,
        componentCondition: null,
        componentConditionDescription: null,
        extras: [],
        extrasDescription: null,
        photos: [],
        photoNotes: null
      })
    } else if (section === 'price' && !formData.price) {
      updatePrice({
        amount: null,
        negotiable: false,
        notes: null
      })
    } else if (section === 'shipping' && !formData.shipping) {
      updateShipping({
        pickup: {
          enabled: false,
          country: userProfile?.country || null,
          localArea: userProfile?.localArea || null,
          meetingDetails: null
        },
        parcelLocker: {
          enabled: false,
          priceType: null,
          price: null,
          countries: [],
          countryPrices: {}
        },
        notes: null
      })
    }
    
    toggleSection(section)
  }

  const handleReset = () => {
    setSearchResults([])
    setSelectedGame(null)
    setVersions([])
    setSelectedVersion(null)
    setShowSearchResults(true)
    setShowTitleSelection(false)
    setSelectedLanguage('all')
    resetGameCondition()
    closeAllSections()
  }

  const handleTitleVariantSelect = (title: string) => {
    setSelectedTitleVariant(title)
    
    if (title === selectedGame?.name) {
      update({ customTitle: null })
    } else {
      update({ customTitle: title })
    }
    
    // Collapse title selection after selection
    setShowTitleSelection(false)
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

  // Loading state for edit mode
  if (isLoadingListing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listing for editing...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state for edit mode
  if (loadingError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">!</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Listing</h3>
            <p className="text-gray-600 mb-4">{loadingError}</p>
            <Button onClick={() => window.location.href = '/profile'}>
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-dark-green text-xl lg:text-2xl font-display">
            {isEditMode ? 'Edit Listing' : 'Sell a Game'}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isEditMode ? 'Update your game listing' : 'Give your game a second turn'}
          </p>
        </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Search - Only show when no game is selected */}
            {!selectedGame && (
              <>
                <GameSearch
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  gameType={gameType}
                  setGameType={setGameType}
                  onGameSelect={handleGameSelect}
                  onSearchResults={(results) => {
                    setSearchResults(results)
                    // Auto-select if only one result
                    if (results.length === 1) {
                      handleGameSelect(results[0])
                    }
                  }}
                  onSearchError={setSearchError}
                  onSearching={setIsSearching}
                  onReset={handleReset}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  searchError={searchError}
                />

              </>
            )}

            {/* Collapsed Search Section - Show when game is selected */}
            {selectedGame && (
              <CollapsedSearchSection
                selectedGame={selectedGame}
                onSearchAgain={handleReset}
              />
            )}

            {/* Listing Preview - Show when game is selected */}
            {selectedGame && (
              <ListingPreview
                formData={formData}
                selectedGame={selectedGame}
                selectedVersion={selectedVersion}
                versions={versions}
                activeSection={activeSection}
                onToggleSection={handleToggleSection}
              />
            )}

            {/* Version Selection */}
            {selectedGame && versions.length > 0 && showVersions && (
              <VersionSelection
                versions={versions}
                selectedVersion={selectedVersion}
                selectedLanguage={selectedLanguage}
                onVersionSelect={handleVersionSelect}
                onLanguageChange={setSelectedLanguage}
              />
            )}

            {/* Title Selection - Show when needed */}
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

            {/* Game Condition Form */}
            {selectedGame && showGameCondition && formData.gameCondition && (
              <GameConditionForm
                condition={formData.gameCondition}
                onUpdate={updateGameCondition}
              />
            )}

            {/* Price Form */}
            {selectedGame && showPrice && formData.price && (
              <PriceForm
                price={formData.price}
                onUpdate={updatePrice}
              />
            )}

            {/* Shipping Form */}
            {selectedGame && showShipping && formData.shipping && (
              <>
                <ShippingForm
                  shipping={formData.shipping}
                  userProfile={userProfile}
                  onUpdate={updateShipping}
                />
              </>
            )}

            {/* Submit Section */}
            {selectedGame && selectedVersion && (
              <div className="space-y-4">
                {/* Success Message */}
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 text-sm mb-2">✅ Listing Created Successfully!</h4>
                    <p className="text-xs text-green-600">
                      Your game listing has been created and is now live. Redirecting to your profile...
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 text-sm mb-2">❌ Error Creating Listing</h4>
                    <p className="text-xs text-red-600">{submitError}</p>
                  </div>
                )}

                {/* Submit Button */}
                {!submitSuccess && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 text-sm mb-3">Ready to publish your listing?</h4>
                    <p className="text-xs text-gray-600 mb-4">
                      Make sure you&apos;ve completed all sections: Game Condition, Price, and Shipping.
                    </p>
                    
                    <Button 
                      onClick={handleSubmitListing}
                      disabled={isSubmitting}
                      className="w-full bg-vibrant-orange hover:bg-orange-600 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isEditMode ? 'Updating Listing...' : 'Creating Listing...'}
                        </>
                      ) : (
                        isEditMode ? '💾 Update Listing' : '🚀 Publish Listing'
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Your listing will be visible to other users once published
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}

export default function ListGameVersionPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ListGameVersionContent />
    </Suspense>
  )
}
