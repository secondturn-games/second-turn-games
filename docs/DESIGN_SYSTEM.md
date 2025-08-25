# Design System Documentation

## 🎯 Overview

The Second Turn Games design system provides consistent, accessible, and beautiful UI components that reflect our brand identity. This system ensures visual consistency across all pages and components while maintaining excellent user experience.

---

## 🎨 Brand Identity

### Core Values

- **Trustworthy** - Professional, reliable appearance
- **Community-Focused** - Welcoming, inclusive design
- **Game-Oriented** - Fun, engaging visual elements
- **Baltic Heritage** - Local, authentic feel

### Brand Personality

- **Friendly** - Warm colors, approachable typography
- **Professional** - Clean layouts, consistent spacing
- **Creative** - Playful accents, smooth animations
- **Accessible** - High contrast, readable text

---

## 🌈 Color Palette

### Primary Colors

```css
/* Dark Green - Primary Brand Color */
--dark-green-50: #F0F4F0    /* Lightest background */
--dark-green-100: #E1E9E1   /* Light background */
--dark-green-200: #C3D3C3   /* Border, subtle background */
--dark-green-300: #A5BDA5   /* Medium border, hover */
--dark-green-400: #87A787   /* Strong border, focus */
--dark-green-500: #29432B   /* Primary text, main brand */
--dark-green-600: #1F331F   /* Strong text, headings */
```

### Accent Colors

```css
/* Vibrant Orange - Call-to-Action */
--vibrant-orange-50: #FEF2F0    /* Lightest background */
--vibrant-orange-100: #FDE4E0   /* Light background */
--vibrant-orange-200: #FBC7BC   /* Border, subtle */
--vibrant-orange-300: #F8A395   /* Medium border */
--vibrant-orange-400: #F47A66   /* Strong border */
--vibrant-orange-500: #D95323   /* Primary CTA, buttons */
--vibrant-orange-600: #C44A1F   /* Hover state, focus */
```

### Supporting Colors

```css
/* Warm Yellow - Highlights & Gradients */
--warm-yellow-50: #FFFBEB     /* Lightest background */
--warm-yellow-100: #FEF3C7    /* Light background */
--warm-yellow-200: #FDE68A    /* Border, subtle */
--warm-yellow-300: #FCD34D    /* Medium border */
--warm-yellow-400: #F2C94C    /* Primary highlight */
--warm-yellow-500: #EAB308    /* Strong highlight */

/* Light Beige - Backgrounds & Cards */
--light-beige-50: #F7F8F4     /* Lightest background */
--light-beige-100: #F0F2E9    /* Light background */
--light-beige-200: #E6EAD7    /* Primary background */
--light-beige-300: #D8DCC8    /* Border, subtle */
```

### Usage Guidelines

- **Primary Text**: `text-dark-green-600` for headings, `text-dark-green-500` for body
- **Call-to-Actions**: `bg-vibrant-orange-500` for primary buttons
- **Backgrounds**: `bg-light-beige` for main backgrounds, `bg-white` for cards
- **Accents**: `text-warm-yellow-400` for highlights, ratings
- **Borders**: `border-light-beige-200` for subtle borders, `border-dark-green-300` for strong borders

---

## 🔤 Typography

### Font Families

```css
/* Display Font - Headings */
--font-display: "Righteous", cursive;
/* Used for: Page titles, hero text, brand elements */

/* Body Font - Content */
--font-sans: "Roboto", sans-serif;
/* Used for: Body text, buttons, navigation, forms */
```

### Font Weights

```css
/* Roboto Weights */
--font-light: 300      /* Subtle text, captions */
--font-normal: 400     /* Body text, labels */
--font-medium: 500     /* Emphasis, buttons */
--font-semibold: 600   /* Subheadings, strong text */
--font-bold: 700       /* Headings, important text */

/* Righteous Weight */
--font-display: 400    /* All display text */
```

### Type Scale

```css
/* Heading Sizes */
--text-h1: 4rem/5rem/6rem     /* 64px/80px/96px */
--text-h2: 3rem/4rem          /* 48px/64px */
--text-h3: 2rem/3rem          /* 32px/48px */
--text-h4: 1.25rem/2rem       /* 20px/32px */

/* Body Sizes */
--text-body: 1rem/1.125rem    /* 16px/18px */
--text-large: 1.125rem/1.25rem /* 18px/20px */
--text-small: 0.875rem        /* 14px */
```

### Usage Examples

```typescript
// Page Headings
<h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-dark-green-600">
  Welcome to Second Turn Games
</h1>

// Section Headings
<h2 className="text-2xl md:text-3xl font-semibold text-dark-green-600">
  Browse Games
</h2>

// Body Text
<p className="text-base md:text-lg text-dark-green-500">
  Give your games a second life.
</p>

// Button Text
<button className="text-lg font-semibold">
  Get Started
</button>
```

---

## 🎭 Shadows & Depth

### Shadow System

```css
/* Shadow Utilities */
--shadow-soft: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
--shadow-medium: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-strong: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
```

### Usage Guidelines

- **Cards**: `shadow-soft` by default, `hover:shadow-medium` on hover
- **Buttons**: `shadow-soft` by default, `hover:shadow-medium` on hover
- **Modals**: `shadow-strong` for elevated content
- **Navigation**: `shadow-soft` for subtle depth

### Implementation

```typescript
// Card with hover effect
<div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-shadow duration-200">
  {/* Card content */}
</div>

// Button with shadow
<button className="shadow-soft hover:shadow-medium transition-shadow duration-200">
  Action Button
</button>
```

---

## 🔘 Buttons

### Button Variants

```typescript
// Primary Button (Orange)
const primaryButton =
  "px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium font-medium";

// Secondary Button (Dark Green Border)
const secondaryButton =
  "px-6 py-3 rounded-2xl border-2 border-dark-green-300 text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-700 transition-all duration-200 hover:scale-105 font-medium shadow-soft hover:shadow-medium bg-white";

// Large Button (Hero sections)
const largeButton = "px-8 py-4 rounded-2xl font-semibold text-lg";
```

### Button Sizes

- **Small**: `px-4 py-2` - For inline actions, form buttons
- **Medium**: `px-6 py-3` - For navigation, primary actions
- **Large**: `px-8 py-4` - For hero sections, main CTAs

### Button States

```typescript
// Default state
<button className="px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white font-medium shadow-soft">
  Default Button
</button>

// Hover state (automatic with Tailwind)
<button className="px-6 py-3 rounded-2xl bg-vibrant-orange-500 hover:bg-vibrant-orange-600 text-white font-medium shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-105">
  Hover Button
</button>

// Focus state
<button className="px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white font-medium shadow-soft focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:ring-offset-2">
  Focus Button
</button>
```

---

## 🃏 Cards

### Card Variants

```typescript
// Game Card
const gameCard =
  "bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02] overflow-hidden border border-light-beige-200";

// Profile Card
const profileCard =
  "bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-shadow duration-200";

// Feature Card
const featureCard =
  "bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 text-center";

// Info Card
const infoCard =
  "bg-light-beige-50 border border-light-beige-200 rounded-lg px-3 py-2";
```

### Card Usage

```typescript
// Game listing card
<div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02] overflow-hidden border border-light-beige-200">
  <div className="p-4 space-y-3">
    <h3 className="font-semibold text-dark-green-600 text-lg">Game Title</h3>
    <p className="text-dark-green-500">Game description</p>
  </div>
</div>

// Feature highlight card
<div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 text-center">
  <div className="w-16 h-16 bg-vibrant-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
    {/* Icon */}
  </div>
  <h3 className="text-xl font-semibold text-dark-green-600 mb-2">Feature Title</h3>
  <p className="text-dark-green-500">Feature description</p>
</div>
```

---

## 📝 Forms

### Form Elements

```typescript
// Input Field
const inputField =
  "w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200";

// Label
const label = "block text-sm font-medium text-dark-green-500 mb-2";

// Form Group
const formGroup = "space-y-4";

// Error Message
const errorMessage = "text-red-600 text-sm mt-1";
```

### Form Implementation

```typescript
// Complete form field
<div className="space-y-4">
  <label className="block text-sm font-medium text-dark-green-500 mb-2">
    Game Title *
  </label>
  <input
    type="text"
    placeholder="e.g., Catan, Ticket to Ride"
    className="w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200"
  />
  {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
</div>
```

---

## 🎬 Animations & Transitions

### Transition Classes

```typescript
// Hover effects
const hoverEffects = "hover:scale-105 transition-transform duration-200";

// Shadow transitions
const shadowTransitions = "hover:shadow-medium transition-shadow duration-200";

// Color transitions
const colorTransitions = "transition-colors duration-200";

// All transitions
const allTransitions = "transition-all duration-200";
```

### Animation Usage

```typescript
// Button with multiple hover effects
<button className="px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium">
  Animated Button
</button>

// Card with hover animation
<div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02]">
  {/* Card content */}
</div>

// Smooth color transition
<div className="text-dark-green-600 hover:text-vibrant-orange-600 transition-colors duration-200">
  Hover me
</div>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px    /* Small devices */
--breakpoint-md: 768px    /* Medium devices */
--breakpoint-lg: 1024px   /* Large devices */
--breakpoint-xl: 1280px   /* Extra large devices */
--breakpoint-2xl: 1536px  /* 2X large devices */
```

### Responsive Utilities

```typescript
// Responsive text sizing
const responsiveText = "text-base md:text-lg lg:text-xl";

// Responsive spacing
const responsiveSpacing = "py-8 md:py-12 lg:py-16";

// Responsive grid
const responsiveGrid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

// Responsive container
const responsiveContainer = "px-4 sm:px-6 lg:px-8";
```

### Mobile-First Implementation

```typescript
// Responsive button
<button className="px-4 py-2 md:px-6 md:py-3 rounded-2xl bg-vibrant-orange-500 text-white text-base md:text-lg font-medium">
  Responsive Button
</button>

// Responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  {/* Grid items */}
</div>

// Responsive spacing
<div className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

---

## 🎯 Component Patterns

### Hero Section

```typescript
const heroSection = "text-center space-y-6 mb-16";

// Implementation
<div className="text-center mb-16">
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-dark-green-600 mb-6">
    Hero Title
  </h1>
  <p className="text-xl md:text-2xl text-dark-green-500 mb-8 max-w-3xl mx-auto">
    Hero description
  </p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    {/* CTA buttons */}
  </div>
</div>;
```

### Feature Grid

```typescript
const featureGrid = "grid md:grid-cols-3 gap-8 mb-16";

// Implementation
<div className="grid md:grid-cols-3 gap-8 mb-16">
  <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 text-center">
    {/* Feature content */}
  </div>
  {/* More features */}
</div>;
```

### CTA Section

```typescript
const ctaSection =
  "bg-gradient-to-r from-vibrant-orange-500 to-warm-yellow-400 rounded-2xl p-8 text-white text-center";

// Implementation
<div className="bg-gradient-to-r from-vibrant-orange-500 to-warm-yellow-400 rounded-2xl p-8 text-white">
  <h2 className="text-3xl font-display font-bold mb-4">CTA Title</h2>
  <p className="text-xl mb-6 opacity-90">CTA description</p>
  <button className="inline-block px-8 py-4 bg-white text-vibrant-orange-600 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium">
    CTA Button
  </button>
</div>;
```

---

## 🔧 Design System Usage

### Importing Utilities

```typescript
// Import design system
import { colors, shadows, buttons, cards, forms, animations } from '@/lib/design-system';

// Use in components
<button className={buttons.primary}>
  Primary Action
</button>

<div className={cards.feature}>
  <h3>Feature Title</h3>
  <p>Feature description</p>
</div>
```

### Custom Components

```typescript
// Create consistent components
function PrimaryButton({ children, ...props }) {
  return (
    <button
      className="px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium font-medium"
      {...props}
    >
      {children}
    </button>
  );
}

// Usage
<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>;
```

---

## 📋 Design Checklist

### Before Implementation

- [ ] **Colors**: Using correct brand colors from palette
- [ ] **Typography**: Appropriate font family and weight
- [ ] **Spacing**: Consistent with design system scale
- [ ] **Shadows**: Appropriate depth for component type
- [ ] **Responsive**: Mobile-first approach implemented

### After Implementation

- [ ] **Hover States**: Smooth transitions and effects
- [ ] **Focus States**: Accessible keyboard navigation
- [ ] **Animations**: Smooth, purposeful motion
- [ ] **Consistency**: Matches existing components
- [ ] **Accessibility**: Proper contrast and ARIA labels

---

## 🚀 Best Practices

### Do's

- ✅ Use design system utilities consistently
- ✅ Implement hover and focus states
- ✅ Follow mobile-first responsive design
- ✅ Maintain consistent spacing and sizing
- ✅ Use semantic HTML with proper accessibility

### Don'ts

- ❌ Don't hardcode colors outside the system
- ❌ Don't skip hover/focus states
- ❌ Don't ignore mobile experience
- ❌ Don't create inconsistent spacing
- ❌ Don't forget accessibility considerations

---

## 📚 Resources

### Design Tools

- **Figma**: [Link to design files]
- **Storybook**: [Link to component library]
- **Brand Assets**: [Link to logo and images]

### Documentation

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Styling Guide](https://nextjs.org/docs/basic-features/built-in-css-support)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

_This design system is maintained by the Second Turn Games design and development team._
_For questions or updates, please contact the design team or create an issue._
