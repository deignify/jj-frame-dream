import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return new Response(
        JSON.stringify({ error: 'Order ID and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Looking up order:', orderId, 'for email:', email);

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query order by order_id AND customer_email (secure lookup)
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', orderId.trim())
      .eq('customer_email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!data) {
      console.log('Order not found for:', orderId, email);
      return new Response(
        JSON.stringify({ order: null, message: 'Order not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order found:', data.order_id);

    return new Response(
      JSON.stringify({ order: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error looking up order:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
