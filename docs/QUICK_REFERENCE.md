# Quick Reference Guide

## 🚀 **Project Status: December 2024**

- **Overall Progress**: ~40% Complete
- **Current Phase**: Phase 1 - Core Infrastructure & UI
- **Next Milestone**: Database Schema & Listing Backend
- **Build Status**: ✅ Stable & Working

## 🎯 **What's Working Right Now**

### ✅ **Core Application**

- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS v3.4.17 with custom theme
- Clerk authentication
- Responsive design system

### ✅ **BGG Integration**

- Game search and details
- Version management
- Smart language matching
- XML parsing and caching

### ✅ **User Interface**

- Enhanced navbar with search
- Listing creation wizard (4 steps)
- Responsive components
- Modern, compact design

### ✅ **Navigation**

- Clean, streamlined user flow
- Integrated search bar
- Mobile-first responsive design

## 🔧 **Quick Development Commands**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Check TypeScript
npx tsc --noEmit
```

## 📁 **Key File Locations**

### **Core Files**

- `src/app/layout.tsx` - Main layout & navigation
- `src/app/page.tsx` - Homepage
- `src/app/globals.css` - Global styles
- `tailwind.config.js` - Theme configuration

### **BGG Integration**

- `src/lib/bgg/` - Complete BGG service
- `src/components/bgg-test.tsx` - Testing interface

### **Listing System**

- `src/components/listing-wizard/` - Wizard components
- `src/app/list-game/` - Listing creation page

### **UI Components**

- `src/components/ui/` - Reusable components
- `src/components/ui/button.tsx` - Button variants
- `src/components/ui/card.tsx` - Card components

## 🎨 **Design System Quick Reference**

### **Colors**

```css
/* Primary Colors */
--dark-green: #29432B      /* Brand primary */
--vibrant-orange: #D95323  /* Accent/Call-to-action */
--warm-yellow: #F2C94C     /* Highlight/Warning */
--light-beige: #E6EAD7     /* Background */
--teal: #2DB7A3           /* Success/Info */
```

### **Typography**

```css
/* Font Classes */
--font-righteous          /* Logo/Brand */
--font-manrope            /* UI/Body text */
--font-bebas-neue        /* Game titles */
```

### **Spacing Scale**

```css
/* Compact Design System */
xs: 0.25rem    /* 4px */
sm: 0.5rem     /* 8px */
md: 0.75rem    /* 12px */
lg: 1rem       /* 16px */
xl: 1.5rem     /* 24px */
2xl: 2rem      /* 32px */
```

## 🚧 **What's Not Working Yet**

### ❌ **Backend Features**

- Database tables and schema
- Image upload storage
- User listings management
- Search backend functionality

### ❌ **Marketplace Features**

- Browse listings
- Purchase flow
- Payment processing
- User communication

### ⚠️ **Partially Working**

- PWA features (disabled due to styling conflicts)
- Database connection (established but no tables)

## 🔍 **Testing & Development**

### **BGG Testing**

- Visit `/bgg-test` to test BGG integration
- Search for games and view versions
- Test language matching functionality

### **Listing Wizard**

- Visit `/list-game` to test listing creation
- Complete the 4-step wizard flow
- Test form validation and preview

### **Authentication**

- Sign in/up using Clerk
- Test protected routes
- User profile management

## 🐛 **Common Issues & Solutions**

### **Styling Not Working**

- Clear `.next` cache: `Remove-Item -Recurse -Force .next`
- Restart dev server: `npm run dev`
- Check Tailwind config: `tailwind.config.js`

### **Build Errors**

- Clear node_modules: `Remove-Item -Recurse -Force node_modules`
- Reinstall: `npm install`
- Check TypeScript: `npx tsc --noEmit`

### **Favicon Issues**

- Ensure only `public/favicon.ico` exists
- Remove any `src/app/favicon.ico` files
- Check manifest.json references

## 📱 **Responsive Breakpoints**

```css
/* Tailwind Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

## 🎯 **Immediate Next Steps**

### **Phase 1 (Current)**

1. **Database Schema** - Design and create Supabase tables
2. **Listing Backend** - Connect wizard to database
3. **Image Upload** - Implement Supabase storage
4. **User Dashboard** - Profile with listings management

### **Phase 2 (Next)**

1. **Marketplace Features** - Browse, filter, purchase
2. **Communication** - Chat, notifications
3. **Payment Processing** - Stripe/PayPal integration

### **Phase 3 (Future)**

1. **Mobile App** - React Native
2. **Advanced Features** - AI recommendations
3. **International** - Multi-language support

## 🔗 **Useful Resources**

### **Documentation**

- `docs/PROJECT_STATUS.md` - Complete project overview
- `docs/DESIGN_SYSTEM.md` - Detailed design specifications
- `docs/BGG_SERVICE.md` - BGG integration details
- `docs/listing-wizard-implementation.md` - Wizard system

### **External Links**

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [BoardGameGeek API](https://boardgamegeek.com/wiki/page/BGG_XML_API2)

---

**Last Updated**: December 2024  
**Project Version**: 0.1.0  
**Status**: Active Development
