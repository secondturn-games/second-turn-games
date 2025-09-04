export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          condition: string
          country: string | null
          localArea: string | null
          imageUrl: string | null
          genre: string | null
          playerCount: string | null
          ageRange: string | null
          language: string | null
          expansion: boolean
          userId: string
          createdAt: string
          updatedAt: string
          isActive: boolean
          views: number
          favorites: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          condition: string
          location?: string | null
          imageUrl?: string | null
          genre?: string | null
          playerCount?: string | null
          ageRange?: string | null
          language?: string | null
          expansion?: boolean
          userId: string
          createdAt?: string
          updatedAt?: string
          isActive?: boolean
          views?: number
          favorites?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          condition?: string
          location?: string | null
          imageUrl?: string | null
          genre?: string | null
          playerCount?: string | null
          ageRange?: string | null
          language?: string | null
          expansion?: boolean
          userId?: string
          createdAt?: string
          updatedAt?: string
          isActive?: boolean
          views?: number
          favorites?: number
        }
      }
      user_profiles: {
        Row: {
          id: string
          clerkId: string
          email: string
          firstName: string | null
          lastName: string | null
          displayName: string | null
          bio: string | null
          country: string | null
          localArea: string | null
          phone: string | null
          avatarUrl: string | null
          emailNotifications: boolean
          smsNotifications: boolean
          language: string
          favoriteGenres: string[]
          gameCollection: string[]
          totalListings: number
          totalSales: number
          isVerified: boolean
          trustScore: number
          createdAt: string
          updatedAt: string
          lastActive: string
        }
        Insert: {
          id?: string
          clerkId: string
          email: string
          firstName?: string | null
          lastName?: string | null
          displayName?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          avatarUrl?: string | null
          emailNotifications?: boolean
          smsNotifications?: boolean
          language?: string
          favoriteGenres?: string[]
          gameCollection?: string[]
          totalListings?: number
          totalSales?: number
          isVerified?: boolean
          trustScore?: number
          createdAt?: string
          updatedAt?: string
          lastActive?: string
        }
        Update: {
          id?: string
          clerkId?: string
          email?: string
          firstName?: string | null
          lastName?: string | null
          displayName?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          avatarUrl?: string | null
          emailNotifications?: boolean
          smsNotifications?: boolean
          language?: string
          favoriteGenres?: string[]
          gameCollection?: string[]
          totalListings?: number
          totalSales?: number
          isVerified?: boolean
          trustScore?: number
          createdAt?: string
          updatedAt?: string
          lastActive?: string
        }
      }
      reviews: {
        Row: {
          id: string
          rating: number
          comment: string | null
          reviewerId: string
          reviewedUserId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          rating: number
          comment?: string | null
          reviewerId: string
          reviewedUserId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          rating?: number
          comment?: string | null
          reviewerId?: string
          reviewedUserId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
