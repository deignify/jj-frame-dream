import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderEmailRequest {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  paymentMethod: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  currencySymbol: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderEmailRequest = await req.json();
    
    console.log("Sending order confirmation email to:", data.customerEmail);

    const formatCurrency = (amount: number) => {
      return `${data.currencySymbol}${amount.toLocaleString('en-IN')}`;
    };

    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0;">Thank you for your order</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Hi <strong>${data.customerName}</strong>,
          </p>
          <p style="margin-bottom: 20px;">
            Thank you for shopping with ${data.businessName}! We're thrilled to have you as our customer. Your order has been received and is being processed.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #374151;">Order Details</h2>
            <p style="margin: 0; color: #6b7280;">
              <strong>Order ID:</strong> ${data.orderId}<br>
              <strong>Payment Method:</strong> ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
            </p>
          </div>
          
          <h3 style="font-size: 16px; margin-bottom: 15px; color: #374151;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0;">Subtotal:</td>
                <td style="text-align: right; padding: 5px 0;">${formatCurrency(data.subtotal)}</td>
              </tr>
              ${data.discount > 0 ? `
              <tr style="color: #10b981;">
                <td style="padding: 5px 0;">Discount:</td>
                <td style="text-align: right; padding: 5px 0;">-${formatCurrency(data.discount)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 5px 0;">Tax:</td>
                <td style="text-align: right; padding: 5px 0;">${formatCurrency(data.tax)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;">Shipping:</td>
                <td style="text-align: right; padding: 5px 0;">${data.shipping > 0 ? formatCurrency(data.shipping) : 'Free'}</td>
              </tr>
              <tr style="font-weight: bold; font-size: 18px;">
                <td style="padding: 10px 0 5px 0; border-top: 2px solid #e5e7eb;">Total:</td>
                <td style="text-align: right; padding: 10px 0 5px 0; border-top: 2px solid #e5e7eb; color: #6366f1;">${formatCurrency(data.total)}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">Shipping Address</h3>
            <p style="margin: 0; color: #6b7280;">
              ${data.customerName}<br>
              ${data.shippingAddress}<br>
              ${data.shippingCity}, ${data.shippingState} ${data.shippingZip}
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; color: #6b7280;">Have questions about your order?</p>
            <p style="margin: 0;">
              <a href="mailto:${data.businessEmail}" style="color: #6366f1; text-decoration: none;">${data.businessEmail}</a>
              <span style="color: #d1d5db;"> | </span>
              <a href="tel:${data.businessPhone}" style="color: #6366f1; text-decoration: none;">${data.businessPhone}</a>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${data.businessName}. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Delivery only available in Hyderabad</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const emailResponse = await resend.emails.send({
      from: `${data.businessName} <onboarding@resend.dev>`,
      to: [data.customerEmail],
      subject: `Order Confirmed - ${data.orderId} | ${data.businessName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending order email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);