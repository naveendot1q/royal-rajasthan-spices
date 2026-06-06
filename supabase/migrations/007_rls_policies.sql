-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Helper: check if current user has a role
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = role_name
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'super_admin', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- PROFILES ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_read"   ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_staff());
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert"     ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ---- ADDRESSES ----
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_own"   ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_staff());
CREATE POLICY "addresses_insert" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---- PRODUCTS ----
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read"  ON public.products FOR SELECT USING (status = 'active' AND deleted_at IS NULL OR public.is_staff());
CREATE POLICY "products_staff_write"  ON public.products FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "products_staff_update" ON public.products FOR UPDATE USING (public.is_staff());
CREATE POLICY "products_staff_delete" ON public.products FOR DELETE USING (public.is_staff());

-- ---- PRODUCT CATEGORIES ----
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.product_categories FOR SELECT USING (is_active = TRUE AND deleted_at IS NULL OR public.is_staff());
CREATE POLICY "categories_staff_write" ON public.product_categories FOR ALL USING (public.is_staff());

-- ---- PRODUCT IMAGES ----
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "product_images_staff_write" ON public.product_images FOR ALL USING (public.is_staff());

-- ---- PRODUCT VARIANTS ----
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants_public_read"  ON public.product_variants FOR SELECT USING (is_active = TRUE OR public.is_staff());
CREATE POLICY "variants_staff_write"  ON public.product_variants FOR ALL USING (public.is_staff());

-- ---- INVENTORY ----
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_public_read" ON public.inventory FOR SELECT USING (TRUE);
CREATE POLICY "inventory_staff_write" ON public.inventory FOR ALL USING (public.is_staff());

-- ---- CARTS ----
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carts_own" ON public.carts FOR ALL USING (
  auth.uid() = user_id OR
  session_id = current_setting('app.session_id', TRUE)
);

-- ---- CART ITEMS ----
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.carts c WHERE c.id = cart_id AND (
      c.user_id = auth.uid() OR
      c.session_id = current_setting('app.session_id', TRUE)
    )
  )
);

-- ---- ORDERS ----
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_own_read"   ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_staff());
CREATE POLICY "orders_own_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_staff_update" ON public.orders FOR UPDATE USING (public.is_staff());

-- ---- ORDER ITEMS ----
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_read" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff()))
);

-- ---- PAYMENTS ----
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_own_read"  ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff()))
);
CREATE POLICY "payments_staff_write" ON public.payments FOR ALL USING (public.is_staff());

-- ---- REVIEWS ----
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_read_approved" ON public.reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_staff());
CREATE POLICY "reviews_own_insert"    ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_update"    ON public.reviews FOR UPDATE USING (auth.uid() = user_id OR public.is_staff());
CREATE POLICY "reviews_staff_delete"  ON public.reviews FOR DELETE USING (public.is_staff());

-- ---- WISHLISTS ----
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlists_own" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- ---- COUPONS ----
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_active_read" ON public.coupons FOR SELECT USING (is_active = TRUE OR public.is_staff());
CREATE POLICY "coupons_staff_write" ON public.coupons FOR ALL USING (public.is_staff());

-- ---- NOTIFICATIONS ----
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ---- SUPPORT TICKETS ----
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_own"          ON public.support_tickets FOR SELECT USING (auth.uid() = user_id OR public.is_staff());
CREATE POLICY "tickets_own_insert"   ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_staff_update" ON public.support_tickets FOR UPDATE USING (public.is_staff());

-- ---- SUPPORT MESSAGES ----
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_messages_read" ON public.support_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND
    (t.user_id = auth.uid() OR public.is_staff())
  ) AND (is_internal = FALSE OR public.is_staff())
);
CREATE POLICY "support_messages_insert" ON public.support_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ---- AUDIT LOGS ----
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_insert"     ON public.audit_logs FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "audit_admin_read" ON public.audit_logs FOR SELECT USING (public.has_role('super_admin'));

-- ---- PUBLIC READ TABLES (no auth needed) ----
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "banners_staff_write" ON public.banners FOR ALL USING (public.is_staff());

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_pages_public_read" ON public.cms_pages FOR SELECT USING (is_active = TRUE);
CREATE POLICY "cms_pages_staff_write" ON public.cms_pages FOR ALL USING (public.is_staff());

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blogs_public_read" ON public.blogs FOR SELECT USING (published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "blogs_staff_write" ON public.blogs FOR ALL USING (public.is_staff());

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read"  ON public.system_settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_admin_write"  ON public.system_settings FOR ALL USING (public.has_role('super_admin'));

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipping_public_read"  ON public.shipping_methods FOR SELECT USING (is_active = TRUE);
CREATE POLICY "shipping_staff_write"  ON public.shipping_methods FOR ALL USING (public.is_staff());
