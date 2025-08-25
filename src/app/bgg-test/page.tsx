import { BGGTest } from '@/components/bgg-test'

export default function BGGTestPage() {
  return (
    <div className="min-h-screen bg-light-green-50">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-righteous text-dark-green-800 text-center mb-8">
          BGG Service Test Page
        </h1>
        <p className="text-center text-dark-green-600 mb-8 max-w-2xl mx-auto">
          Test the BoardGameGeek API integration, search for games, and explore the service functionality.
        </p>
        <BGGTest />
      </div>
    </div>
  )
}
