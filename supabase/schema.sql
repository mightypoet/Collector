-- Supabase Schema for "Collector"
-- Enables UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers Table
CREATE TABLE customers (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Brands Table
CREATE TABLE brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  instagram_url TEXT,
  theme_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Loyalty Programs Table
CREATE TABLE loyalty_programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  target_product TEXT,
  reward_threshold INTEGER DEFAULT 5 NOT NULL,
  reward_offer TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menus Table
CREATE TABLE menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  menu_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Loyalty Cards Table
CREATE TABLE loyalty_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  program_id UUID REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  current_stamps INTEGER DEFAULT 0 NOT NULL,
  total_rewards_redeemed INTEGER DEFAULT 0 NOT NULL,
  last_stamped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, program_id)
);

-- 5. Stamp Logs Table
CREATE TABLE stamp_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  location_hash TEXT -- Anti-fraud
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_logs ENABLE ROW LEVEL SECURITY;

-- Customers: Users can only read/update their own profile
CREATE POLICY "Users can read own profile" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON customers FOR UPDATE USING (auth.uid() = id);

-- Brands: Owners manage their own brands, everyone can view brands
CREATE POLICY "Anyone can view brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Owners can manage their brands" ON brands FOR ALL USING (auth.uid() = owner_id);

-- Loyalty Programs: Owners manage their own programs, everyone can view them
CREATE POLICY "Anyone can view programs" ON loyalty_programs FOR SELECT USING (true);
CREATE POLICY "Owners can manage their programs" ON loyalty_programs FOR ALL USING (
  EXISTS (SELECT 1 FROM brands WHERE brands.id = loyalty_programs.brand_id AND brands.owner_id = auth.uid())
);

-- Menus: Owners manage their menus, everyone can view them
CREATE POLICY "Anyone can view menus" ON menus FOR SELECT USING (true);
CREATE POLICY "Owners can manage their menus" ON menus FOR ALL USING (
  EXISTS (SELECT 1 FROM brands WHERE brands.id = menus.brand_id AND brands.owner_id = auth.uid())
);

-- Loyalty Cards: Customers view their own cards, Owners can view cards for their programs
CREATE POLICY "Customers can view their own cards" ON loyalty_cards FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Brands can view their customers cards" ON loyalty_cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM loyalty_programs
    JOIN brands ON brands.id = loyalty_programs.brand_id
    WHERE loyalty_programs.id = loyalty_cards.program_id AND brands.owner_id = auth.uid()
  )
);
-- Service Role / Server-side logic should handle stamp updates to prevent cheating.
-- Alternatively, specific RPCs or edge functions handle updating stamps.

-- Stamp Logs: Customers view their history
CREATE POLICY "Customers can view their stamp history" ON stamp_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM loyalty_cards WHERE loyalty_cards.id = stamp_logs.card_id AND loyalty_cards.customer_id = auth.uid())
);
