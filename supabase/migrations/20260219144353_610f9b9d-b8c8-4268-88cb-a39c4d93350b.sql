
-- Allow admins to delete orders
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to cancel their own pending orders
CREATE POLICY "Users can cancel their own pending orders"
ON public.orders
FOR UPDATE
USING (
  auth.uid() = user_id
  AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'cancelled'
);
