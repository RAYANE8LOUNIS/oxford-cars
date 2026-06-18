-- Oxford Cars Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (customers + admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  wilaya VARCHAR(100),
  id_number VARCHAR(50),
  driver_license VARCHAR(50),
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('suv', 'sedan', 'compact', 'luxury', 'crossover')),
  transmission VARCHAR(20) NOT NULL CHECK (transmission IN ('automatic', 'manual')),
  fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
  seats INTEGER NOT NULL DEFAULT 5,
  doors INTEGER NOT NULL DEFAULT 4,
  color VARCHAR(50),
  license_plate VARCHAR(20) UNIQUE,
  mileage INTEGER DEFAULT 0,
  daily_price DECIMAL(10, 2) NOT NULL,
  weekly_price DECIMAL(10, 2),
  monthly_price DECIMAL(10, 2),
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  features TEXT[],
  images TEXT[],
  thumbnail VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  return_location VARCHAR(255) NOT NULL,
  total_days INTEGER NOT NULL,
  daily_rate DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partial')),
  notes TEXT,
  admin_notes TEXT,
  guest_name VARCHAR(200),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  content TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(is_available);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(pickup_date, return_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Function to generate reservation number
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'OC-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reservation number
CREATE OR REPLACE FUNCTION set_reservation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reservation_number IS NULL OR NEW.reservation_number = '' THEN
    LOOP
      NEW.reservation_number := generate_reservation_number();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_number = NEW.reservation_number);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_reservation
  BEFORE INSERT ON reservations
  FOR EACH ROW EXECUTE FUNCTION set_reservation_number();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed data: vehicles
INSERT INTO vehicles (name, brand, model, year, category, transmission, fuel_type, seats, daily_price, weekly_price, monthly_price, deposit_amount, is_available, is_featured, description, features, images, thumbnail)
VALUES
  ('Nissan Qashqai 2025', 'Nissan', 'Qashqai', 2025, 'suv', 'automatic', 'petrol', 5, 6500, 40000, 150000, 50000, true, true, 'The iconic Nissan Qashqai reimagined for 2025. A premium crossover SUV combining British-inspired design with cutting-edge technology and exceptional comfort.', ARRAY['Panoramic Sunroof', 'Apple CarPlay', 'Android Auto', 'Heated Seats', 'Rear Camera', 'Lane Assist', 'Adaptive Cruise Control', 'LED Headlights'], ARRAY['/images/vehicles/qashqai-2025-1.jpg'], '/images/vehicles/qashqai-2025-1.jpg'),
  ('Nissan Juke 2025', 'Nissan', 'Juke', 2025, 'compact', 'automatic', 'petrol', 5, 5500, 35000, 130000, 40000, true, true, 'The bold and distinctive Nissan Juke 2025. A stylish compact crossover with a dynamic personality and premium features.', ARRAY['Apple CarPlay', 'Android Auto', 'Rear Camera', 'LED Headlights', 'Alloy Wheels', 'Sport Mode', 'Digital Dashboard'], ARRAY['/images/vehicles/juke-2025-1.jpg'], '/images/vehicles/juke-2025-1.jpg'),
  ('Skoda Kodiaq 2025', 'Skoda', 'Kodiaq', 2025, 'suv', 'automatic', 'petrol', 7, 7500, 48000, 180000, 60000, true, true, 'The Skoda Kodiaq 2025 — a sophisticated 7-seater SUV offering exceptional space, comfort, and European engineering excellence.', ARRAY['7 Seats', 'Panoramic Sunroof', 'Virtual Cockpit', 'Heated Seats', 'Apple CarPlay', '4WD Available', 'Park Assist', 'Ambient Lighting'], ARRAY['/images/vehicles/kodiaq-2025-1.jpg'], '/images/vehicles/kodiaq-2025-1.jpg'),
  ('Renault Arkana 2025', 'Renault', 'Arkana', 2025, 'crossover', 'automatic', 'hybrid', 5, 6000, 38000, 145000, 50000, true, false, 'The Renault Arkana 2025 — a sleek coupe-SUV hybrid combining French elegance with environmental responsibility and dynamic performance.', ARRAY['Hybrid Engine', 'Digital Cockpit', 'Apple CarPlay', 'Rear Camera', 'Lane Departure Warning', 'Automatic Emergency Braking', 'Panoramic Roof'], ARRAY['/images/vehicles/arkana-2025-1.jpg'], '/images/vehicles/arkana-2025-1.jpg'),
  ('Peugeot 3008 2025', 'Peugeot', 'Peugeot 3008', 2025, 'suv', 'automatic', 'petrol', 5, 7000, 45000, 170000, 55000, true, true, 'The iconic Peugeot 3008 2025 — a premium SUV with the signature i-Cockpit and exceptional French craftsmanship.', ARRAY['i-Cockpit Display', 'Panoramic Sunroof', 'Heated Seats', 'Night Vision', 'Massaging Seats', 'Wireless Charging', 'Focal Audio System'], ARRAY['/images/vehicles/3008-2025-1.jpg'], '/images/vehicles/3008-2025-1.jpg'),
  ('Peugeot 3008 2024', 'Peugeot', 'Peugeot 3008', 2024, 'suv', 'automatic', 'diesel', 5, 6500, 42000, 160000, 50000, true, false, 'The Peugeot 3008 2024 — award-winning premium SUV with advanced diesel efficiency and French luxury appointments.', ARRAY['i-Cockpit Display', 'Panoramic Sunroof', 'Heated Seats', 'LED Matrix Headlights', 'Apple CarPlay', 'Park Assist 360°'], ARRAY['/images/vehicles/3008-2024-1.jpg'], '/images/vehicles/3008-2024-1.jpg'),
  ('Peugeot 308 2025', 'Peugeot', 'Peugeot 308', 2025, 'compact', 'automatic', 'petrol', 5, 5000, 32000, 120000, 40000, true, false, 'The Peugeot 308 2025 — European Car of the Year. A refined compact with a premium feel and dynamic driving character.', ARRAY['i-Cockpit Display', 'Alloy Wheels', 'Apple CarPlay', 'Rear Camera', 'LED Headlights', 'Driving Mode Selector'], ARRAY['/images/vehicles/308-2025-1.jpg'], '/images/vehicles/308-2025-1.jpg'),
  ('Kia K2 2024', 'Kia', 'K2', 2024, 'compact', 'manual', 'petrol', 5, 3500, 22000, 85000, 30000, true, false, 'The Kia K2 2024 — an elegant compact sedan with exceptional build quality, modern technology, and impressive fuel economy.', ARRAY['Apple CarPlay', 'Rear Camera', 'LED Daytime Running Lights', 'Smart Key', 'Auto Air Conditioning', 'Bluetooth'], ARRAY['/images/vehicles/k2-2024-1.jpg'], '/images/vehicles/k2-2024-1.jpg'),
  ('Fiat Tipo 2021', 'Fiat', 'Tipo', 2021, 'sedan', 'manual', 'diesel', 5, 3000, 19000, 72000, 25000, true, false, 'The Fiat Tipo 2021 — an Italian classic with practical elegance, diesel efficiency, and timeless Mediterranean design sensibility.', ARRAY['Apple CarPlay', 'Rear Camera', 'Cruise Control', 'Climate Control', 'Alloy Wheels', 'Bluetooth Audio'], ARRAY['/images/vehicles/tipo-2021-1.jpg'], '/images/vehicles/tipo-2021-1.jpg')
ON CONFLICT DO NOTHING;

-- Default admin user (password: Admin@Oxford2024)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
VALUES ('admin@oxfordcars.dz', '$2b$10$rQ3X3mFvCY6bpnGxKjRlcO8K5.1bxqZ4TJdFqXk6vx2h9A7gW8Nby', 'Oxford', 'Admin', '+213770123771', 'super_admin')
ON CONFLICT DO NOTHING;
