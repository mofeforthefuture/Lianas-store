-- Luxury E-commerce: Initial schema, RLS, and storage
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- =============================================================================
-- PROFILES (extends auth.users; role stored here)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- PRODUCTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false
);

-- =============================================================================
-- ORDERS & ORDER_ITEMS
-- =============================================================================
CREATE TYPE order_status AS ENUM (
  'pending_payment', 'payment_submitted', 'confirmed', 'shipped', 'completed', 'cancelled'
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending_payment',
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(12,2) NOT NULL CHECK (price_at_purchase >= 0)
);

-- =============================================================================
-- PAYMENTS
-- =============================================================================
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  receipt_url TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- REVIEWS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Helper: current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES: users can read own; admins read all
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS: anyone can read active; admins full access
CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins full access products" ON public.products
  FOR ALL USING (public.get_user_role() = 'admin');

-- ORDERS: users own orders; admins all
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access orders" ON public.orders
  FOR ALL USING (public.get_user_role() = 'admin');

-- ORDER_ITEMS: via order ownership or admin
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Users can insert order items for own orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Admins full access order_items" ON public.order_items
  FOR ALL USING (public.get_user_role() = 'admin');

-- PAYMENTS: users own payments; admins all
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access payments" ON public.payments
  FOR ALL USING (public.get_user_role() = 'admin');

-- REVIEWS: anyone read; authenticated insert/update own
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert review" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own review" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access reviews" ON public.reviews
  FOR ALL USING (public.get_user_role() = 'admin');

-- =============================================================================
-- STORAGE BUCKETS (run in Dashboard or via API)
-- =============================================================================
-- Create buckets: product-images (public read), payment-receipts (private)
-- In Supabase Dashboard: Storage > New bucket > product-images (Public)
-- Then: New bucket > payment-receipts (Private)

-- Storage policies (apply after buckets exist):
-- product-images: public read; admins insert/update/delete
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);

-- Policy: product-images - anyone read, admin write
-- CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.get_user_role() = 'admin');
-- CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND public.get_user_role() = 'admin');
-- CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND public.get_user_role() = 'admin');

-- Policy: payment-receipts - user can upload to own folder; user and admin can read
-- CREATE POLICY "Users upload own receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Users read own receipts" ON storage.objects FOR SELECT USING (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Admins read all receipts" ON storage.objects FOR SELECT USING (bucket_id = 'payment-receipts' AND public.get_user_role() = 'admin');
