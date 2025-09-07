-- Enhanced Listings Schema for Rich Game Data
-- This extends the basic listings table to support BGG integration and detailed condition data

-- First, let's create a new enhanced listings table
CREATE TABLE IF NOT EXISTS game_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic listing info
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  negotiable BOOLEAN DEFAULT false,
  price_notes TEXT,
  
  -- BGG Integration
  bgg_game_id TEXT,
  bgg_version_id TEXT,
  game_name TEXT,
  game_image_url TEXT,
  version_name TEXT,
  version_image_url TEXT,
  custom_title TEXT,
  suggested_alternate_name TEXT,
  
  -- Game Details (from BGG)
  min_players INTEGER,
  max_players INTEGER,
  playing_time INTEGER, -- in minutes
  min_age INTEGER,
  year_published INTEGER,
  languages TEXT[], -- array of language codes
  publishers TEXT[], -- array of publisher names
  designers TEXT[], -- array of designer names
  bgg_rank INTEGER,
  bgg_rating DECIMAL(3,2),
  
  -- Game Condition Details
  box_condition TEXT, -- 'new', 'like-new', 'lightly-worn', 'damaged'
  box_description TEXT,
  completeness TEXT, -- 'complete', 'incomplete'
  missing_description TEXT,
  component_condition TEXT, -- 'new', 'like-new', 'lightly-used', 'well-played', 'damaged'
  component_condition_description TEXT,
  extras TEXT[], -- array of extra items
  extras_description TEXT,
  photo_urls TEXT[], -- array of photo URLs
  photo_notes TEXT,
  
  -- Shipping Information
  pickup_enabled BOOLEAN DEFAULT false,
  pickup_country TEXT,
  pickup_local_area TEXT,
  pickup_meeting_details TEXT,
  
  parcel_locker_enabled BOOLEAN DEFAULT false,
  parcel_locker_price_type TEXT, -- 'included', 'separate'
  parcel_locker_price DECIMAL(10,2),
  parcel_locker_countries TEXT[], -- array of country codes
  parcel_locker_country_prices JSONB, -- { "EE": "5.00", "LV": "6.00", "LT": "7.00" }
  shipping_notes TEXT,
  
  -- Location and metadata
  location TEXT,
  country TEXT,
  local_area TEXT,
  
  -- User and status
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  
  -- Legacy fields for backward compatibility
  condition TEXT, -- simplified condition for legacy support
  image_url TEXT, -- primary image URL
  genre TEXT,
  player_count TEXT,
  age_range TEXT,
  language TEXT,
  expansion BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_listings_user_id ON game_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_game_listings_is_active ON game_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_game_listings_bgg_game_id ON game_listings(bgg_game_id);
CREATE INDEX IF NOT EXISTS idx_game_listings_bgg_version_id ON game_listings(bgg_version_id);
CREATE INDEX IF NOT EXISTS idx_game_listings_price ON game_listings(price);
CREATE INDEX IF NOT EXISTS idx_game_listings_location ON game_listings(location);
CREATE INDEX IF NOT EXISTS idx_game_listings_country ON game_listings(country);
CREATE INDEX IF NOT EXISTS idx_game_listings_box_condition ON game_listings(box_condition);
CREATE INDEX IF NOT EXISTS idx_game_listings_completeness ON game_listings(completeness);
CREATE INDEX IF NOT EXISTS idx_game_listings_created_at ON game_listings(created_at);

-- Enable Row Level Security
ALTER TABLE game_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_listings
CREATE POLICY "Anyone can view active game listings" ON game_listings
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to insert listings (we handle user validation in the app)
CREATE POLICY "Authenticated users can insert listings" ON game_listings
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own listings
CREATE POLICY "Users can update their own listings" ON game_listings
  FOR UPDATE USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_id = auth.uid()::text));

-- Allow users to delete their own listings  
CREATE POLICY "Users can delete their own listings" ON game_listings
  FOR DELETE USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_id = auth.uid()::text));

-- Create trigger for updated_at
CREATE TRIGGER update_game_listings_updated_at BEFORE UPDATE ON game_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to migrate data from old listings table (optional)
CREATE OR REPLACE FUNCTION migrate_listings_to_game_listings()
RETURNS void AS $$
BEGIN
  INSERT INTO game_listings (
    title, description, price, condition, location, image_url, genre, 
    player_count, age_range, language, expansion, user_id, created_at, 
    updated_at, is_active, views, favorites
  )
  SELECT 
    title, description, price, condition, location, image_url, genre,
    player_count, age_range, language, expansion, user_id, created_at,
    updated_at, is_active, views, favorites
  FROM listings
  WHERE NOT EXISTS (
    SELECT 1 FROM game_listings WHERE game_listings.id = listings.id
  );
END;
$$ LANGUAGE plpgsql;
