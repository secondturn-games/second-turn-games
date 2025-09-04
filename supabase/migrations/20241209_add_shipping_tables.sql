-- Migration: Add shipping and parcel locker tables
-- Date: 2024-12-09
-- Description: Creates tables for parcel locker integration with Unisend/LP Express

-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Carrier lockers cache table
CREATE TABLE IF NOT EXISTS carrier_lockers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country CHAR(2) NOT NULL CHECK (country IN ('EE', 'LV', 'LT')),
  city TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location GEOMETRY(POINT, 4326), -- PostGIS geometry column for spatial queries
  services TEXT[] DEFAULT '{}', -- ["LOCKER_LOCKER"] - only locker to locker service
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create geographic index for location-based queries using PostGIS
CREATE INDEX IF NOT EXISTS idx_carrier_lockers_location 
ON carrier_lockers USING GIST (location);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_carrier_lockers_country_city 
ON carrier_lockers(country, city);

CREATE INDEX IF NOT EXISTS idx_carrier_lockers_active 
ON carrier_lockers(is_active) WHERE is_active = true;

-- Full-text search index for locker names and addresses
CREATE INDEX IF NOT EXISTS idx_carrier_lockers_search 
ON carrier_lockers USING GIN (
  to_tsvector('simple', 
    COALESCE(name, '') || ' ' || 
    COALESCE(city, '') || ' ' || 
    COALESCE(address, '')
  )
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID, -- Will reference orders table when created (nullable for now)
  carrier TEXT NOT NULL CHECK (carrier IN ('UNISEND', 'LP_EXPRESS')),
  service_code TEXT NOT NULL, -- e.g., 'LOCKER_LOCKER'
  size_code TEXT NOT NULL CHECK (size_code IN ('S', 'M', 'L')),
  
  -- Locker references
  from_locker_id TEXT REFERENCES carrier_lockers(id),
  to_locker_id TEXT NOT NULL REFERENCES carrier_lockers(id),
  
  -- Sender details
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_email TEXT,
  
  -- Recipient details  
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,
  
  -- Shipment data
  label_url TEXT,
  label_format TEXT CHECK (label_format IN ('PDF', 'ZPL')),
  tracking_number TEXT UNIQUE,
  tracking_status TEXT,
  tracking_payload JSONB,
  
  -- Parcel dimensions (if required by carrier)
  weight_grams INTEGER,
  length_cm INTEGER,
  width_cm INTEGER,
  height_cm INTEGER,
  
  -- Metadata
  created_via TEXT NOT NULL DEFAULT 'API',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for shipments
CREATE INDEX IF NOT EXISTS idx_shipments_tracking 
ON shipments(tracking_number);

CREATE INDEX IF NOT EXISTS idx_shipments_order 
ON shipments(order_id);

CREATE INDEX IF NOT EXISTS idx_shipments_carrier 
ON shipments(carrier);

CREATE INDEX IF NOT EXISTS idx_shipments_status 
ON shipments(tracking_status);

CREATE INDEX IF NOT EXISTS idx_shipments_created 
ON shipments(created_at);

-- Tracking events table for detailed history
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_code TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_description TEXT,
  event_timestamp TIMESTAMPTZ NOT NULL,
  location_name TEXT,
  location_address TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for tracking events
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment 
ON tracking_events(shipment_id);

CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp 
ON tracking_events(event_timestamp);

-- Shipping rates cache table
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier TEXT NOT NULL,
  service_code TEXT NOT NULL,
  size_code TEXT NOT NULL,
  from_country CHAR(2) NOT NULL,
  to_country CHAR(2) NOT NULL,
  price_cents INTEGER NOT NULL, -- Price in cents to avoid floating point issues
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for shipping rates
CREATE INDEX IF NOT EXISTS idx_shipping_rates_lookup 
ON shipping_rates(carrier, service_code, size_code, from_country, to_country, is_active);

-- Webhook events log for debugging
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_carrier 
ON webhook_events(carrier);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed 
ON webhook_events(processed);

-- Add comments for documentation
COMMENT ON TABLE carrier_lockers IS 'Cached parcel locker locations from carrier APIs';
COMMENT ON TABLE shipments IS 'Shipment records for marketplace orders';
COMMENT ON TABLE tracking_events IS 'Detailed tracking event history for shipments';
COMMENT ON TABLE shipping_rates IS 'Cached shipping rates from carrier APIs';
COMMENT ON TABLE webhook_events IS 'Log of webhook events for debugging and monitoring';

-- Add RLS policies
ALTER TABLE carrier_lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carrier_lockers (public read access)
CREATE POLICY "Anyone can view active lockers" ON carrier_lockers
  FOR SELECT USING (is_active = true);

-- RLS Policies for shipments (temporarily disabled until orders table is created)
-- CREATE POLICY "Users can view their own shipments" ON shipments
--   FOR SELECT USING (
--     order_id IN (
--       SELECT id FROM orders WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
--     )
--   );

-- RLS Policies for tracking_events (temporarily disabled until orders table is created)
-- CREATE POLICY "Users can view tracking events for their shipments" ON tracking_events
--   FOR SELECT USING (
--     shipment_id IN (
--       SELECT id FROM shipments WHERE order_id IN (
--         SELECT id FROM orders WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
--       )
--     )
--   );

-- RLS Policies for shipping_rates (public read access)
CREATE POLICY "Anyone can view active shipping rates" ON shipping_rates
  FOR SELECT USING (is_active = true);

-- RLS Policies for webhook_events (admin only)
CREATE POLICY "Only admins can view webhook events" ON webhook_events
  FOR ALL USING (false); -- Will be updated when admin roles are implemented

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_carrier_lockers_updated_at 
  BEFORE UPDATE ON carrier_lockers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at 
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update PostGIS geometry when lat/lng changes
CREATE OR REPLACE FUNCTION update_locker_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the PostGIS geometry column when lat/lng are provided
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically populate location geometry
CREATE TRIGGER update_carrier_lockers_location 
  BEFORE INSERT OR UPDATE ON carrier_lockers
  FOR EACH ROW EXECUTE FUNCTION update_locker_location();

-- Function to find nearby lockers using PostGIS
CREATE OR REPLACE FUNCTION find_nearby_lockers(
  search_lat DOUBLE PRECISION,
  search_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 10000,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  country CHAR(2),
  city TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  services TEXT[],
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id,
    cl.name,
    cl.country,
    cl.city,
    cl.address,
    cl.lat,
    cl.lng,
    cl.services,
    cl.is_active,
    cl.created_at,
    cl.updated_at,
    ST_Distance(
      cl.location,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) AS distance_meters
  FROM carrier_lockers cl
  WHERE cl.is_active = true
    AND cl.location IS NOT NULL
    AND ST_DWithin(
      cl.location,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
