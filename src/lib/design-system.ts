/**
 * Second Turn Games Design System
 * 
 * This file documents the consistent design patterns, colors, shadows,
 * and component styles used throughout the project.
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const colors = {
  // Primary Brand Colors
  darkGreen: {
    50: 'bg-dark-green-50',
    100: 'bg-dark-green-100', 
    200: 'bg-dark-green-200',
    300: 'bg-dark-green-300',
    400: 'bg-dark-green-400',
    500: 'bg-dark-green-500',
    600: 'bg-dark-green-600',
  },
  
  vibrantOrange: {
    50: 'bg-vibrant-orange-50',
    100: 'bg-vibrant-orange-100',
    200: 'bg-vibrant-orange-200', 
    300: 'bg-vibrant-orange-300',
    400: 'bg-vibrant-orange-400',
    500: 'bg-vibrant-orange-500',
    600: 'bg-vibrant-orange-600',
  },
  
  warmYellow: {
    50: 'bg-warm-yellow-50',
    100: 'bg-warm-yellow-100',
    200: 'bg-warm-yellow-200',
    300: 'bg-warm-yellow-300', 
    400: 'bg-warm-yellow-400',
    500: 'bg-warm-yellow-500',
  },
  
  lightBeige: {
    50: 'bg-light-beige-50',
    100: 'bg-light-beige-100',
    200: 'bg-light-beige-200',
    300: 'bg-light-beige-300',
  },
  
  // Text Colors
  text: {
    primary: 'text-dark-green-600',
    secondary: 'text-dark-green-500', 
    muted: 'text-dark-green-400',
    accent: 'text-vibrant-orange-600',
    white: 'text-white',
  },
  
  // Border Colors
  border: {
    light: 'border-light-beige-200',
    medium: 'border-dark-green-300',
    dark: 'border-dark-green-400',
    accent: 'border-vibrant-orange-200',
  }
};

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const shadows = {
  soft: 'shadow-soft',
  medium: 'shadow-medium', 
  strong: 'shadow-strong',
  hover: 'hover:shadow-medium',
  transition: 'transition-shadow duration-200',
};

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const spacing = {
  container: 'max-w-6xl mx-auto px-4',
  section: 'py-12',
  card: 'p-6 md:p-8',
  button: 'px-4 py-2 md:px-6 md:py-3',
  buttonLarge: 'px-8 py-4',
};

export const layout = {
  card: 'bg-white rounded-2xl shadow-soft hover:shadow-medium transition-shadow duration-200',
  section: 'space-y-8',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8',
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  display: 'font-display font-bold',
  heading: 'font-semibold',
  body: 'font-medium',
  caption: 'text-sm',
  sizes: {
    h1: 'text-4xl md:text-5xl lg:text-6xl',
    h2: 'text-3xl md:text-4xl',
    h3: 'text-2xl md:text-3xl',
    h4: 'text-xl md:text-2xl',
    body: 'text-base md:text-lg',
    large: 'text-lg md:text-xl',
  },
};

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttons = {
  primary: 'px-4 py-2 rounded-2xl bg-vibrant-orange-500 text-white hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium',
  secondary: 'px-4 py-2 rounded-2xl border-2 border-dark-green-300 text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-700 transition-all duration-200 hover:scale-105',
  large: 'px-8 py-4 rounded-2xl font-semibold text-lg',
  icon: 'flex items-center gap-2',
};

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export const cards = {
  // Game Card
  game: 'bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02] overflow-hidden',
  
  // Profile Card  
  profile: 'bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-shadow duration-200',
  
  // Feature Card
  feature: 'bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 text-center',
  
  // Info Card
  info: 'bg-light-beige-50 border border-light-beige-200 rounded-lg px-3 py-2',
};

// ============================================================================
// FORM STYLES
// ============================================================================

export const forms = {
  input: 'w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200',
  label: 'block text-sm font-medium text-dark-green-500 mb-2',
  group: 'space-y-4',
  error: 'text-red-600 text-sm mt-1',
};

// ============================================================================
// ANIMATIONS & TRANSITIONS
// ============================================================================

export const animations = {
  hover: 'hover:scale-105 transition-transform duration-200',
  shadow: 'hover:shadow-medium transition-shadow duration-200',
  color: 'transition-colors duration-200',
  all: 'transition-all duration-200',
};

// ============================================================================
// ICON STYLES
// ============================================================================

export const icons = {
  small: 'w-4 h-4',
  medium: 'w-5 h-5', 
  large: 'w-6 h-6',
  xlarge: 'w-8 h-8',
  circle: 'w-16 h-16 rounded-full flex items-center justify-center',
};

// ============================================================================
// COMMON COMPONENT PATTERNS
// ============================================================================

export const patterns = {
  // Hero Section
  hero: 'text-center space-y-6 mb-16',
  
  // Feature Grid
  features: 'grid md:grid-cols-3 gap-8 mb-16',
  
  // CTA Section
  cta: 'bg-gradient-to-r from-vibrant-orange-500 to-warm-yellow-400 rounded-2xl p-8 text-white text-center',
  
  // Page Header
  pageHeader: 'text-center mb-12',
  
  // Content Section
  content: 'space-y-8',
  
  // Status Message
  status: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium',
};

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export const responsive = {
  container: 'px-4 sm:px-6 lg:px-8',
  text: 'text-base md:text-lg lg:text-xl',
  spacing: 'py-8 md:py-12 lg:py-16',
  grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};
