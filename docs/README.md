# Second Turn Games - Project Documentation

## 🎯 Project Overview

**Second Turn Games** is a marketplace platform for buying and selling used board games, card games, and tabletop games in the Baltics. Built with modern web technologies, it provides a seamless experience for gamers to give their games a second life.

### 🚀 Key Features

- **User Authentication** - Secure login/signup with Clerk
- **Advanced BGG Integration** - Optimized BoardGameGeek API with caching and batch processing
- **Smart Game Search** - Lightweight search with automatic image loading and type filtering
- **Enhanced Listing Flow** - Component-based architecture with version selection and title customization
- **Post.lt Shipping** - T2T locker-to-locker shipping integration with fee calculation
- **User Profiles** - Manage account and preferences with location integration
- **Responsive Design** - Mobile-first approach with Tailwind CSS and component-based UI

---

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Authentication**: Clerk v6
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 + Custom Design System
- **Deployment**: Vercel
- **Language**: TypeScript

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication routes
│   ├── games/             # Game browsing
│   ├── list-game-version/ # Enhanced listing creation flow
│   ├── profile/           # User profile management
│   ├── sell/              # Game listing creation
│   └── api/               # API routes
│       ├── bgg/           # BGG API optimization routes
│       └── shipping/      # Post.lt shipping integration
├── components/            # Reusable UI components
│   ├── listing/           # Listing flow components
│   │   ├── hooks/         # Custom hooks for state management
│   │   └── *.tsx          # Modular listing components
│   └── ui/               # Base UI components
├── lib/                  # Utility libraries
│   ├── bgg/              # BGG service with caching
│   ├── shipping/         # Post.lt shipping service
│   ├── supabase/         # Database client setup
│   └── design-system.ts  # Design system definitions
└── types/                # TypeScript type definitions
```

---

## 🆕 Recent Updates (December 2024)

### **Major Improvements**

- **🚀 BGG API Optimization**: Lightweight search with 3-5x faster performance
- **📦 Post.lt Shipping Integration**: T2T locker-to-locker shipping with fee calculation
- **🏗️ Component Architecture**: Modular, maintainable listing flow components
- **🎯 Enhanced UX**: Version selection, title customization, and responsive design
- **⚡ Performance**: Batch processing, intelligent caching, and HTML entity decoding

### **New Features**

- **Smart Version Selection**: Language filtering with button pills and responsive cards
- **Title Selection**: Alternate names selection with suggested titles and visual indicators
- **Shipping Options**: Simplified pickup and parcel locker shipping with real-time pricing
- **Search Enhancement**: Automatic image loading and comprehensive metadata display
- **Error Handling**: Robust error handling with user-friendly messages

### **Technical Improvements**

- **API Optimization**: Reduced API calls with lightweight search and on-demand enhancement
- **Caching System**: Advanced caching with performance monitoring and statistics
- **Type Safety**: Comprehensive TypeScript coverage with proper interfaces
- **Code Quality**: Reduced ESLint warnings and improved build performance

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account
- Vercel account (for deployment)

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Fill in your environment variables:

   ```bash
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   CLERK_WEBHOOK_SECRET=whsec_...

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

---

## 🔐 Authentication (Clerk v6)

### Setup

- **Provider**: `ClerkProvider` in root layout
- **Middleware**: Basic `clerkMiddleware()` for route protection
- **Routes**: Catch-all structure `/auth/sign-in/[[...rest]]`

### Key Components

- **Sign In**: `/auth/sign-in` - Beautiful Clerk form
- **Sign Up**: `/auth/sign-up` - User registration
- **User Button**: Profile management and logout

### Route Protection

Protected routes use `auth()` from Clerk:

```typescript
import { auth } from "@clerk/nextjs/server";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");
  // ... page content
}
```

### Webhook Integration

- **Endpoint**: `/api/webhooks/clerk`
- **Purpose**: Sync user data to Supabase
- **Events**: `user.created`, `user.updated`, `user.deleted`

---

## 🗄️ Database (Supabase)

### Schema

```sql
-- User profiles (synced from Clerk)
user_profiles (
  id, clerk_id, email, first_name, last_name,
  avatar_url, created_at, updated_at
)

-- Game listings
listings (
  id, user_id, title, description, price,
  condition, category, location, created_at
)

-- User reviews
reviews (
  id, listing_id, reviewer_id, rating,
  comment, created_at
)
```

### Client Setup

- **Browser**: `@/lib/supabase/client` - For client-side operations
- **Server**: `@/lib/supabase/server` - For server-side operations
- **Middleware**: Not used (simplified approach)

### Row Level Security (RLS)

Currently simplified for development:

```sql
-- Development: Allow all operations
CREATE POLICY "Allow all" ON user_profiles FOR ALL USING (true);
```

---

## 🎨 Design System

### Brand Colors

```css
--dark-green: #29432B      /* Primary text, borders */
--vibrant-orange: #D95323 /* CTAs, accents, hover */
--warm-yellow: #F2C94C    /* Highlights, gradients */
--light-beige: #E6EAD7    /* Backgrounds, cards */
```

### Component Patterns

- **Cards**: White background, rounded corners, soft shadows
- **Buttons**: Rounded-2xl, hover effects, consistent sizing
- **Forms**: Light beige inputs, focus rings, smooth transitions
- **Typography**: Righteous (headings), Roboto (body)

### Usage

```typescript
import { colors, shadows, buttons } from "@/lib/design-system";

// Consistent styling
<button className={buttons.primary}>Action Button</button>;
```

---

## 📱 Pages & Routes

### Public Pages

- **Home** (`/`) - Landing page with hero and features
- **Games** (`/games`) - Browse and search games
- **Sign In** (`/auth/sign-in`) - Authentication form
- **Sign Up** (`/auth/sign-up`) - Registration form

### Protected Pages

- **Profile** (`/profile`) - User account management
- **Sell** (`/sell`) - Create new game listings

### API Routes

- **`/api/test-db`** - Database connectivity test
- **`/api/webhooks/clerk`** - Clerk webhook handler
- **`/api/sync-user`** - Manual user profile sync

---

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with TypeScript interfaces
- **Styling**: Tailwind CSS with design system utilities
- **Error Handling**: Early returns, proper error boundaries

### File Naming

- **Components**: PascalCase (`GameCard.tsx`)
- **Pages**: kebab-case (`game-detail.tsx`)
- **Utilities**: camelCase (`designSystem.ts`)

### State Management

- **Server State**: Next.js App Router + Supabase
- **Client State**: React hooks for UI state
- **Authentication**: Clerk handles all auth state

---

## 🚀 Deployment

### Vercel Setup

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Environment Variables

- **Production**: Set in Vercel dashboard
- **Development**: Use `.env.local`
- **Preview**: Use `.env.local` or Vercel preview variables

---

## 🐛 Troubleshooting

### Common Issues

#### Clerk Middleware Errors

- **Problem**: "Cannot read properties of undefined"
- **Solution**: Use basic `clerkMiddleware()` without custom logic
- **Alternative**: Handle auth at page level with `auth()`

#### Supabase Connection Issues

- **Problem**: Database connection failures
- **Solution**: Check environment variables and RLS policies
- **Test**: Use `/api/test-db` endpoint

#### Styling Issues

- **Problem**: Colors not displaying correctly
- **Solution**: Ensure Tailwind CSS v4 compatibility
- **Check**: CSS variables in `globals.css`

### Debug Commands

```bash
# Test database connection
curl http://localhost:3000/api/test-db

# Check build output
npm run build

# Clear Next.js cache
rm -rf .next
```

---

## 📚 Additional Resources

### Documentation

- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Clerk v6 Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

### Design System

- [Figma/Design Files] - Link to design assets
- [Brand Guidelines] - Color usage and typography
- [Component Library] - Storybook or similar

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes following design system
3. Test authentication flows
4. Update documentation
5. Submit pull request

### Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Design system patterns followed
- [ ] Authentication properly implemented
- [ ] Error handling included
- [ ] Documentation updated

---

## 📞 Support

### Team Contacts

- **Project Lead**: [Your Name]
- **Design**: [Designer Name]
- **Backend**: [Backend Developer]

### Communication

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Chat**: [Slack/Discord Channel]

---

_Last updated: August 25, 2025_
_Version: 1.0.0_
