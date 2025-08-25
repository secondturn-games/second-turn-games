import type { Metadata } from "next";
import { Righteous, Roboto } from "next/font/google";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

const righteous = Righteous({
  subsets: ["latin"],
  variable: "--font-righteous",
  weight: "400",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Second Turn Games",
  description: "Give your games a second life - Buy and sell used board games in the Baltics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#D95323',
          colorText: '#29432B',
          colorTextSecondary: '#87A787',
          colorBackground: '#F7F8F4',
          colorInputBackground: '#F7F8F4',
          colorBorder: '#E6EAD7',
          borderRadius: '1rem',
                            fontFamily: 'var(--font-roboto), sans-serif',
        },
        elements: {
          formButtonPrimary: 'bg-vibrant-orange-500 hover:bg-vibrant-orange-600 text-white font-medium rounded-2xl px-6 py-3 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium',
          formButtonSecondary: 'border-2 border-dark-green-300 text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-700 font-medium rounded-2xl px-6 py-3 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium bg-white',
          formInput: 'rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200',
          formLabel: 'text-sm font-medium text-dark-green-500',
        }
      }}
    >
              <html lang="en" className={`${righteous.variable} ${roboto.variable}`}>
        <body className="bg-light-beige text-dark-green font-sans min-h-screen">
          <header className="border-b border-dark-green/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              {/* Logo / Brand */}
              <div className="flex items-center gap-3 group">
                <Link href="/" className="relative" aria-label="Second Turn Games - Home">
                  <span className="text-2xl md:text-3xl font-display text-dark-green-600 group-hover:text-vibrant-orange-600 transition-colors duration-300">
                    Second Turn
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-vibrant-orange-500 to-warm-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true" />
                </Link>
                <span className="hidden md:inline text-sm text-dark-green-500 group-hover:text-dark-green-600 transition-colors duration-300">
                  Give your games a second life
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
                <Link href="/" className="text-dark-green-600 hover:text-vibrant-orange-600 font-medium transition-colors duration-200 relative group" aria-current={typeof window !== 'undefined' && window.location.pathname === '/' ? 'page' : undefined}>
                  Browse Games
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-vibrant-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" aria-hidden="true" />
                </Link>

                <SignedOut>
                  <SignInButton mode="modal">
                    <div className="text-dark-green-600 hover:text-vibrant-orange-600 font-medium transition-colors duration-200 relative group cursor-pointer">
                      Profile
                    </div>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/profile" className="text-dark-green-600 hover:text-vibrant-orange-600 font-medium transition-colors duration-200 relative group">
                    Profile
                  </Link>
                </SignedIn>
              </nav>

              {/* Auth controls */}
              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-6 py-3 rounded-2xl border-2 border-dark-green-300 text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-700 transition-all duration-200 hover:scale-105 font-medium shadow-soft hover:shadow-medium bg-white">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium font-medium">
                      Join
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <Link href="/sell" className="px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium flex items-center gap-2 font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    List a Game
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
