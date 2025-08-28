# Second Turn Games - Design System

## Overview and Design Principles

Our design system prioritizes **compact efficiency** and **clean precision** over excessive whitespace and rounded aesthetics. We focus on:

- **Compact Layouts**: Minimal padding and margins for efficient use of space
- **Sharp Edges**: Reduced border radius for a more professional, less playful appearance
- **Tight Spacing**: 4px grid system for consistent, space-efficient layouts
- **Clear Hierarchy**: Strong visual separation without excessive breathing room
- **Modern Minimalism**: Clean lines and precise spacing for a trustworthy marketplace feel

## Typography

### Font Stack

- **Primary (Body)**: Manrope - Clean, readable, professional
- **Display (Headings)**: Righteous - Distinctive brand identity
- **Game Titles**: Bebas Neue - Strong, impactful for game names

### Scale (Compact)

- **h1**: 2rem (32px) - Page titles
- **h2**: 1.5rem (24px) - Section headers
- **h3**: 1.25rem (20px) - Subsection headers
- **h4**: 1.125rem (18px) - Card titles
- **h5**: 1rem (16px) - Small headers
- **h6**: 0.875rem (14px) - Captions
- **Body**: 0.875rem (14px) - Default text size
- **Small**: 0.75rem (12px) - Secondary text

## Color Palette

### Core Brand Colors

- **Dark Green** `#29432B` - Primary actions, navigation, text
- **Vibrant Orange** `#D95323` - CTAs, highlights, accents
- **Warm Yellow** `#F2C94C` - Warnings, trending indicators

### Extended Accent Colors

- **Teal** `#2DB7A3` - Success states, new features
- **Coral** `#FF6B6B` - Error states, destructive actions
- **Lavender** `#A78BFA` - Info, secondary actions

### Background & Surface

- **Background** `#E6EAD7` - Main page background
- **Surface** `#FFFFFF` - Cards, modals, inputs
- **Surface-50** `#F7F8F4` - Subtle backgrounds
- **Surface-100** `#F0F2E9` - Hover states

### Text Colors

- **Primary** `#1B1B1B` - Main text content
- **Secondary** `#6B7280` - Secondary text
- **Muted** `#9CA3AF` - Disabled, placeholder text

### Border Colors

- **Primary** `#E5E7EB` - Standard borders
- **Light** `#F3F4F6` - Subtle borders
- **Accent** `#D95323` - Focus states

## Spacing System (4px Grid - Compact)

### Base Units

- **xs**: 0.25rem (4px) - Minimal spacing
- **sm**: 0.5rem (8px) - Tight spacing
- **md**: 0.75rem (12px) - Standard spacing
- **lg**: 1rem (16px) - Comfortable spacing
- **xl**: 1.5rem (24px) - Section spacing
- **2xl**: 2rem (32px) - Page spacing

### Component Spacing

- **Button Padding**: `px-4 py-2` (16px × 8px)
- **Card Padding**: `p-4` (16px)
- **Input Padding**: `px-3 py-2` (12px × 8px)
- **Section Margins**: `my-6` (24px vertical)
- **Element Gaps**: `gap-3` (12px)

## Border Radius (Reduced)

### Radius Scale

- **xs**: 0.125rem (2px) - Subtle rounding
- **sm**: 0.25rem (4px) - Minimal rounding
- **md**: 0.375rem (6px) - Standard rounding
- **lg**: 0.5rem (8px) - Comfortable rounding
- **xl**: 0.75rem (12px) - Prominent rounding

### Component Radius

- **Buttons**: `rounded-md` (6px) - Clean, professional
- **Cards**: `rounded-lg` (8px) - Subtle depth
- **Inputs**: `rounded-md` (6px) - Consistent with buttons
- **Badges**: `rounded-sm` (4px) - Sharp, compact

## Shadows (Subtle)

### Shadow Scale

- **xs**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` - Minimal depth
- **sm**: `0 1px 3px 0 rgb(0 0 0 / 0.1)` - Subtle elevation
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1)` - Standard depth
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1)` - Prominent depth
- **soft**: `0 2px 4px 0 rgb(0 0 0 / 0.06)` - Gentle elevation
- **medium**: `0 4px 8px 0 rgb(0 0 0 / 0.08)` - Moderate depth

## Transitions & Animations

### Timing

- **Fast**: 150ms - Hover states, quick feedback
- **Normal**: 200ms - Standard interactions
- **Slow**: 300ms - Page transitions, loading states

### Easing

- **Standard**: `ease-out` - Natural, responsive feel
- **Hover**: `ease-out` - Quick, immediate feedback

## Component Library

### Buttons

#### Primary Button

```css
.btn-primary {
  @apply px-4 py-2 rounded-md bg-vibrant-orange-500 
         text-white font-medium text-sm
         hover:bg-vibrant-orange-600 
         transition-all duration-200
         shadow-soft hover:shadow-medium;
}
```

#### Secondary Button

```css
.btn-secondary {
  @apply px-4 py-2 rounded-md border-2 border-dark-green-300 
         text-dark-green-600 font-medium text-sm
         hover:bg-dark-green-50 hover:border-dark-green-400 
         hover:text-dark-green-700 transition-all duration-200
         shadow-soft hover:shadow-medium bg-white;
}
```

#### Ghost Button

```css
.btn-ghost {
  @apply px-4 py-2 rounded-md text-dark-green-600 
         font-medium text-sm hover:bg-dark-green-50 
         transition-all duration-200;
}
```

### Cards

#### Standard Card

```css
.card-standard {
  @apply bg-surface rounded-lg shadow-sm border border-border 
         p-4 transition-all duration-200;
}
```

#### Elevated Card

```css
.card-elevated {
  @apply bg-surface rounded-lg shadow-md border-0 
         p-4 hover:shadow-lg transition-all duration-200;
}
```

#### Interactive Card

```css
.card-interactive {
  @apply bg-surface rounded-lg shadow-sm border-2 border-transparent 
         p-4 hover:border-accent/20 hover:shadow-md 
         transition-all duration-200 cursor-pointer;
}
```

### Form Elements

#### Input

```css
.input-standard {
  @apply px-3 py-2 rounded-md border-2 border-border 
         focus:border-accent focus:ring-2 focus:ring-accent/20 
         transition-all duration-200 bg-surface text-sm;
}
```

#### Select

```css
.select-standard {
  @apply px-3 py-2 rounded-md border-2 border-border 
         focus:border-accent focus:ring-2 focus:ring-accent/20 
         transition-all duration-200 bg-surface text-sm;
}
```

#### Checkbox

```css
.checkbox-standard {
  @apply rounded-sm border-2 border-border text-accent 
         focus:ring-2 focus:ring-accent/20 transition-all duration-200;
}
```

### Badges

#### Primary Badge

```css
.badge-primary {
  @apply px-2 py-1 rounded-sm bg-dark-green-100 
         text-dark-green-700 text-xs font-medium;
}
```

#### Accent Badge

```css
.badge-accent {
  @apply px-2 py-1 rounded-sm bg-vibrant-orange-100 
         text-vibrant-orange-700 text-xs font-medium;
}
```

## Responsive Design

### Breakpoints

- **Mobile**: 0-767px - Compact, single column
- **Tablet**: 768-1023px - Two column layouts
- **Desktop**: 1024px+ - Multi-column, expanded layouts

### Mobile-First Approach

- Start with compact mobile design
- Expand spacing and layout for larger screens
- Maintain consistent component sizing across breakpoints

## Accessibility

### Focus States

- Clear focus rings with accent colors
- High contrast focus indicators
- Keyboard navigation support

### Color Contrast

- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- Color is never the only indicator

### Touch Targets

- Minimum 44px × 44px for interactive elements
- Adequate spacing between touch targets
- Clear visual feedback for interactions

## Empty States and Loading States

### Empty State

```css
.empty-state {
  @apply text-center py-8 px-4;
}

.empty-state-icon {
  @apply w-12 h-12 mx-auto mb-3 text-text-muted;
}

.empty-state-title {
  @apply text-base font-semibold text-text mb-2;
}

.empty-state-description {
  @apply text-sm text-text-secondary;
}
```

### Loading States

```css
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

## Performance Guidelines

### CSS Optimization

- Use CSS custom properties for consistent values
- Minimize CSS bundle size
- Leverage Tailwind's utility-first approach

### Animation Performance

- Use `transform` and `opacity` for animations
- Avoid animating layout properties
- Keep animations under 300ms for responsiveness

## Development Workflow

### Component Creation

1. Start with mobile-first design
2. Apply consistent spacing using 4px grid
3. Use standard border radius values
4. Test across all breakpoints
5. Ensure accessibility compliance

### Style Updates

1. Update design system documentation first
2. Apply changes to component library
3. Update existing components systematically
4. Test visual consistency across the app

## Resources

### Design Tools

- Figma for component design
- Tailwind CSS for implementation
- CSS custom properties for theming

### Documentation

- Component usage examples
- Accessibility guidelines
- Performance best practices

## Changelog

### v2.0.0 - Compact Design System

- **Reduced spacing**: Changed from 8px to 4px grid system
- **Smaller border radius**: Reduced from 16px+ to 6-8px max
- **Tighter layouts**: Reduced padding and margins throughout
- **Professional aesthetic**: Moved away from playful rounded design
- **Efficient space usage**: Minimized whitespace for better content density

### v1.0.0 - Initial Design System

- Established brand colors and typography
- Created component library foundation
- Implemented responsive design patterns
