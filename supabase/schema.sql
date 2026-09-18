-- ============================================================
-- AksesPangan — Supabase PostgreSQL Schema & Initial Seeder
-- Project: hcnyymjtuswivkprdfxl
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'penyedia', 'penerima')),
  phone TEXT,
  business_name TEXT,
  business_type TEXT,
  business_address TEXT,
  location JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SURPLUS ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.surplus_items (
  id TEXT PRIMARY KEY,
  provider_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_business_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  photo TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  portion_count INTEGER NOT NULL DEFAULT 1,
  production_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'booked', 'completed', 'expired')),
  price NUMERIC NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  food_category TEXT NOT NULL DEFAULT 'nasi',
  location JSONB NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  surplus_id TEXT REFERENCES public.surplus_items(id) ON DELETE CASCADE,
  surplus_name TEXT NOT NULL,
  provider_id TEXT REFERENCES public.users(id),
  provider_business_name TEXT NOT NULL,
  recipient_id TEXT REFERENCES public.users(id),
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  portion_count INTEGER NOT NULL DEFAULT 1,
  pickup_address TEXT NOT NULL,
  pickup_deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'dikonfirmasi', 'diambil', 'dibatalkan', 'kedaluwarsa')),
  qr_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- 4. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
  complaint_id TEXT,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_role TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. QUALITY STANDARDS TABLE
CREATE TABLE IF NOT EXISTS public.quality_standards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ESG CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.esg_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  target_kg NUMERIC NOT NULL DEFAULT 15000,
  target_portions INTEGER NOT NULL DEFAULT 35000,
  target_co2_kg NUMERIC NOT NULL DEFAULT 37500,
  commitment_text TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR SPEED
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_surplus_status ON public.surplus_items(status);
CREATE INDEX IF NOT EXISTS idx_surplus_category ON public.surplus_items(food_category);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_recipient ON public.bookings(recipient_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_chat_booking ON public.chat_messages(booking_id);

-- ENABLE ROW LEVEL SECURITY (RLS) WITH OPEN PUBLIC POLICIES FOR FRONTEND ACCESS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surplus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read surplus" ON public.surplus_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert surplus" ON public.surplus_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update surplus" ON public.surplus_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete surplus" ON public.surplus_items FOR DELETE USING (true);

CREATE POLICY "Allow public read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update bookings" ON public.bookings FOR UPDATE USING (true);

CREATE POLICY "Allow public read chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read complaints" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Allow public insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update complaints" ON public.complaints FOR UPDATE USING (true);

CREATE POLICY "Allow public read quality_standards" ON public.quality_standards FOR SELECT USING (true);
CREATE POLICY "Allow public manage quality_standards" ON public.quality_standards FOR ALL USING (true);

CREATE POLICY "Allow public read esg_config" ON public.esg_config FOR SELECT USING (true);
CREATE POLICY "Allow public manage esg_config" ON public.esg_config FOR ALL USING (true);

-- ============================================================
-- SEED INITIAL DATA (Demo accounts & Initial metrics)
-- ============================================================

INSERT INTO public.users (id, name, email, password, role, phone, business_name, business_type, business_address, location)
VALUES
  ('admin-demo', 'Admin AksesPangan', 'admin@demo.com', 'demo123', 'admin', '081234567890', NULL, NULL, NULL, '{"lat": -6.9175, "lng": 107.6191}'),
  ('penyedia-demo', 'Ahmad Dahlan', 'restoran@demo.com', 'demo123', 'penyedia', '081298765432', 'Dapur Sedap Rasa', 'restoran', 'Jl. Buahbatu No. 120, Bandung', '{"lat": -6.9530, "lng": 107.6320}'),
  ('penerima-demo', 'Rina Wulandari', 'penerima@demo.com', 'demo123', 'penerima', '082112345678', NULL, NULL, NULL, '{"lat": -6.9712, "lng": 107.6335}')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.esg_config (id, target_kg, target_portions, target_co2_kg, commitment_text)
VALUES
  ('default', 15000, 35000, 37500, 'AksesPangan berkomitmen mengurangi food waste secara terukur, transparan, dan terverifikasi untuk mewujudkan target Net Zero Emission dan Ketahanan Pangan Nasional.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quality_standards (id, title, content, order_index)
VALUES
  ('std-1', 'Uji Organoleptik & Kesegaran', 'Makanan tidak berbau asam/tengik, tidak mengalami perubahan tekstur berlendir, dan warna tampak alami.', 1),
  ('std-2', 'Batas Waktu Konsumsi (Shelf-Life Safe)', 'Makanan matang wajib didistribusikan maksimal 4 jam setelah waktu produksi atau disimpan dalam suhu chiller aman.', 2),
  ('std-3', 'Kemasan Higienis & Tersegel', 'Wajib menggunakan wadah food-grade bersih dan tersegel rapat untuk mencegah kontaminasi silang selama transit.', 3),
  ('std-4', 'Verifikasi Digital QR & Rantai Dingin', 'Setiap serah terima diverifikasi melalui pemindaian QR code digital dan konfirmasi dua arah.', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.surplus_items (id, provider_id, provider_name, provider_business_name, name, description, photo, quantity, portion_count, production_time, expiry_time, status, price, is_free, food_category, location, address)
VALUES
  ('surplus-1', 'penyedia-demo', 'Ahmad Dahlan', 'Dapur Sedap Rasa', 'Nasi Padang Rendang & Gulai Ayam', 'Paket nasi padang lengkap lauk rendang sapi empuk, gulai ayam, sayur nangka, dan sambal hijau segar.', '/images/surplus-nasi-padang.jpg', 6, 15, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'active', 0, true, 'nasi', '{"lat": -6.9530, "lng": 107.6320}', 'Jl. Buahbatu No. 120, Bandung'),
  ('surplus-2', 'penyedia-demo', 'Ahmad Dahlan', 'Dapur Sedap Rasa', 'Artisan Croissant & Brioche Box', 'Aneka pastry mentega Prancis premium porsi sarapan berlebih yang masih sangat renyah dan wangi.', '/images/surplus-bakery.jpg', 4, 10, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '5 hours', 'active', 0, true, 'roti', '{"lat": -6.9712, "lng": 107.6335}', 'Jl. Raya Bojongsoang No. 65, Bojongsoang'),
  ('surplus-3', 'penyedia-demo', 'Ahmad Dahlan', 'Dapur Sedap Rasa', 'Sayur Capcay & Ayam Fillet Bakar', 'Tumis sayuran segar renyah dengan potongan daging dada ayam fillet bakar bumbu rempah.', '/images/surplus-capcay.jpg', 5, 12, NOW() - INTERVAL '1 hours', NOW() + INTERVAL '3 hours', 'active', 0, true, 'lauk', '{"lat": -6.9650, "lng": 107.6400}', 'Jl. Terusan Buahbatu No. 88, Bandung')
ON CONFLICT (id) DO NOTHING;
