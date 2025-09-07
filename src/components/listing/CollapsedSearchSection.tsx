"use client"

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { BGGGameDetails } from '@/lib/bgg'

interface CollapsedSearchSectionProps {
  selectedGame: BGGGameDetails | null
  onSearchAgain: () => void
}

export function CollapsedSearchSection({ selectedGame, onSearchAgain }: CollapsedSearchSectionProps) {
  if (!selectedGame) return null

  return (
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
          onClick={onSearchAgain}
          className="text-xs h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Search Again
        </Button>
      </div>
    </div>
  )
}


