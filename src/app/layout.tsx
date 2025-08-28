import type { Metadata } from "next";
import { Righteous, Manrope, Bebas_Neue } from "next/font/google";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
// import { PWAInstaller } from "@/components/pwa/pwa-installer";
import "./globals.css";

const righteous = Righteous({
  subsets: ["latin"],
  variable: "--font-righteous",
  weight: "400",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Second Turn Games",
  description: "Give your games a second life - Buy and sell used board games in the Baltics",
  // manifest: "/manifest.json", // Disabled in development
  metadataBase: new URL("https://second-turn-games.vercel.app"),
  // appleWebApp: { // Disabled in development
  //   capable: true,
  //   statusBarStyle: "default",
  //   title: "Second Turn Games",
  // },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://second-turn-games.vercel.app",
    title: "Second Turn Games",
    description: "Give your games a second life - Buy and sell used board games in the Baltics",
    siteName: "Second Turn Games",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Second Turn Games Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Second Turn Games",
    description: "Give your games a second life - Buy and sell used board games in the Baltics",
    images: ["/icon-512x512.png"],
  },
  // icons: { // Disabled in development - using public/favicon.ico instead
  //   icon: [
  //     { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
  //     { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
  //     { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
  //     { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
  //   ],
  //   apple: [
  //     { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  //   ],
  // },
};

// export const viewport = { // Disabled in development
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: false,
//   themeColor: "#D95323",
// };

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
          fontFamily: 'var(--font-manrope), sans-serif',
        },
        elements: {
          formButtonPrimary: 'bg-vibrant-orange hover:bg-vibrant-orange-600 text-white font-medium rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg',
          formButtonSecondary: 'border-2 border-dark-green-300 text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-600 font-medium rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md bg-white',
          formInput: 'rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-colors duration-200',
          formLabel: 'text-sm font-medium text-dark-green-500',
        }
      }}
    >
      <html lang="en" className={`${righteous.variable} ${manrope.variable} ${bebasNeue.variable}`}>
        <body className="bg-light-beige text-dark-green font-sans min-h-screen">
          <header className="border-b border-dark-green/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
              {/* Logo / Brand */}
              <div className="flex items-center gap-3 group">
                <Link href="/" className="relative" aria-label="Second Turn Games - Home">
                  {/* Mobile: Just the dice icon */}
                  <img 
                    src="/nav-logo-mobile.svg" 
                    alt="Second Turn Games" 
                    className="h-10 w-10 md:hidden transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Desktop: Full logo with text */}
                  <img 
                    src="/nav-logo.svg" 
                    alt="Second Turn Games" 
                    className="hidden md:block h-12 lg:h-16 transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-vibrant-orange-500 to-warm-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true" />
                </Link>
              </div>

              {/* Desktop Search Bar - Integrated in navbar */}
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
                    <button className="btn-secondary">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn-primary">
                      Join
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <Link href="/list-game" className="btn-primary flex items-center gap-2">
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

          {/* Mobile Search Bar - Below navbar, scrolls away naturally */}
          <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-light-beige-200 transition-all duration-200">
            <div className="mx-auto max-w-6xl px-3 py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for games..."
                  className="w-full px-3 py-2.5 pl-10 rounded-lg border-2 border-light-beige-200 bg-white text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 shadow-sm text-sm"
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
          </div>

          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          
          {/* PWA Installer - Disabled in development */}
          {/* <PWAInstaller /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
