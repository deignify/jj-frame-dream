import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const razorpayWebhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Verify webhook signature if secret is configured
    if (razorpayWebhookSecret && signature) {
      const expectedSignature = createHmac('sha256', razorpayWebhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event.event);

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.order_id;
        
        if (orderId) {
          const { error } = await supabase
            .from('orders')
            .update({ 
              status: 'processing',
              payment_method: 'razorpay',
              updated_at: new Date().toISOString()
            })
            .eq('order_id', orderId);

          if (error) {
            console.error('Error updating order:', error);
          } else {
            console.log(`Order ${orderId} marked as processing`);
          }
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.order_id;
        
        if (orderId) {
          console.log(`Payment failed for order ${orderId}`);
        }
        break;
      }

      case 'order.paid': {
        const order = event.payload.order.entity;
        console.log('Order paid:', order.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.event);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
