/*
  # Zakithi Collection ERP Database Schema

  ## Overview
  This migration creates the complete database schema for the Zakithi Collection Enterprise ERP system,
  including user management, sales orders, inventory tracking, stock movements, and activity logging.

  ## New Tables

  ### 1. profiles
  Extends auth.users with role-based access control
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - Admin, Sales, or Warehouse
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. sales_orders
  Tracks all customer sales orders
  - `id` (uuid, primary key)
  - `order_number` (text, unique, auto-generated)
  - `customer_name` (text)
  - `customer_contact` (text)
  - `customer_email` (text)
  - `product_type` (text) - shirt, pant, blazer, etc.
  - `sizes` (jsonb) - array of size:quantity pairs
  - `total_quantity` (integer)
  - `delivery_date` (date)
  - `status` (text) - Pending, Confirmed, In Production, Dispatched, Completed
  - `notes` (text)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. inventory_items
  Tracks both raw materials and finished goods
  - `id` (uuid, primary key)
  - `item_name` (text)
  - `item_type` (text) - raw_material or finished_good
  - `category` (text) - cloth, buttons, thread, shirt, pant, etc.
  - `size` (text) - for finished goods
  - `current_stock` (integer)
  - `min_stock_level` (integer)
  - `unit` (text) - meters, pieces, kg, etc.
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. stock_movements
  Logs all inventory changes
  - `id` (uuid, primary key)
  - `item_id` (uuid, references inventory_items)
  - `movement_type` (text) - IN (received), OUT (used/dispatched), ADJUSTMENT
  - `quantity` (integer)
  - `reference_type` (text) - purchase, sales_order, production, adjustment
  - `reference_id` (uuid)
  - `notes` (text)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ### 5. activity_logs
  System-wide activity tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `action` (text)
  - `entity_type` (text) - sales_order, inventory_item, etc.
  - `entity_id` (uuid)
  - `details` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Admin: Full access to all tables
  - Sales: Full access to sales_orders, read access to inventory_items
  - Warehouse: Full access to inventory_items and stock_movements, read access to sales_orders
  - All users can read their own profile
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'Sales' CHECK (role IN ('Admin', 'Sales', 'Warehouse')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'Admin'
    )
  );

-- Create sales_orders table
CREATE TABLE IF NOT EXISTS sales_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_contact text,
  customer_email text,
  product_type text NOT NULL,
  sizes jsonb NOT NULL DEFAULT '[]',
  total_quantity integer NOT NULL DEFAULT 0,
  delivery_date date,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'In Production', 'Dispatched', 'Completed')),
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales and Admin can manage sales orders"
  ON sales_orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Sales')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Sales')
    )
  );

CREATE POLICY "Warehouse can view sales orders"
  ON sales_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'Warehouse'
    )
  );

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('raw_material', 'finished_good')),
  category text NOT NULL,
  size text,
  current_stock integer NOT NULL DEFAULT 0,
  min_stock_level integer NOT NULL DEFAULT 10,
  unit text NOT NULL DEFAULT 'pieces',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warehouse and Admin can manage inventory"
  ON inventory_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Warehouse')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Warehouse')
    )
  );

CREATE POLICY "Sales can view inventory"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'Sales'
    )
  );

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity integer NOT NULL,
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warehouse and Admin can manage stock movements"
  ON stock_movements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Warehouse')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Warehouse')
    )
  );

CREATE POLICY "All authenticated users can view stock movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (true);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'Admin'
    )
  );

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "All authenticated users can create activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM sales_orders;
  new_number := 'SO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sales_orders_updated_at
  BEFORE UPDATE ON sales_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_created_by ON sales_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_inventory_items_type ON inventory_items(item_type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);