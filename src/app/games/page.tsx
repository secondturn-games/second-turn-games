import { GameCard } from '@/components/ui/game-card';

// Sample data for demonstration
const sampleGames = [
  {
    id: '1',
    title: 'Catan',
    price: 25.00,
    condition: 'good' as const,
    imageUrl: undefined,
    seller: { name: 'GameMaster', rating: 5 },
    location: 'Tallinn',
    category: 'Board Game'
  },
  {
    id: '2',
    title: 'Ticket to Ride: Europe',
    price: 30.00,
    condition: 'like-new' as const,
    imageUrl: undefined,
    seller: { name: 'BoardGameLover', rating: 4 },
    location: 'Riga',
    category: 'Board Game'
  },
  {
    id: '3',
    title: 'Pandemic',
    price: 20.00,
    condition: 'fair' as const,
    imageUrl: undefined,
    seller: { name: 'StrategyFan', rating: 5 },
    location: 'Vilnius',
    category: 'Board Game'
  },
  {
    id: '4',
    title: 'Carcassonne',
    price: 18.00,
    condition: 'good' as const,
    imageUrl: undefined,
    seller: { name: 'MedievalGamer', rating: 4 },
    location: 'Tallinn',
    category: 'Board Game'
  },
  {
    id: '5',
    title: '7 Wonders',
    price: 35.00,
    condition: 'new' as const,
    imageUrl: undefined,
    seller: { name: 'CivilizationFan', rating: 5 },
    location: 'Riga',
    category: 'Card Game'
  },
  {
    id: '6',
    title: 'Dixit',
    price: 22.00,
    condition: 'good' as const,
    imageUrl: undefined,
    seller: { name: 'CreativeMind', rating: 4 },
    location: 'Vilnius',
    category: 'Party Game'
  }
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-dark-green-600 mb-4">
            Browse Games
          </h1>
          <p className="text-xl text-dark-green-500">
            Discover amazing games from local sellers in the Baltics
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search games, sellers, or categories..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select className="px-4 py-3 rounded-xl border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200">
              <option value="">All Categories</option>
              <option value="board-game">Board Games</option>
              <option value="card-game">Card Games</option>
              <option value="party-game">Party Games</option>
              <option value="strategy">Strategy Games</option>
              <option value="family">Family Games</option>
            </select>

            {/* Condition Filter */}
            <select className="px-4 py-3 rounded-xl border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200">
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>

            {/* Price Range */}
            <select className="px-4 py-3 rounded-xl border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200">
              <option value="">All Prices</option>
              <option value="0-20">Under €20</option>
              <option value="20-40">€20 - €40</option>
              <option value="40-60">€40 - €60</option>
              <option value="60+">Over €60</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-dark-green-500">
            Showing <span className="font-semibold text-dark-green-600">{sampleGames.length}</span> games
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-green-500">Sort by:</span>
            <select className="text-sm border-none bg-transparent text-dark-green-600 focus:outline-none focus:ring-0">
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sampleGames.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 rounded-2xl border-2 border-dark-green-300 text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-700 transition-all duration-200 hover:scale-105 font-semibold">
            Load More Games
          </button>
        </div>
      </div>
    </div>
  );
}
