'use client';

import { useUser } from '@clerk/nextjs';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show loading state during hydration
    return (
      <header className="border-b border-dark-green/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 group">
            <Link href="/" className="relative" aria-label="Second Turn Games - Home">
              <img 
                src="/nav-logo-mobile.svg" 
                alt="Second Turn Games" 
                className="h-8 w-8 md:hidden transition-transform duration-300 group-hover:scale-105"
              />
              <img 
                src="/nav-logo.svg" 
                alt="Second Turn Games" 
                className="hidden md:block h-10 lg:h-12 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-vibrant-orange-500 to-warm-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true" />
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for games..."
                className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-light-beige-200 bg-white text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 shadow-sm text-sm"
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-green-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Loading state for auth controls */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-dark-green/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 group">
          <Link href="/" className="relative" aria-label="Second Turn Games - Home">
            <img 
              src="/nav-logo-mobile.svg" 
              alt="Second Turn Games" 
              className="h-8 w-8 md:hidden transition-transform duration-300 group-hover:scale-105"
            />
            <img 
              src="/nav-logo.svg" 
              alt="Second Turn Games" 
              className="hidden md:block h-10 lg:h-12 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-vibrant-orange-500 to-warm-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true" />
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for games..."
              className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-light-beige-200 bg-white text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 shadow-sm text-sm"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-green-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
          {isLoaded && isSignedIn && (
            <Link href="/profile" className="text-dark-green-600 hover:text-vibrant-orange-600 font-medium transition-colors duration-200 relative group">
              Profile
            </Link>
          )}
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {isLoaded && !isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button className="btn-secondary">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary">
                  Join
                </button>
              </SignUpButton>
            </>
          )}

          {isLoaded && isSignedIn && (
            <>
              <Link href="/list-game-version" className="btn-primary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                List a Game
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
