export interface ListingFormData {
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
    activeFilter: 'box' | 'components' | 'extras' | 'photos' | null
    boxCondition: string | null
    boxDescription: string | null
    completeness: string | null
    missingDescription: string | null
    componentCondition: string | null
    componentConditionDescription: string | null
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
    pickup: {
      enabled: boolean
      country: string | null
      localArea: string | null
      meetingDetails: string | null
    }
    parcelLocker: {
      enabled: boolean
      priceType: 'included' | 'separate' | null
      price: string | null
      countries: string[]
      countryPrices: Record<string, string>
    }
    notes: string | null
  } | null
}

export type ActiveSection = 'versions' | 'condition' | 'price' | 'shipping' | null

export interface UserProfile {
  localArea: string | null
  country: string | null
}


