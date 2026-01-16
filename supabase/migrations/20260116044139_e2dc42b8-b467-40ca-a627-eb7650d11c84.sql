-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image TEXT NOT NULL DEFAULT '/placeholder.svg',
  category TEXT NOT NULL DEFAULT 'wooden',
  material TEXT NOT NULL DEFAULT 'Wood',
  size TEXT NOT NULL DEFAULT '8x10 inches',
  color TEXT NOT NULL DEFAULT 'Natural',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  care_instructions TEXT[] DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_settings table for dynamic site configuration
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app_role enum and user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Products: Everyone can view, only admins can modify
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Business settings: Everyone can view, only admins can modify
CREATE POLICY "Anyone can view business settings"
  ON public.business_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert business settings"
  ON public.business_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update business settings"
  ON public.business_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete business settings"
  ON public.business_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Orders: Only admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles: Only viewable by admins
CREATE POLICY "Admins can view user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default business settings
INSERT INTO public.business_settings (setting_key, setting_value) VALUES
  ('business_name', 'JJ Frame Studio'),
  ('business_tagline', 'Preserve Your Memories in Perfect Frames'),
  ('business_email', 'hello@jjframestudio.com'),
  ('business_phone', '+91 98765 43210'),
  ('business_address', '123 Frame Street, Art District, Mumbai 400001'),
  ('currency_symbol', '₹'),
  ('shipping_cost', '0'),
  ('tax_rate', '18');

-- Insert sample products with INR prices
INSERT INTO public.products (name, price, original_price, image, category, material, size, color, description, features, care_instructions, in_stock, featured) VALUES
  ('Classic Oak Photo Frame', 2499, 2999, '/frame-1.jpg', 'wooden', 'Solid Oak Wood', '8x10 inches', 'Natural Oak', 'Handcrafted from premium solid oak, this timeless frame brings warmth and elegance to your cherished memories.', ARRAY['100% solid oak construction', 'UV-protective glass', 'Easel back and wall mount ready', 'Acid-free matting included'], ARRAY['Dust with a soft, dry cloth', 'Avoid direct sunlight', 'Do not use water on wood'], true, true),
  ('Minimalist Black Metal Frame', 1999, NULL, '/frame-2.jpg', 'metal', 'Powder-Coated Steel', '11x14 inches', 'Matte Black', 'Sleek and sophisticated, our minimalist metal frame complements any modern interior.', ARRAY['Durable powder-coated steel', 'Shatter-resistant acrylic glazing', 'Floating design effect', 'Hardware included'], ARRAY['Wipe with damp cloth', 'Dry immediately', 'Handle with care'], true, true),
  ('Baroque Gold Ornate Frame', 4499, 5499, '/frame-3.jpg', 'ornate', 'Composite with Gold Leaf', '16x20 inches', 'Antique Gold', 'Make a statement with this stunning baroque-inspired frame with genuine gold leaf accents.', ARRAY['Hand-applied gold leaf finish', 'Intricate baroque detailing', 'Museum-quality glass', 'Velvet backing'], ARRAY['Dust gently with soft brush', 'Avoid touching gold leaf', 'Store in dry environment'], true, true),
  ('Rustic Whitewash Frame', 2249, NULL, '/frame-4.jpg', 'wooden', 'Reclaimed Pine', '5x7 inches', 'Whitewash', 'Bring farmhouse charm to your space with this beautifully distressed whitewash frame.', ARRAY['Eco-friendly reclaimed wood', 'Hand-distressed finish', 'Rustic character marks', 'Table and wall display ready'], ARRAY['Light dusting only', 'Distressed finish may vary', 'Keep away from moisture'], true, true),
  ('Floating Acrylic Display', 2749, NULL, '/frame-5.jpg', 'modern', 'Crystal Clear Acrylic', '8x10 inches', 'Clear', 'Let your photos float in space with our contemporary acrylic display.', ARRAY['Premium grade acrylic', 'Magnetic closure system', 'Double-sided display option', 'Elegant wooden base included'], ARRAY['Clean with acrylic-safe cleaner', 'Use microfiber cloth only', 'Avoid abrasive materials'], true, true),
  ('Gallery Collage Frame', 3999, 4999, '/frame-6.jpg', 'collage', 'Engineered Wood', '24x36 inches', 'Matte Black', 'Create your own gallery wall with this stunning multi-photo collage frame.', ARRAY['Holds 12 photos in various sizes', 'Pre-arranged artistic layout', 'Lightweight for easy hanging', 'Includes mounting hardware'], ARRAY['Dust regularly with soft cloth', 'Check wall mounting periodically', 'Replace photos through back panel'], true, true);