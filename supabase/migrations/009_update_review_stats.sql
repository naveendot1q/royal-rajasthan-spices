-- Function to recalculate product rating stats after review changes
CREATE OR REPLACE FUNCTION public.update_product_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
BEGIN
  v_product_id := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE public.products SET
    avg_rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0)
      FROM public.reviews
      WHERE product_id = v_product_id AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = v_product_id AND status = 'approved'
    ),
    updated_at = now()
  WHERE id = v_product_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_product_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating_stats();

-- Function to update inventory on order confirmation
CREATE OR REPLACE FUNCTION public.reserve_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE public.inventory i
    SET reserved_qty = reserved_qty + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND i.variant_id = oi.variant_id;
  END IF;

  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE public.inventory i
    SET reserved_qty = GREATEST(reserved_qty - oi.quantity, 0),
        quantity = GREATEST(quantity - oi.quantity, 0)
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND i.variant_id = oi.variant_id;

    -- Log inventory changes
    INSERT INTO public.inventory_logs (variant_id, delta, reason, reference_id)
    SELECT oi.variant_id, -oi.quantity, 'sale', NEW.id
    FROM public.order_items oi WHERE oi.order_id = NEW.id;
  END IF;

  IF NEW.status IN ('cancelled', 'returned') AND OLD.status IN ('confirmed','packed','shipped','out_for_delivery') THEN
    UPDATE public.inventory i
    SET reserved_qty = GREATEST(reserved_qty - oi.quantity, 0)
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND i.variant_id = oi.variant_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER order_status_inventory_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.reserve_inventory_on_order();
