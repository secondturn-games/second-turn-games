-- Migration: Add local_area column and rename location to country
-- Date: 2024-12-09
-- Description: Separates location into country (constrained) and local_area (freeform)

-- Step 1: Add the new local_area column
ALTER TABLE user_profiles 
ADD COLUMN local_area TEXT;

-- Step 2: Rename location column to country
ALTER TABLE user_profiles 
RENAME COLUMN location TO country;

-- Step 3: Add a comment to clarify the purpose of each column
COMMENT ON COLUMN user_profiles.country IS 'User country (EE, LV, LT) for flag display and general location';
COMMENT ON COLUMN user_profiles.local_area IS 'Freeform local area description (city, suburb, neighborhood) for pickup details';

-- Step 4: Update any existing data if needed
-- (This is optional - existing data will be preserved)
-- If you want to migrate existing location data to local_area, uncomment the following:
-- UPDATE user_profiles 
-- SET local_area = country 
-- WHERE country IS NOT NULL AND local_area IS NULL;

-- Step 5: Create an index on local_area for better search performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_local_area ON user_profiles(local_area);

-- Step 6: Update the listings table if it also has a location column
-- (Check if listings table needs similar updates)
-- ALTER TABLE listings 
-- ADD COLUMN local_area TEXT;
-- ALTER TABLE listings 
-- RENAME COLUMN location TO country;
