/*
  # Add Sample Data

  ## Overview
  This migration adds sample inventory data to populate the system with realistic examples
  for demonstration purposes.

  ## Sample Data Added

  ### Raw Materials
  - Cotton Cloth (White) - 500 meters
  - Cotton Cloth (Navy Blue) - 350 meters
  - Polyester Fabric (Black) - 200 meters
  - Buttons (White) - 5000 pieces
  - Buttons (Navy) - 3000 pieces
  - Thread (White) - 50 rolls
  - Thread (Navy) - 45 rolls
  - Zippers (Various) - 1000 pieces

  ### Finished Goods
  - School Shirts in various sizes (S, M, L, XL, XXL)
  - School Pants in various sizes
  - Blazers in various sizes

  All items include proper stock levels and minimum thresholds for low-stock alerts.
*/

-- Insert sample raw materials
INSERT INTO inventory_items (item_name, item_type, category, current_stock, min_stock_level, unit) VALUES
  ('Cotton Cloth - White', 'raw_material', 'Cloth', 500, 100, 'meters'),
  ('Cotton Cloth - Navy Blue', 'raw_material', 'Cloth', 350, 100, 'meters'),
  ('Cotton Cloth - Sky Blue', 'raw_material', 'Cloth', 150, 100, 'meters'),
  ('Polyester Fabric - Black', 'raw_material', 'Cloth', 200, 80, 'meters'),
  ('Buttons - White (Small)', 'raw_material', 'Buttons', 5000, 1000, 'pieces'),
  ('Buttons - Navy (Small)', 'raw_material', 'Buttons', 3000, 1000, 'pieces'),
  ('Buttons - Gold (Large)', 'raw_material', 'Buttons', 800, 500, 'pieces'),
  ('Thread - White', 'raw_material', 'Thread', 50, 20, 'rolls'),
  ('Thread - Navy', 'raw_material', 'Thread', 45, 20, 'rolls'),
  ('Thread - Black', 'raw_material', 'Thread', 15, 20, 'rolls'),
  ('Zippers - Metal (20cm)', 'raw_material', 'Zippers', 1000, 200, 'pieces'),
  ('Zippers - Metal (30cm)', 'raw_material', 'Zippers', 500, 200, 'pieces')
ON CONFLICT DO NOTHING;

-- Insert sample finished goods - Shirts
INSERT INTO inventory_items (item_name, item_type, category, size, current_stock, min_stock_level, unit) VALUES
  ('School Shirt - White', 'finished_good', 'Shirt', 'S', 45, 20, 'pieces'),
  ('School Shirt - White', 'finished_good', 'Shirt', 'M', 60, 30, 'pieces'),
  ('School Shirt - White', 'finished_good', 'Shirt', 'L', 55, 30, 'pieces'),
  ('School Shirt - White', 'finished_good', 'Shirt', 'XL', 35, 25, 'pieces'),
  ('School Shirt - White', 'finished_good', 'Shirt', 'XXL', 12, 15, 'pieces'),
  ('School Shirt - Sky Blue', 'finished_good', 'Shirt', 'S', 30, 20, 'pieces'),
  ('School Shirt - Sky Blue', 'finished_good', 'Shirt', 'M', 40, 30, 'pieces'),
  ('School Shirt - Sky Blue', 'finished_good', 'Shirt', 'L', 38, 30, 'pieces'),
  ('School Shirt - Sky Blue', 'finished_good', 'Shirt', 'XL', 25, 25, 'pieces'),
  ('School Shirt - Sky Blue', 'finished_good', 'Shirt', 'XXL', 8, 15, 'pieces')
ON CONFLICT DO NOTHING;

-- Insert sample finished goods - Pants
INSERT INTO inventory_items (item_name, item_type, category, size, current_stock, min_stock_level, unit) VALUES
  ('School Pant - Navy', 'finished_good', 'Pant', 'S', 40, 20, 'pieces'),
  ('School Pant - Navy', 'finished_good', 'Pant', 'M', 55, 30, 'pieces'),
  ('School Pant - Navy', 'finished_good', 'Pant', 'L', 50, 30, 'pieces'),
  ('School Pant - Navy', 'finished_good', 'Pant', 'XL', 30, 25, 'pieces'),
  ('School Pant - Navy', 'finished_good', 'Pant', 'XXL', 10, 15, 'pieces'),
  ('School Pant - Black', 'finished_good', 'Pant', 'S', 35, 20, 'pieces'),
  ('School Pant - Black', 'finished_good', 'Pant', 'M', 45, 30, 'pieces'),
  ('School Pant - Black', 'finished_good', 'Pant', 'L', 42, 30, 'pieces'),
  ('School Pant - Black', 'finished_good', 'Pant', 'XL', 28, 25, 'pieces'),
  ('School Pant - Black', 'finished_good', 'Pant', 'XXL', 15, 15, 'pieces')
ON CONFLICT DO NOTHING;

-- Insert sample finished goods - Blazers
INSERT INTO inventory_items (item_name, item_type, category, size, current_stock, min_stock_level, unit) VALUES
  ('School Blazer - Navy', 'finished_good', 'Blazer', 'S', 15, 10, 'pieces'),
  ('School Blazer - Navy', 'finished_good', 'Blazer', 'M', 22, 15, 'pieces'),
  ('School Blazer - Navy', 'finished_good', 'Blazer', 'L', 20, 15, 'pieces'),
  ('School Blazer - Navy', 'finished_good', 'Blazer', 'XL', 12, 10, 'pieces'),
  ('School Blazer - Navy', 'finished_good', 'Blazer', 'XXL', 5, 10, 'pieces')
ON CONFLICT DO NOTHING;