-- Add stock_quantity column to products table
ALTER TABLE public.products ADD COLUMN stock_quantity integer NOT NULL DEFAULT 10;

-- Create function to decrease stock on order creation
CREATE OR REPLACE FUNCTION public.decrease_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  item jsonb;
  product_id uuid;
  quantity integer;
BEGIN
  -- Loop through items in the order
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    product_id := (item->>'id')::uuid;
    quantity := COALESCE((item->>'quantity')::integer, 1);
    
    -- Decrease stock for this product
    UPDATE public.products 
    SET stock_quantity = stock_quantity - quantity,
        in_stock = CASE WHEN stock_quantity - quantity > 0 THEN true ELSE false END
    WHERE id = product_id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to decrease stock on order insert
CREATE TRIGGER on_order_created_decrease_stock
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.decrease_product_stock();