
-- Allow users to view orders that match their auth email
CREATE POLICY "Users can view orders by email"
ON public.orders
FOR SELECT
USING (auth.jwt() ->> 'email' = customer_email);
