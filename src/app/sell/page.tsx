import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SellPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-dark-green-600 mb-4">
            Sell Your Game
          </h1>
          <p className="text-xl text-dark-green-500">
            Turn your unused games into cash. Easy listing and secure transactions.
          </p>
        </div>

        {/* Sell Form */}
        <div className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200">
          <div className="space-y-8">
            {/* Game Information */}
            <div>
              <h3 className="text-xl font-semibold text-dark-green-600 mb-4">Game Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-green-500 mb-2">Game Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Catan, Ticket to Ride"
                    className="w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-green-500 mb-2">Category *</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200">
                    <option value="">Select Category</option>
                    <option value="board-game">Board Game</option>
                    <option value="card-game">Card Game</option>
                    <option value="party-game">Party Game</option>
                    <option value="strategy">Strategy Game</option>
                    <option value="family">Family Game</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-green-500 mb-2">Condition *</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200">
                    <option value="">Select Condition</option>
                    <option value="new">New - Never played</option>
                    <option value="like-new">Like New - Excellent condition</option>
                    <option value="good">Good - Minor wear, complete</option>
                    <option value="fair">Fair - Some wear, may be incomplete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-green-500 mb-2">Price (€) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="25.00"
                    className="w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark-green-500 mb-2">Description</label>
              <textarea
                rows={4}
                placeholder="Describe your game, any missing pieces, special features, etc."
                className="w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200 resize-none"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-dark-green-500 mb-2">Photos</label>
              <div className="border-2 border-dashed border-light-beige-300 rounded-lg p-8 text-center hover:border-vibrant-orange-300 transition-colors duration-200">
                <svg className="w-12 h-12 text-light-beige-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-dark-green-500 mb-2">
                  <span className="font-medium text-vibrant-orange-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-dark-green-400">PNG, JPG up to 10MB</p>
              </div>
            </div>

            {/* Location & Contact */}
            <div>
              <h3 className="text-xl font-semibold text-dark-green-600 mb-4">Location & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-green-500 mb-2">City *</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200">
                    <option value="">Select City</option>
                    <option value="tallinn">Tallinn, Estonia</option>
                    <option value="riga">Riga, Latvia</option>
                    <option value="vilnius">Vilnius, Lithuania</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-green-500 mb-2">Preferred Contact Method</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200">
                    <option value="in-app">In-app messaging</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <button className="btn-primary px-6 py-3 text-base font-semibold">
                List Your Game
              </button>
              <p className="text-sm text-dark-green-400 mt-3">
                By listing your game, you agree to our terms of service and community guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-vibrant-orange-50 to-warm-yellow-50 rounded-2xl p-8 border border-vibrant-orange-100">
          <h3 className="text-xl font-semibold text-dark-green-600 mb-4 text-center">Tips for a Great Listing</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-vibrant-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-vibrant-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-dark-green-600 mb-2">Great Photos</h4>
              <p className="text-sm text-dark-green-500">Clear, well-lit photos show the true condition of your game.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-warm-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-warm-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-dark-green-600 mb-2">Honest Description</h4>
              <p className="text-sm text-dark-green-500">Be upfront about any missing pieces or wear and tear.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-dark-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-dark-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="font-medium text-dark-green-600 mb-2">Fair Pricing</h4>
              <p className="text-sm text-dark-green-500">Research similar games to set a competitive price.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
