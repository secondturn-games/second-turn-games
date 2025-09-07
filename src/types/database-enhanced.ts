export interface Database {
  public: {
    Tables: {
      game_listings: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          negotiable: boolean
          price_notes: string | null
          
          // BGG Integration
          bgg_game_id: string | null
          bgg_version_id: string | null
          game_name: string | null
          game_image_url: string | null
          version_name: string | null
          version_image_url: string | null
          custom_title: string | null
          suggested_alternate_name: string | null
          
          // Game Details
          min_players: number | null
          max_players: number | null
          playing_time: number | null
          min_age: number | null
          year_published: number | null
          languages: string[] | null
          publishers: string[] | null
          designers: string[] | null
          bgg_rank: number | null
          bgg_rating: number | null
          
          // Game Condition
          box_condition: string | null
          box_description: string | null
          completeness: string | null
          missing_description: string | null
          component_condition: string | null
          component_condition_description: string | null
          extras: string[] | null
          extras_description: string | null
          photo_urls: string[] | null
          photo_notes: string | null
          
          // Shipping
          pickup_enabled: boolean
          pickup_country: string | null
          pickup_local_area: string | null
          pickup_meeting_details: string | null
          parcel_locker_enabled: boolean
          parcel_locker_price_type: string | null
          parcel_locker_price: number | null
          parcel_locker_countries: string[] | null
          parcel_locker_country_prices: Record<string, string> | null
          shipping_notes: string | null
          
          // Location
          location: string | null
          country: string | null
          local_area: string | null
          
          // Metadata
          user_id: string
          created_at: string
          updated_at: string
          is_active: boolean
          views: number
          favorites: number
          
          // Legacy fields
          condition: string | null
          image_url: string | null
          genre: string | null
          player_count: string | null
          age_range: string | null
          language: string | null
          expansion: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          negotiable?: boolean
          price_notes?: string | null
          
          // BGG Integration
          bgg_game_id?: string | null
          bgg_version_id?: string | null
          game_name?: string | null
          game_image_url?: string | null
          version_name?: string | null
          version_image_url?: string | null
          custom_title?: string | null
          suggested_alternate_name?: string | null
          
          // Game Details
          min_players?: number | null
          max_players?: number | null
          playing_time?: number | null
          min_age?: number | null
          year_published?: number | null
          languages?: string[] | null
          publishers?: string[] | null
          designers?: string[] | null
          bgg_rank?: number | null
          bgg_rating?: number | null
          
          // Game Condition
          box_condition?: string | null
          box_description?: string | null
          completeness?: string | null
          missing_description?: string | null
          component_condition?: string | null
          component_condition_description?: string | null
          extras?: string[] | null
          extras_description?: string | null
          photo_urls?: string[] | null
          photo_notes?: string | null
          
          // Shipping
          pickup_enabled?: boolean
          pickup_country?: string | null
          pickup_local_area?: string | null
          pickup_meeting_details?: string | null
          parcel_locker_enabled?: boolean
          parcel_locker_price_type?: string | null
          parcel_locker_price?: number | null
          parcel_locker_countries?: string[] | null
          parcel_locker_country_prices?: Record<string, string> | null
          shipping_notes?: string | null
          
          // Location
          location?: string | null
          country?: string | null
          local_area?: string | null
          
          // Metadata
          user_id: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          views?: number
          favorites?: number
          
          // Legacy fields
          condition?: string | null
          image_url?: string | null
          genre?: string | null
          player_count?: string | null
          age_range?: string | null
          language?: string | null
          expansion?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          negotiable?: boolean
          price_notes?: string | null
          
          // BGG Integration
          bgg_game_id?: string | null
          bgg_version_id?: string | null
          game_name?: string | null
          game_image_url?: string | null
          version_name?: string | null
          version_image_url?: string | null
          custom_title?: string | null
          suggested_alternate_name?: string | null
          
          // Game Details
          min_players?: number | null
          max_players?: number | null
          playing_time?: number | null
          min_age?: number | null
          year_published?: number | null
          languages?: string[] | null
          publishers?: string[] | null
          designers?: string[] | null
          bgg_rank?: number | null
          bgg_rating?: number | null
          
          // Game Condition
          box_condition?: string | null
          box_description?: string | null
          completeness?: string | null
          missing_description?: string | null
          component_condition?: string | null
          component_condition_description?: string | null
          extras?: string[] | null
          extras_description?: string | null
          photo_urls?: string[] | null
          photo_notes?: string | null
          
          // Shipping
          pickup_enabled?: boolean
          pickup_country?: string | null
          pickup_local_area?: string | null
          pickup_meeting_details?: string | null
          parcel_locker_enabled?: boolean
          parcel_locker_price_type?: string | null
          parcel_locker_price?: number | null
          parcel_locker_countries?: string[] | null
          parcel_locker_country_prices?: Record<string, string> | null
          shipping_notes?: string | null
          
          // Location
          location?: string | null
          country?: string | null
          local_area?: string | null
          
          // Metadata
          user_id?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          views?: number
          favorites?: number
          
          // Legacy fields
          condition?: string | null
          image_url?: string | null
          genre?: string | null
          player_count?: string | null
          age_range?: string | null
          language?: string | null
          expansion?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          clerk_id: string
          email: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          bio: string | null
          location: string | null
          phone: string | null
          avatar_url: string | null
          email_notifications: boolean
          sms_notifications: boolean
          language: string
          favorite_genres: string[]
          game_collection: string[]
          total_listings: number
          total_sales: number
          is_verified: boolean
          trust_score: number
          created_at: string
          updated_at: string
          last_active: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          avatar_url?: string | null
          email_notifications?: boolean
          sms_notifications?: boolean
          language?: string
          favorite_genres?: string[]
          game_collection?: string[]
          total_listings?: number
          total_sales?: number
          is_verified?: boolean
          trust_score?: number
          created_at?: string
          updated_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          avatar_url?: string | null
          email_notifications?: boolean
          sms_notifications?: boolean
          language?: string
          favorite_genres?: string[]
          game_collection?: string[]
          total_listings?: number
          total_sales?: number
          is_verified?: boolean
          trust_score?: number
          created_at?: string
          updated_at?: string
          last_active?: string
        }
      }
    }
  }
}
