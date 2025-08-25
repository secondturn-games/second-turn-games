# Second Turn Games v2

A digital marketplace for pre-owned board games in the Baltics. Give your games a second life!

## 🚀 Features

- **Browse Listings**: View available board games with search and filtering
- **User Authentication**: Sign up/login with email or Google OAuth via Clerk
- **User Profiles**: Basic profile management for authenticated users
- **Listing Form**: Placeholder form for future game listing functionality
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live updates using Supabase real-time subscriptions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript
- **Styling**: Tailwind CSS with custom brand colors
- **UI Components**: shadcn/ui (Radix-based)
- **Authentication**: Clerk (EU data residency)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Storage**: Supabase Storage
- **Hosting**: Vercel

## 🎨 Brand Colors

- **Light Beige**: #E6EAD7 (Background)
- **Vibrant Orange**: #D95323 (Primary actions)
- **Warm Yellow**: #F2C94C (Secondary highlights)
- **Dark Green**: #29432B (Text and borders)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account
- Supabase project
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd second-turn-games
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `env.example` to `.env.local` and fill in your values:
   ```bash
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   
   # Supabase Database
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Configure Row Level Security policies

5. **Set up Clerk**
   - Create a Clerk application
   - Configure OAuth providers (Google, etc.)
   - Set up webhook endpoints for user sync

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages

- **Home** (`/`): Browse game listings with search functionality
- **Profile** (`/profile`): User profile management (requires auth)
- **Sell** (`/sell`): Game listing form (requires auth, demo mode)

## 🔧 Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout with Clerk provider
│   ├── page.tsx        # Homepage with listings
│   ├── profile/        # User profile page
│   └── sell/           # Game listing form
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── lib/                 # Utility functions
│   └── supabase/       # Supabase client configurations
├── types/               # TypeScript type definitions
└── hooks/               # Custom React hooks

supabase/
└── schema.sql          # Database schema and RLS policies
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables

Set these in your Vercel project:
- **Preview**: Use test/development keys
- **Production**: Use live production keys

## 🔮 Future Features

- Real listing persistence with Supabase
- Image upload to Supabase Storage
- User messaging system
- Payment processing
- Advanced search and filtering
- User reviews and ratings
- Real-time notifications

## 📄 License

This project is private and proprietary to Second Turn Games.

## 🤝 Contributing

This is an MVP project. Future contributions will be welcome once the core functionality is established.

---

**Second Turn Games** - Give your games a second life! 🎲
