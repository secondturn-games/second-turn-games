import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-dark-green-600 mb-6">
            Welcome to Second Turn Games
          </h1>
          <p className="text-xl md:text-2xl text-dark-green-500 mb-8 max-w-3xl mx-auto">
            Give your games a second life. Buy and sell used board games, card games, and more in the Baltics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/games" 
              className="px-8 py-4 rounded-2xl bg-vibrant-orange-500 text-white text-lg font-semibold hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium"
            >
              Browse Games
            </Link>
            <Link 
              href="/sell" 
              className="px-8 py-4 rounded-2xl border-2 border-dark-green-300 text-dark-green-600 text-lg font-semibold hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-700 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium bg-white"
            >
              Sell a Game
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200">
            <div className="w-16 h-16 bg-vibrant-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-vibrant-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark-green-600 mb-2">Find Great Games</h3>
            <p className="text-dark-green-500">Discover amazing board games, card games, and more from local sellers.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200">
            <div className="w-16 h-16 bg-warm-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warm-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark-green-600 mb-2">Sell Your Games</h3>
            <p className="text-dark-green-500">Turn your unused games into cash. Easy listing and secure transactions.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200">
            <div className="w-16 h-16 bg-dark-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dark-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark-green-600 mb-2">Community Driven</h3>
            <p className="text-dark-green-500">Join a community of game enthusiasts in the Baltics.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-vibrant-orange-500 to-warm-yellow-400 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 opacity-90">Join thousands of gamers buying and selling in the Baltics.</p>
          <Link 
            href="/games" 
            className="inline-block px-8 py-4 bg-white text-vibrant-orange-600 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium"
          >
            Start Browsing Games
          </Link>
        </div>
      </div>
    </div>
  );
}
