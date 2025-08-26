# Listing Wizard Implementation Plan

## Overview

The listing wizard allows users to create new game listings with a streamlined 4-step process. Phase 1 focuses on fixed-price listings for single board games (base games or expansions).

## Field Organization

### 1. BGG Core Game Data

| Field                       | Create UI         | Public         | Backend Only | Notes                                 |
| --------------------------- | ----------------- | -------------- | ------------ | ------------------------------------- |
| `id` (BGG game ID)          | ❌                | ❌             | ✅           | Source of truth for joins + updates   |
| `name`                      | ✅ (read-only, R) | ✅             | ❌           | Chosen from search result             |
| `yearpublished`             | ❌                | ✅             | ❌           | Shows trust; no need in creation      |
| `type`                      | ✅                | ✅             | ❌           | Helpful badge (base game / expansion) |
| `description`               | ❌                | ✅ (collapsed) | ❌           | Keep short; expand on click           |
| `minplayers` / `maxplayers` | ❌                | ✅             | ❌           | Public specs                          |
| `playingtime`               | ❌                | ✅             | ❌           | Public specs                          |
| `minage`                    | ❌                | ✅             | ❌           | Public specs                          |
| `rating`                    | ❌                | ✅             | ❌           | Show BGG avg rating (badge)           |
| `bayesaverage`              | ❌                | ❌             | ✅           | Use for sort/relevance                |
| `rank`                      | ❌                | ✅             | ❌           | "BGG Rank #123"                       |
| `weight`                    | ❌                | ✅             | ❌           | "Complexity: 2.8/5"                   |
| `thumbnail`                 | ❌                | ✅             | ❌           | Card image                            |
| `image`                     | ❌                | ✅             | ❌           | Detail page hero                      |
| `alternateNames[]`          | ❌                | ❌             | ✅           | For search/locale matching            |
| `mechanics[]`               | ❌                | ✅             | ❌           | Chips; helps buyer grasp genre        |
| `categories[]`              | ❌                | ✅             | ❌           | Chips                                 |

**Creation principle**: Sellers don't need to edit BGG data—just confirm the right game.

### 2. BGG Version-Specific Data

| Field                    | Create UI                          | Public | Backend Only | Notes                            |
| ------------------------ | ---------------------------------- | ------ | ------------ | -------------------------------- |
| `versionId`              | ✅ (R via selection when multiple) | ❌     | ✅           | Store for precise mapping        |
| `versionName`            | ✅ (read-only, O)                  | ✅     | ❌           | "2nd Edition", "Retail KS", etc. |
| `versionPublisher`       | ❌                                 | ✅     | ❌           | Inline with version              |
| `versionLanguage`        | ✅ (read-only)                     | ✅     | ❌           | Key trust signal                 |
| `versionYear`            | ❌                                 | ✅     | ❌           | Complements edition              |
| `versionProductCode`     | ❌                                 | ❌     | ✅           | Not needed                       |
| `dimensions` (cm)        | ❌                                 | ✅     | ❌           | Helps shipping expectations      |
| `weight` (kg)            | ❌                                 | ✅     | ❌           | Useful for shipping hints        |
| `hasDimensions`          | ❌                                 | ❌     | ✅           | Internal completeness flag       |
| `primaryLanguage`        | ❌                                 | ❌     | ✅           | Background language matching     |
| `isMultilingual`         | ❌                                 | ❌     | ✅           | Internal flag                    |
| `languageCount`          | ❌                                 | ❌     | ✅           | Internal count                   |
| `suggestedAlternateName` | ✅                                 | ❌     | ❌           | Auto-selected best match         |
| `confidence` (0-1)       | ❌                                 | ❌     | ✅           | Internal scoring                 |
| `languageMatch`          | ❌                                 | ❌     | ✅           | Internal quality indicator       |
| `reasoning`              | ❌                                 | ❌     | ✅           | Internal explanation             |

**Creation principle**: Show a compact "Version & Alternate Name" card that auto-selects the best match but lets the seller choose other name from the list if needed.

### 3. User-Provided Listing Data

| Field                | Create UI                              | Public                       | Backend Only | Notes                                       |
| -------------------- | -------------------------------------- | ---------------------------- | ------------ | ------------------------------------------- |
| `listingType`        | ✅ (R; fixed-price only for MVP)       | ✅                           | ❌           | MVP: show fixed-price; others "coming soon" |
| `condition` (rating) | ✅ (R)                                 | ✅                           | ❌           | Use simple scale + quick tags               |
| `conditionNotes`     | ✅ (O)                                 | ✅                           | ❌           | Short textarea; encourage honesty           |
| `price` (EUR)        | ✅ (R for fixed-price)                 | ✅                           | ❌           | Currency defaults to EUR                    |
| `negotiable` (bool)  | ✅ (O)                                 | ✅                           | ❌           | Adds "Open to offers" badge                 |
| `country`            | ✅ (R, read-only default from profile) | ✅                           | ❌           | Public: show country + city                 |
| `city`               | ✅ (R)                                 | ✅                           | ❌           |                                             |
| `localArea`          | ✅ (O)                                 | ❌                           | ✅           | Keep private; use for pickup radius logic   |
| `pickupRadius` (km)  | ✅ (O)                                 | ✅ (if local pickup offered) | ❌           | "Local pickup within X km"                  |
| `shippingMethods[]`  | ✅ (R)                                 | ✅                           | ❌           | For MVP include "Local pickup" + "Shipping" |
| `shippingCosts{}`    | ✅ (R)                                 | ✅                           | ❌           | Per method; show from-price badge           |
| `extrasCategories[]` | ✅ (O; checkboxes)                     | ✅                           | ❌           | "Sleeves", "Inserts", "Painted minis"       |
| `extrasNotes`        | ✅ (O)                                 | ✅                           | ❌           | Free text, short                            |
| `photos` (files)     | ✅ (O: max 3)                          | ❌                           | ❌           | Input only                                  |
| `photoUrls[]`        | ❌                                     | ✅                           | ❌           | Persisted & displayed                       |

**Privacy**: Show city + country publicly; keep localArea private. Exact street/location never public.

### 4. Listing Management & Metadata

| Field             | Create UI              | Public                       | Backend Only | Notes                           |
| ----------------- | ---------------------- | ---------------------------- | ------------ | ------------------------------- |
| `createdAt`       | ❌                     | ✅ ("Listed on...")          | ❌           | Human-readable date             |
| `updatedAt`       | ❌                     | ❌                           | ✅           | For auditing + sort             |
| `status`          | ❌                     | ✅ (active/sold badge)       | ❌           |                                 |
| `views`           | ❌                     | ✅ (optional vanity)         | ❌           | Can A/B test showing            |
| `favorites`       | ❌                     | ✅ (count)                   | ❌           | Social proof                    |
| `expiresAt`       | ❌                     | ❌                           | ✅           | For auto-expiration + reminders |
| `userId`          | ❌                     | ❌                           | ✅           | Ownership + moderation          |
| `tags[]`          | ✅ (O; chips)          | ✅                           | ❌           | Boost marketplace search        |
| `visibility`      | ✅ (O; default public) | ✅ (indicator if not public) | ❌           | MVP: public only                |
| `featured` (bool) | ❌                     | ✅ (badge)                   | ❌           | Controlled by admin/algorithm   |

## 4-Step Creation Flow

### Step 1: Pick Listing Type

- **Fixed Price**: Available (MVP)
- **Auction**: Coming Soon
- **Bundle**: Coming Soon
- **Trade**: Coming Soon
- **Giveaway**: Coming Soon

### Step 2: Pick the Game

1. **Search BGG** (base game, expansion)
   - Results with thumbnail, name, year, rating, rank, link to BGG entry
2. **Tap result** → select version from list of available versions & alternate name
   - Version name, image, language(s), year, publisher(s)
   - Suggested alternate name with option to change from list of available
3. **Confirm** → Next

### Step 3: Condition & Photos

1. **Condition** (radio: New / Like New / Good / Fair / Heavily Played)
2. **Quick condition checkboxes** (sleeved, missing parts, inserts, written-on, smoke-free, pet-free)
3. **Photos** (drag-drop; max 3; suggest box + contents + close-ups)
4. **Extras** (chips + short note)

### Step 4: Price & Delivery

1. **Price** (EUR) + Negotiable toggle
2. **Delivery options**:
   - Local pickup: City prefilled; optional pickup radius
   - Shipping: Fixed cost placeholders (Unisend integration in future phases)
3. **Visibility** (default Public)
4. **Create Listing**

## Public Listing Layout

### Always Visible

- **Hero**: Version image (BGG version image), Version name + edition, version year, language badges
- **Quick specs**: players, time, age, complexity, rank, rating
- **Condition** (primary) + condition notes
- **Extras**
- **Price** (EUR) + Negotiable badge
- **Delivery**: Local pickup (city), Shipping option + cost
- **Seller**: username, join date, other listings

### Expandable Sections

- **Game Details**: description, mechanics, categories
- **Version Info**: publishers, languages, dimensions, weight
- **Meta**: listed date, views, favorites

## Database Schema

### `listings` table

```sql
-- Core listing info
id (uuid, primary key)
user_id (uuid, foreign key)
status (enum: draft, active, sold, expired, cancelled)
listing_type (enum: fixed-price, auction, bundle, trade, giveaway)
created_at (timestamp)
updated_at (timestamp)
expires_at (timestamp)

-- Game identification
bgg_game_id (text)
bgg_version_id (text, nullable)
game_name (text)
version_name (text, nullable)
primary_language (text)
is_multilingual (boolean)

-- User customization
custom_title (text, nullable)
custom_description (text, nullable)

-- Condition & details
condition (enum: new-in-shrink, like-new, excellent, good, fair, poor)
condition_notes (text, nullable)

-- Pricing
price (decimal)
currency (text, default 'EUR')
negotiable (boolean, default false)

-- Location
country (text)
city (text)
local_area (text, nullable)
pickup_radius (integer, default 50)

-- Shipping
shipping_methods (text[])
shipping_costs (jsonb)

-- Extras
extras_categories (text[])
extras_notes (text, nullable)

-- Media
photo_urls (text[])

-- Metadata
views (integer, default 0)
favorites (integer, default 0)
featured (boolean, default false)
tags (text[])
visibility (enum: public, private, friends-only)
```

### `listing_versions` table

```sql
id (uuid, primary key)
listing_id (uuid, foreign key)
bgg_version_id (text)
version_name (text)
publishers (text[])
languages (text[])
year_published (text)
product_code (text, nullable)
dimensions (jsonb) -- {width, length, depth, hasDimensions}
weight (jsonb) -- {value, unit, hasWeight}
```

## Implementation Phases

### Phase 1 (MVP - Fixed Price Only)

- [x] Basic listing wizard with 4 steps
- [x] Game search + version selection
- [x] Simple condition + photo upload
- [x] Basic pricing + local pickup
- [x] Shipping cost placeholders

### Phase 2 (Enhanced UX)

- [ ] Smart version matching with confidence indicators
- [ ] Enhanced condition wizard with visual examples
- [ ] Shipping cost calculator for Unisend
- [ ] Advanced search and filtering

### Phase 3 (Additional Listing Types)

- [ ] Auction system with bidding
- [ ] Bundle listings (multiple games)
- [ ] Trade system with want lists
- [ ] Giveaway listings

## Key Principles

1. **Keep it simple** - MVP focuses on essential features only
2. **Smart defaults** - Auto-select best matches where possible
3. **Privacy first** - Keep sensitive location data private
4. **BGG integration** - Use authoritative data, don't duplicate
5. **Fast creation** - Target 8-10 fields maximum for MVP
6. **Hero image priority** - Always use BGG version image as primary
7. **User choice** - Allow selection of any available version/name
