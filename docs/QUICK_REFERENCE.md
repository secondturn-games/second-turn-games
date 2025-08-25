# Quick Reference Guide

## 🚀 Fast Lookup for Developers

This guide provides quick access to the most commonly used design system elements, Clerk patterns, and development utilities.

---

## 🎨 Colors (Quick Copy)

### Primary Colors

```css
text-dark-green-600    /* Main headings */
text-dark-green-500    /* Body text */
text-dark-green-400    /* Muted text */
bg-dark-green-50       /* Light backgrounds */
border-dark-green-300  /* Borders */
```

### Accent Colors

```css
bg-vibrant-orange-500  /* Primary buttons */
text-vibrant-orange-600 /* Accent text */
bg-warm-yellow-400     /* Highlights */
text-warm-yellow-400   /* Rating stars */
```

### Background Colors

```css
bg-light-beige         /* Main background */
bg-white               /* Card backgrounds */
bg-light-beige-50     /* Input backgrounds */
```

---

## 🔘 Button Patterns

### Primary Button

```typescript
className =
  "px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium font-medium";
```

### Secondary Button

```typescript
className =
  "px-6 py-3 rounded-2xl border-2 border-dark-green-300 text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-700 transition-all duration-200 hover:scale-105 font-medium shadow-soft hover:shadow-medium bg-white";
```

### Large Button (Hero)

```typescript
className =
  "px-8 py-4 rounded-2xl bg-vibrant-orange-500 text-white text-lg font-semibold hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium";
```

---

## 🃏 Card Patterns

### Game Card

```typescript
className =
  "bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02] overflow-hidden border border-light-beige-200";
```

### Feature Card

```typescript
className =
  "bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 text-center";
```

### Profile Card

```typescript
className =
  "bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-shadow duration-200";
```

---

## 📝 Form Elements

### Input Field

```typescript
className =
  "w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200";
```

### Label

```typescript
className = "block text-sm font-medium text-dark-green-500 mb-2";
```

### Select Dropdown

```typescript
className =
  "w-full px-3 py-2 rounded-lg border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200";
```

---

## 🔐 Clerk Authentication

### Protected Page Template

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    // Redirect to home since auth forms are modal
    redirect("/");
  }

  return <div>Protected content</div>;
}
```

### API Route Protection

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your API logic here
}
```

### Auth Components

```typescript
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

// Sign In Button (Modal Mode)
<SignInButton mode="modal" afterSignInUrl="/profile">
  <button className="your-button-styles">Sign In</button>
</SignInButton>

// Sign Up Button (Modal Mode)
<SignUpButton mode="modal" afterSignUpUrl="/profile">
  <button className="your-button-styles">Join</button>
</SignUpButton>

// For non-button elements, use div instead of a tag
<SignInButton mode="modal">
  <div className="your-link-styles cursor-pointer">Profile</div>
</SignInButton>

// For protected actions like selling games (use conditional rendering instead)
<SignedOut>
  <SignInButton mode="modal">
    <div className="your-link-styles cursor-pointer">Sell a Game</div>
  </SignInButton>
</SignedOut>
<SignedIn>
  <Link href="/sell" className="your-button-styles">+ List a Game</Link>
</SignedIn>

// User Button
<UserButton afterSignOutUrl="/" />

// Conditional Rendering
<SignedOut><p>Please sign in</p></SignedOut>
<SignedIn><p>Welcome back!</p></SignedIn>
```

---

## 🗄️ Supabase Patterns

### Client Setup

```typescript
// Browser client
import { createClient } from "@/lib/supabase/client";

// Server client
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

### Common Queries

```typescript
// Select with auth check
const { data, error } = await supabase
  .from("user_profiles")
  .select("*")
  .eq("clerk_id", userId)
  .single();

// Insert with auth
const { data, error } = await supabase
  .from("listings")
  .insert({
    user_id: userId,
    title: "Game Title",
    price: 25.0,
  })
  .select()
  .single();

// Update with auth
const { data, error } = await supabase
  .from("user_profiles")
  .update({ first_name: "New Name" })
  .eq("clerk_id", userId)
  .select()
  .single();
```

---

## 📱 Responsive Utilities

### Text Sizing

```typescript
className = "text-base md:text-lg lg:text-xl";
className = "text-2xl md:text-3xl lg:text-4xl";
className = "text-sm md:text-base lg:text-lg";
```

### Spacing

```typescript
className = "py-8 md:py-12 lg:py-16";
className = "px-4 sm:px-6 lg:px-8";
className = "gap-4 md:gap-6 lg:gap-8";
```

### Grid Layouts

```typescript
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
className = "flex flex-col md:flex-row";
className = "text-center md:text-left";
```

---

## 🎭 Animation Classes

### Hover Effects

```typescript
className = "hover:scale-105 transition-transform duration-200";
className = "hover:shadow-medium transition-shadow duration-200";
className = "hover:text-vibrant-orange-600 transition-colors duration-200";
```

### All Transitions

```typescript
className = "transition-all duration-200";
className = "transition-colors duration-200";
className = "transition-transform duration-200";
```

---

## 🎯 Common Patterns

### Hero Section

```typescript
<div className="text-center mb-16">
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-dark-green-600 mb-6">
    Page Title
  </h1>
  <p className="text-xl md:text-2xl text-dark-green-500 mb-8 max-w-3xl mx-auto">
    Page description
  </p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    {/* CTA buttons */}
  </div>
</div>
```

### Feature Grid

```typescript
<div className="grid md:grid-cols-3 gap-8 mb-16">
  <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 text-center">
    {/* Feature content */}
  </div>
  {/* More features */}
</div>
```

### Page Container

```typescript
<div className="min-h-screen bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-6xl mx-auto">{/* Page content */}</div>
</div>
```

---

## 🐛 Common Issues & Fixes

### Clerk Middleware Error

**Error**: "Cannot read properties of undefined (reading 'pathname')"
**Fix**: Use simplified middleware

```typescript
// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
export default clerkMiddleware();
```

### Styling Not Working

**Issue**: Colors not displaying correctly
**Fix**: Check CSS variables in `globals.css` and ensure Tailwind v4 compatibility

### Auth Not Working

**Issue**: "auth() was called but Clerk can't detect usage of clerkMiddleware()"
**Fix**: Ensure middleware file exists and exports correctly

---

## 📋 Development Checklist

### Before Committing

- [ ] **Colors**: Using design system colors
- [ ] **Typography**: Correct font families and weights
- [ ] **Responsive**: Mobile-first approach
- [ ] **Hover States**: Smooth transitions
- [ ] **Auth**: Proper route protection
- [ ] **Errors**: Proper error handling

### Testing

- [ ] **Mobile**: Test on small screens
- [ ] **Auth Flow**: Sign in/out works
- [ ] **Protected Routes**: Redirects properly
- [ ] **Hover Effects**: Smooth animations
- [ ] **Forms**: Validation and submission

---

## 🔗 Quick Links

- **Main Docs**: [docs/README.md](./README.md)
- **Clerk Guide**: [docs/CLERK_INTEGRATION.md](./CLERK_INTEGRATION.md)
- **Design System**: [docs/DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Design System Code**: [src/lib/design-system.ts](../src/lib/design-system.ts)

---

_Last updated: August 25, 2025_
_For detailed information, refer to the full documentation files._
