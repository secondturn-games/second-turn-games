import Image from 'next/image';
import Link from 'next/link';

interface GameCardProps {
  id: string;
  title: string;
  price: number;
  negotiable?: boolean;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  imageUrl?: string;
  seller: {
    name: string;
    rating: number;
  };
  location: string;
  category: string;
}

const conditionColors = {
  new: 'bg-green-100 text-green-700 border-green-200',
  'like-new': 'bg-blue-100 text-blue-700 border-blue-200',
  good: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  fair: 'bg-orange-100 text-orange-700 border-orange-200',
};

const conditionLabels = {
  new: 'New',
  'like-new': 'Like New',
  good: 'Good',
  fair: 'Fair',
};

export function GameCard({ id, title, price, negotiable, condition, imageUrl, seller, location, category }: GameCardProps) {
  return (
    <Link href={`/games/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02] overflow-hidden border border-light-beige-200">
        {/* Image Section */}
        <div className="relative h-48 bg-light-beige-100 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-light-beige-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Condition Badge */}
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium border ${conditionColors[condition]}`}>
            {conditionLabels[condition]}
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-dark-green-600 text-white text-xs font-medium">
            {category}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-dark-green-600 text-lg leading-tight group-hover:text-vibrant-orange-600 transition-colors duration-200">
            {title}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-vibrant-orange-600">
                €{price.toFixed(2)}
              </span>
              {negotiable && (
                <span className="text-xs bg-vibrant-orange-100 text-vibrant-orange-700 px-2 py-1 rounded-full">
                  Negotiable
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < seller.rating ? 'text-warm-yellow-400' : 'text-light-beige-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>

          {/* Seller & Location */}
          <div className="flex items-center justify-between text-sm text-dark-green-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {seller.name}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
