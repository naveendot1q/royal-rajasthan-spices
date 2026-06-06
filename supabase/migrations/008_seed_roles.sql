-- Seed default roles
INSERT INTO public.roles (name, description, permissions) VALUES
  ('super_admin', 'Full platform access', '["*"]'),
  ('admin', 'Admin dashboard access', '["products.*","orders.*","customers.*","inventory.*","coupons.*","reviews.*","cms.*","support.*","analytics.*","settings.read"]'),
  ('staff', 'Limited operations access', '["orders.read","orders.update","inventory.read","support.*","products.read"]'),
  ('customer', 'Customer access', '["profile.*","orders.own","wishlist.*","reviews.own","support.own"]')
ON CONFLICT (name) DO NOTHING;
