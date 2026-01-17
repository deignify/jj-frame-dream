-- Fix the decrease_product_stock function to use correct field name
CREATE OR REPLACE FUNCTION public.decrease_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  item jsonb;
  p_id uuid;
  qty integer;
BEGIN
  -- Loop through items in the order
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    -- Try 'product_id' first (used in Checkout), then fall back to 'id'
    p_id := COALESCE((item->>'product_id')::uuid, (item->>'id')::uuid);
    qty := COALESCE((item->>'quantity')::integer, 1);
    
    IF p_id IS NOT NULL THEN
      -- Decrease stock for this product
      UPDATE public.products 
      SET stock_quantity = GREATEST(stock_quantity - qty, 0),
          in_stock = CASE WHEN stock_quantity - qty > 0 THEN true ELSE false END
      WHERE id = p_id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$function$;