-- Migration: Add foreign key constraints and RLS policies for orders table
-- Date: 2024-12-10
-- Description: Adds foreign key constraints and RLS policies once orders table exists

-- Add foreign key constraint to shipments table
ALTER TABLE shipments 
ADD CONSTRAINT fk_shipments_order_id 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Add RLS Policies for shipments (users can only see their own shipments)
CREATE POLICY "Users can view their own shipments" ON shipments
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

-- Add RLS Policies for tracking_events (same as shipments)
CREATE POLICY "Users can view tracking events for their shipments" ON tracking_events
  FOR SELECT USING (
    shipment_id IN (
      SELECT id FROM shipments WHERE order_id IN (
        SELECT id FROM orders WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
      )
    )
  );

-- Add index for order_id foreign key
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
