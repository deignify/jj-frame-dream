-- Create contact inquiries table
CREATE TABLE public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit inquiries
CREATE POLICY "Anyone can submit inquiries" 
ON public.contact_inquiries 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries" 
ON public.contact_inquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update inquiries
CREATE POLICY "Admins can update inquiries" 
ON public.contact_inquiries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete inquiries
CREATE POLICY "Admins can delete inquiries" 
ON public.contact_inquiries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contact_inquiries_updated_at
BEFORE UPDATE ON public.contact_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);