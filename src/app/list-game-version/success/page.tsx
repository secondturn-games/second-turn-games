'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowLeft, Plus, Eye } from 'lucide-react'
import Image from 'next/image'

interface ListingData {
  id: string
  title: string
  price: number
  negotiable: boolean
  game_name: string
  game_image_url?: string
  version_name?: string
  box_condition?: string
  completeness?: string
  created_at: string
}

function ListingSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [listingData, setListingData] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get listing data from URL params or localStorage
    const listingId = searchParams.get('id')
    const listingTitle = searchParams.get('title')
    const listingPrice = searchParams.get('price')
    
    if (listingId && listingTitle && listingPrice) {
      setListingData({
        id: listingId,
        title: listingTitle,
        price: parseFloat(listingPrice),
        negotiable: searchParams.get('negotiable') === 'true',
        game_name: searchParams.get('game_name') || listingTitle,
        game_image_url: searchParams.get('game_image_url') || undefined,
        version_name: searchParams.get('version_name') || undefined,
        box_condition: searchParams.get('box_condition') || undefined,
        completeness: searchParams.get('completeness') || undefined,
        created_at: new Date().toISOString()
      })
    }
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!listingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">Listing Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn&apos;t find the listing details.</p>
            <Button onClick={() => router.push('/list-game-version')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Create Listing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Listing Created Successfully!</h1>
          <p className="text-lg text-gray-600">
            Your game listing is now live and visible to other users.
          </p>
        </div>

        {/* Listing Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-vibrant-orange" />
              Your Listing Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Game Image */}
              {listingData.game_image_url && (
                <div className="flex-shrink-0">
                  <Image
                    src={listingData.game_image_url}
                    alt={listingData.game_name}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              
              {/* Listing Details */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {listingData.title}
                </h3>
                
                {listingData.version_name && (
                  <p className="text-sm text-gray-600 mb-3">
                    {listingData.version_name}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl font-bold text-vibrant-orange">
                    €{listingData.price}
                  </span>
                  {listingData.negotiable && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                      Negotiable
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {listingData.box_condition && (
                    <p><span className="font-medium">Condition:</span> {listingData.box_condition}</p>
                  )}
                  {listingData.completeness && (
                    <p><span className="font-medium">Completeness:</span> {listingData.completeness}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/profile')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View All My Listings
          </Button>
          
          <Button
            onClick={() => router.push('/list-game-version')}
            className="flex items-center gap-2 bg-vibrant-orange hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Create Another Listing
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Your listing will be visible to other users and you can manage it from your profile page.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ListingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ListingSuccessContent />
    </Suspense>
  )
}
