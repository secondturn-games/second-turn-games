# Clerk v6 Integration Guide

## 🎯 Overview

This document provides comprehensive guidance for integrating Clerk v6 authentication in the Second Turn Games project. It covers setup, configuration, troubleshooting, and best practices based on our implementation experience.

---

## 🚀 Initial Setup

### 1. Account Creation

1. Visit [clerk.com](https://clerk.com)
2. Create a new application
3. Choose "Development" instance (free tier)
4. Note your application URL (e.g., `https://exciting-manatee-9.accounts.dev`)

### 2. Environment Variables

Add these to your `.env.local`:

```bash
# Clerk Public Key (Browser)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Clerk Secret Key (Server)
CLERK_SECRET_KEY=sk_test_...

# Webhook Secret (for user sync)
CLERK_WEBHOOK_SECRET=whsec_...
```

### 3. Package Installation

```bash
npm install @clerk/nextjs
```

---

## 🏗️ Implementation

### Root Layout Configuration

```typescript
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware Setup

**⚠️ IMPORTANT**: Use the simplified approach to avoid runtime errors.

```typescript
// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**❌ DON'T DO THIS** (causes runtime errors):

```typescript
// This will cause "Cannot read properties of undefined" errors
export default clerkMiddleware((auth, req) => {
  // Custom logic here
});
```

### Route Structure

**Note**: Since we're using modal mode for all authentication, the separate auth routes are no longer needed for the main user flow. However, you can keep them for direct URL access if desired.

```
src/app/auth/
├── sign-in/[[...rest]]/page.tsx  # Optional - for direct URL access
└── sign-up/[[...rest]]/page.tsx  # Optional - for direct URL access
```

---

## 🔐 Authentication Components

### Modal vs Redirect Modes

Clerk provides two ways to display authentication forms:

- **Modal Mode** (`mode="modal"`): Forms appear as overlays within your website, maintaining your styling and user experience
- **Redirect Mode** (default): Users are redirected to Clerk's hosted forms, which can be styled but feel like a separate experience

**Recommendation**: Use modal mode for better user experience and consistent branding.

**Current Implementation**: All authentication forms (Profile link, Sign In, Sign Up) use modal mode for a unified experience. Protected actions like selling games are handled through conditional UI that shows appropriate buttons based on authentication status.

### Sign In Button

```typescript
import { SignInButton } from "@clerk/nextjs";

// Modal mode (stays within your website)
<SignInButton mode="modal">
  <button className="your-button-styles">Sign In</button>
</SignInButton>

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

// Redirect mode (goes to Clerk hosted form)
<SignInButton>
  <button className="your-button-styles">Sign In</button>
</SignInButton>
```

**⚠️ IMPORTANT**: Clerk components don't accept `className` props directly. Always wrap your styled elements inside the Clerk component.

### Sign Up Button

```typescript
import { SignUpButton } from "@clerk/nextjs";

// Modal mode (stays within your website)
<SignUpButton mode="modal">
  <button className="your-button-styles">Join</button>
</SignUpButton>

// Redirect mode (goes to Clerk hosted form)
<SignUpButton>
  <button className="your-button-styles">Join</button>
</SignUpButton>
```

**⚠️ IMPORTANT**: Clerk components don't accept `className` props directly. Always wrap your styled elements inside the Clerk component.

### User Button

```typescript
import { UserButton } from "@clerk/nextjs";

<UserButton afterSignOutUrl="/" />;
```

### Conditional Rendering

```typescript
import { SignedIn, SignedOut } from "@clerk/nextjs";

<SignedOut>
  <p>Please sign in to continue</p>
</SignedOut>

<SignedIn>
  <p>Welcome back!</p>
</SignedIn>
```

### Protected Actions Pattern

For actions that require authentication, use conditional rendering instead of modal forms:

```typescript
// ✅ RECOMMENDED: Conditional rendering for protected actions
<SignedOut>
  <SignInButton mode="modal">
    <div className="your-link-styles cursor-pointer">Sell a Game</div>
  </SignInButton>
</SignedOut>
<SignedIn>
  <Link href="/sell" className="your-button-styles">+ List a Game</Link>
</SignedIn>

// ❌ NOT RECOMMENDED: Modal forms for already authenticated users
<SignInButton mode="modal">
  <div className="your-link-styles cursor-pointer">Sell a Game</div>
</SignInButton>
```

This pattern prevents Clerk errors when authenticated users try to access modal forms.

---

## 🛡️ Route Protection

### Page-Level Protection (Recommended)

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

---

## 🔄 User Data Synchronization

### Webhook Handler

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await request.json();
  const { type, data } = payload;

  switch (type) {
    case "user.created":
      // Create user profile in Supabase
      break;
    case "user.updated":
      // Update user profile in Supabase
      break;
    case "user.deleted":
      // Delete user profile from Supabase
      break;
  }

  return new Response("Success", { status: 200 });
}
```

### Manual Sync (Development)

```typescript
// src/app/api/sync-user/route.ts
import { currentUser } from "@clerk/nextjs/server";

export async function POST() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Sync user data to Supabase
  const { data, error } = await supabase.from("user_profiles").upsert({
    clerk_id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    first_name: user.firstName,
    last_name: user.lastName,
    avatar_url: user.imageUrl,
  });

  return NextResponse.json({ success: true, data });
}
```

---

## 🎨 Styling Integration

### Button Consistency

Use the design system for consistent styling:

```typescript
// Navbar buttons
<SignInButton>
  <button className="px-6 py-3 rounded-2xl border-2 border-dark-green-300 text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-700 transition-all duration-200 hover:scale-105 font-medium shadow-soft hover:shadow-medium bg-white">
    Sign in
  </button>
</SignInButton>

<SignUpButton>
  <button className="px-6 py-3 rounded-2xl bg-vibrant-orange-500 text-white hover:bg-vibrant-orange-600 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium font-medium">
    Join
  </button>
</SignUpButton>
```

### Form Styling

Clerk forms can be styled to match your design system using the `appearance` prop in `ClerkProvider`:

```typescript
// src/app/layout.tsx
<ClerkProvider
  appearance={{
    baseTheme: undefined,
    variables: {
      colorPrimary: '#D95323',
      colorPrimaryHover: '#C44A1F',
      colorText: '#29432B',
      colorTextSecondary: '#87A787',
      colorBackground: '#F7F8F4',
      colorInputBackground: '#F7F8F4',
      colorInputBorder: '#E6EAD7',
      colorInputFocusBorder: '#F8A395',
      colorInputFocusRing: '#FDE4E0',
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
```

You can also use CSS variables in `globals.css`:

```css
:root {
  --clerk-primary: var(--color-vibrant-orange-500);
  --clerk-primary-hover: var(--color-vibrant-orange-600);
  --clerk-border: var(--color-light-beige-200);
  --clerk-background: var(--color-light-beige-50);
}
```

---

## 🐛 Troubleshooting

### Common Errors & Solutions

#### 1. "Cannot read properties of undefined (reading 'pathname')"

**Error**: Middleware trying to access undefined properties
**Solution**: Use simplified middleware without custom logic

```typescript
// ✅ CORRECT
export default clerkMiddleware();

// ❌ WRONG - causes runtime errors
export default clerkMiddleware((auth, req) => {
  // Custom logic here
});
```

#### 2. "auth() was called but Clerk can't detect usage of clerkMiddleware()"

**Error**: Middleware not properly configured
**Solution**: Ensure middleware file exists and exports correctly

```typescript
// src/middleware.ts must exist and export clerkMiddleware
export default clerkMiddleware();
```

#### 3. "Missing publishableKey"

**Error**: Environment variables not loaded
**Solution**: Check `.env.local` and restart dev server

```bash
# Verify environment variables
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Restart server
npm run dev
```

#### 4. Route Protection Not Working

**Error**: Users can access protected pages without auth
**Solution**: Use page-level protection with `auth()`

```typescript
// ✅ Use this in protected pages
const { userId } = await auth();
if (!userId) redirect("/");
```

#### 5. "React does not recognize the `afterSignInUrl` prop on a DOM element"

**Error**: HTML elements don't recognize Clerk props OR Clerk components don't accept className
**Solution**: Always wrap styled elements inside Clerk components, don't pass className to Clerk components

```typescript
// ✅ CORRECT - Wrap styled elements inside Clerk components
<SignInButton mode="modal">
  <div className="your-styles cursor-pointer">Profile</div>
</SignInButton>

<SignInButton mode="modal">
  <button className="your-button-styles">Sign In</button>
</SignInButton>

// ❌ WRONG - Don't pass className to Clerk components
<SignInButton mode="modal" className="your-styles">Sign In</SignInButton>

// ❌ WRONG - Don't use afterSignInUrl (not supported in Clerk v6)
<SignInButton mode="modal" afterSignInUrl="/profile">Sign In</SignInButton>
```

### Debug Steps

1. **Check middleware**: Ensure `src/middleware.ts` exists
2. **Verify environment**: Check all Clerk environment variables
3. **Clear cache**: Remove `.next` folder and restart
4. **Check console**: Look for Clerk-related errors
5. **Test auth flow**: Try signing in/out manually

---

## 🔧 Configuration Options

### Clerk Dashboard Settings

1. **Appearance**: Customize colors and branding
2. **Paths**: Set redirect URLs after sign-in/sign-up
3. **Social Connections**: Configure OAuth providers
4. **Email Templates**: Customize email content

### Environment-Specific Settings

```bash
# Development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## 📱 Testing

### Local Testing

1. **Sign Up Flow**: Create new account
2. **Sign In Flow**: Login with existing account
3. **Protected Routes**: Try accessing `/profile` without auth
4. **User Button**: Test profile management and logout

### Webhook Testing

Use [Play Swix](https://play.swix.dev/) for local webhook testing:

1. Set webhook URL to `http://localhost:3000/api/webhooks/clerk`
2. Send test events
3. Check database for user sync

### Production Testing

1. **Deploy to staging**: Test with production Clerk instance
2. **Webhook verification**: Ensure webhooks work in production
3. **User flows**: Test complete authentication journey

---

## 🚀 Best Practices

### Security

- **Never expose secret keys** in client-side code
- **Use webhook signatures** to verify webhook authenticity
- **Implement proper error handling** for auth failures
- **Log authentication events** for monitoring

### Performance

- **Lazy load auth components** when possible
- **Use server-side auth checks** for protected routes
- **Cache user data** to reduce API calls
- **Optimize webhook processing** for user sync

### User Experience

- **Clear error messages** for auth failures
- **Smooth redirects** after authentication
- **Consistent styling** with your design system
- **Accessibility** for auth forms

---

## 📚 Resources

### Official Documentation

- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk v6 Migration Guide](https://clerk.com/docs/upgrade-guides/v6)
- [Clerk Webhooks](https://clerk.com/docs/webhooks)
- [Clerk Components](https://clerk.com/docs/components)

### Community

- [Clerk Discord](https://discord.gg/clerk)
- [GitHub Issues](https://github.com/clerkinc/clerk-nextjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/clerk)

---

## 📝 Changelog

### Version 1.0.0 (August 25, 2025)

- Initial Clerk v6 integration
- Simplified middleware approach
- Page-level route protection
- User data synchronization with Supabase
- Comprehensive error handling

---

_This document is maintained by the Second Turn Games development team._
_For questions or updates, please create an issue or submit a pull request._
