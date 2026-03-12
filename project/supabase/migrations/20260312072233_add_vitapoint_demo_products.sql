/*
  # Add VitaPoint Peru Demo Products

  1. Products Added
    - CeraVe Gel Limpiador Anti-imperfecciones Blemish Control 473ml
    - CeraVe Limpiador Crema Espumosa Hydrating Cream-to-Foam 236ml
    - Frezyderm Face Serum Niacinamide 10% 30ml
    - Sesderma C VIT 5 Vitaminas Serum 30ml
    - Bioderma Sébium H2O 500ml
    - Hydrabio Sérum 40ml
    - Effaclar AZ Crema La Roche-Posay 40ml
    - HELIOCARE 360 Gel Oil-Free SPF 50 50ml
    - HELIOCARE 360 Mineral Tolerance Fluid SPF 50 50ml
    - HELIOCARE 360 Age Active Fluid SPF 50 50ml
    - HELIOCARE 360 MD A-R Emulsion SPF 50+ 50ml
    - HELIOCARE Compacto Oil-Free Light SPF 50 10gr
    - Frezyderm Sunscreen Velvet Face Cream SPF50
    - Bioderma Photoderm XDefense Ultra-Fluido SPF50+
    - Press & Clear Exfoliante 150ml

  2. Categories
    - Limpieza (Cleansing)
    - Hidratación (Hydration)
    - Antiedad (Anti-aging)
    - Antiacné (Anti-acne)
    - Anti-manchas (Anti-blemish)
    - Fotoprotección (Sun protection)

  3. Details
    - All products include realistic pricing in USD
    - Stock levels vary between 15-85 units
    - SKUs follow VTP-XXX format
    - Minimum stock levels set to 10 units
*/

-- Insert VitaPoint Peru demo products
INSERT INTO products (name, brand, category, sku, price, stock, min_stock_level, description) VALUES
-- Limpieza (Cleansing)
('CeraVe Gel Limpiador Anti-imperfecciones Blemish Control 473ml', 'CeraVe', 'Limpieza', 'VTP-001', 28.90, 45, 10, 'Gel limpiador formulado con ácido salicílico para pieles con tendencia acneica'),
('CeraVe Limpiador Crema Espumosa Hydrating Cream-to-Foam 236ml', 'CeraVe', 'Limpieza', 'VTP-002', 24.50, 52, 10, 'Limpiador cremoso que se transforma en espuma suave para limpiar sin resecar'),
('Bioderma Sébium H2O 500ml', 'Bioderma', 'Limpieza', 'VTP-005', 32.90, 38, 10, 'Agua micelar purificante para pieles grasas y mixtas'),
('Press & Clear Exfoliante 150ml', 'Press & Clear', 'Limpieza', 'VTP-015', 18.90, 62, 10, 'Exfoliante facial que elimina células muertas y destapa poros'),

-- Hidratación (Hydration)
('Frezyderm Face Serum Niacinamide 10% 30ml', 'Frezyderm', 'Hidratación', 'VTP-003', 42.90, 28, 10, 'Sérum concentrado con niacinamida al 10% para unificar el tono de piel'),
('Sesderma C VIT 5 Vitaminas Serum 30ml', 'Sesderma', 'Hidratación', 'VTP-004', 48.50, 35, 10, 'Sérum con 5 vitaminas para iluminar y revitalizar la piel'),
('Hydrabio Sérum 40ml', 'Bioderma', 'Hidratación', 'VTP-006', 38.90, 41, 10, 'Sérum hidratante que estimula la hidratación natural de la piel'),

-- Antiacné (Anti-acne)
('Effaclar AZ Crema La Roche-Posay 40ml', 'La Roche-Posay', 'Antiacné', 'VTP-007', 36.90, 33, 10, 'Crema anti-imperfecciones que reduce marcas y previene la reaparición'),

-- Fotoprotección (Sun Protection)
('HELIOCARE 360 Gel Oil-Free SPF 50 50ml', 'HELIOCARE', 'Fotoprotección', 'VTP-008', 52.90, 65, 10, 'Fotoprotector en gel sin aceite para pieles grasas y mixtas'),
('HELIOCARE 360 Mineral Tolerance Fluid SPF 50 50ml', 'HELIOCARE', 'Fotoprotección', 'VTP-009', 54.90, 58, 10, 'Fotoprotector mineral para pieles sensibles e intolerantes'),
('HELIOCARE 360 Age Active Fluid SPF 50 50ml', 'HELIOCARE', 'Fotoprotección', 'VTP-010', 56.90, 47, 10, 'Fotoprotector antiedad con activos que combaten el fotoenvejecimiento'),
('HELIOCARE 360 MD A-R Emulsion SPF 50+ 50ml', 'HELIOCARE', 'Fotoprotección', 'VTP-011', 58.90, 42, 10, 'Emulsión dermatológica para pieles con rojeces y rosácea'),
('HELIOCARE Compacto Oil-Free Light SPF 50 10gr', 'HELIOCARE', 'Fotoprotección', 'VTP-012', 62.90, 29, 10, 'Protector solar compacto con color para un acabado natural'),
('Frezyderm Sunscreen Velvet Face Cream SPF50', 'Frezyderm', 'Fotoprotección', 'VTP-013', 46.90, 55, 10, 'Crema facial con textura aterciopelada y protección solar muy alta'),
('Bioderma Photoderm XDefense Ultra-Fluido SPF50+', 'Bioderma', 'Fotoprotección', 'VTP-014', 44.90, 51, 10, 'Fotoprotector ultra-fluido con tecnología de defensa celular')
ON CONFLICT (sku) DO NOTHING;