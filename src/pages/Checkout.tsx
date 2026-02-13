import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Truck, MapPin, Loader2, Tag, X, Check, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useCreateOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useValidatePromoCode, useIncrementPromoCodeUsage } from '@/hooks/usePromoCodes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StockCheckResult {
  isValid: boolean;
  outOfStockItems: { name: string; available: number; requested: number }[];
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AppliedPromo {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discountAmount: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, refreshProductStock } = useCart();
  const { data: settings } = useBusinessSettings();
  const createOrder = useCreateOrder();
  const updateOrderStatus = useUpdateOrderStatus();
  const validatePromoCode = useValidatePromoCode();
  const incrementPromoCodeUsage = useIncrementPromoCodeUsage();
  const [activeSection, setActiveSection] = useState<'contact' | 'shipping' | 'payment'>('contact');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(() => {
    const saved = localStorage.getItem('appliedPromo');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        code: parsed.code,
        discount_type: parsed.promoData.discount_type,
        discount_value: parsed.promoData.discount_value,
        discountAmount: parsed.discountAmount
      };
    }
    return null;
  });
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [showMobileOrderSummary, setShowMobileOrderSummary] = useState(false);

  const currencySymbol = settings?.currency_symbol || '₹';
  const taxRate = parseFloat(settings?.tax_rate || '0') / 100;
  const deliveryCharge = parseFloat(settings?.delivery_charge || '0');
  const deliveryType = settings?.delivery_type || 'free';
  const freeDeliveryThreshold = parseFloat(settings?.free_delivery_threshold || '0');
  
  const isDeliveryFree = deliveryType === 'free' || 
    (deliveryType === 'threshold' && totalPrice >= freeDeliveryThreshold);
  const actualDeliveryCharge = isDeliveryFree ? 0 : deliveryCharge;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: 'India'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactComplete = !!(formData.firstName && formData.lastName && formData.email && formData.phone);
  const shippingComplete = !!(formData.address && formData.city && formData.state && formData.zip);

  // Promo code handlers
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) { toast.error('Please enter a promo code'); return; }
    setIsValidatingPromo(true);
    try {
      const result = await validatePromoCode.mutateAsync({ code: promoCode.trim().toUpperCase(), orderAmount: totalPrice });
      let discountAmount = result.discount_type === 'percentage' 
        ? Math.round((totalPrice * result.discount_value) / 100) 
        : result.discount_value;
      setAppliedPromo({ code: result.code, discount_type: result.discount_type as 'percentage' | 'fixed', discount_value: result.discount_value, discountAmount });
      toast.success(`Promo code applied! You save ${currencySymbol}${discountAmount.toLocaleString('en-IN')}`);
    } catch (error: any) {
      toast.error(error.message || 'Invalid promo code');
    } finally { setIsValidatingPromo(false); }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null); setPromoCode('');
    localStorage.removeItem('appliedPromo');
    toast.info('Promo code removed');
  };

  const sendOrderConfirmationEmail = async (orderData: { orderId: string; subtotal: number; tax: number; shipping: number; discount: number; total: number; paymentMethod: string; }) => {
    try {
      await supabase.functions.invoke('send-order-email', {
        body: {
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          orderId: orderData.orderId,
          items: items.map(item => ({ name: item.product.name, price: item.product.price, quantity: item.quantity })),
          subtotal: orderData.subtotal, tax: orderData.tax, shipping: orderData.shipping,
          discount: orderData.discount, total: orderData.total,
          shippingAddress: formData.address, shippingCity: formData.city,
          shippingState: formData.state, shippingZip: formData.zip,
          paymentMethod: orderData.paymentMethod,
          businessName: settings?.business_name || 'JJ Frame Studio',
          businessEmail: settings?.business_email || 'hello@jjframestudio.com',
          businessPhone: settings?.business_phone || '+91 98765 43210',
          currencySymbol
        }
      });
    } catch (error) { console.error('Failed to send order confirmation email:', error); }
  };

  const verifyStockAvailability = async (): Promise<StockCheckResult> => {
    const productIds = items.map(item => item.product.id);
    const { data: products, error } = await supabase.from('products').select('id, name, stock_quantity, in_stock').in('id', productIds);
    if (error) throw new Error('Failed to verify stock availability');
    const outOfStockItems: StockCheckResult['outOfStockItems'] = [];
    for (const item of items) {
      const product = products?.find(p => p.id === item.product.id);
      if (!product) { outOfStockItems.push({ name: item.product.name, available: 0, requested: item.quantity }); }
      else if (!product.in_stock || product.stock_quantity < item.quantity) {
        outOfStockItems.push({ name: item.product.name, available: product.stock_quantity, requested: item.quantity });
        refreshProductStock(item.product.id, product.stock_quantity);
      }
    }
    return { isValid: outOfStockItems.length === 0, outOfStockItems };
  };

  const handleCODOrder = async () => {
    setIsSubmitting(true);
    try {
      const stockCheck = await verifyStockAvailability();
      if (!stockCheck.isValid) {
        const messages = stockCheck.outOfStockItems.map(item => item.available === 0 ? `${item.name} is out of stock` : `${item.name}: only ${item.available} available`);
        toast.error(`Stock issue: ${messages.join('. ')}`); setIsSubmitting(false); return;
      }
    } catch { toast.error('Failed to verify stock. Please try again.'); setIsSubmitting(false); return; }
    
    const orderId = 'JJF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const discount = appliedPromo?.discountAmount || 0;
    const discountedSubtotal = totalPrice - discount;
    const tax = Math.round(discountedSubtotal * taxRate);
    const total = discountedSubtotal + tax + actualDeliveryCharge;
    
    try {
      await createOrder.mutateAsync({
        order_id: orderId, customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email, customer_phone: formData.phone,
        shipping_address: formData.address, shipping_city: formData.city,
        shipping_state: formData.state, shipping_zip: formData.zip,
        items: items.map(item => ({ product_id: item.product.id, name: item.product.name, price: item.product.price, quantity: item.quantity })),
        subtotal: discountedSubtotal, tax, total, payment_method: 'cod', status: 'pending'
      });
      await sendOrderConfirmationEmail({ orderId, subtotal: discountedSubtotal, tax, shipping: actualDeliveryCharge, discount, total, paymentMethod: 'cod' });
      if (appliedPromo) { await incrementPromoCodeUsage.mutateAsync(appliedPromo.code); localStorage.removeItem('appliedPromo'); }
      clearCart();
      navigate('/order-confirmation', { state: { orderId, total } });
    } catch (error) { console.error('Order creation failed:', error); toast.error('Failed to place order. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) { toast.error('Payment gateway is loading. Please try again.'); return; }
    setIsSubmitting(true);
    try {
      const stockCheck = await verifyStockAvailability();
      if (!stockCheck.isValid) {
        const messages = stockCheck.outOfStockItems.map(item => item.available === 0 ? `${item.name} is out of stock` : `${item.name}: only ${item.available} available`);
        toast.error(`Stock issue: ${messages.join('. ')}`); setIsSubmitting(false); return;
      }
    } catch { toast.error('Failed to verify stock. Please try again.'); setIsSubmitting(false); return; }
    
    const orderId = 'JJF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const discount = appliedPromo?.discountAmount || 0;
    const discountedSubtotal = totalPrice - discount;
    const tax = Math.round(discountedSubtotal * taxRate);
    const total = discountedSubtotal + tax + actualDeliveryCharge;
    
    try {
      const { data: razorpayData, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: total, currency: 'INR', orderId, customerName: `${formData.firstName} ${formData.lastName}`, customerEmail: formData.email }
      });
      if (razorpayError || razorpayData?.error) throw new Error(razorpayData?.error || razorpayError?.message || 'Failed to create payment order');

      const orderPayload = {
        order_id: orderId, customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email, customer_phone: formData.phone,
        shipping_address: formData.address, shipping_city: formData.city,
        shipping_state: formData.state, shipping_zip: formData.zip,
        items: items.map(item => ({ id: item.product.id, name: item.product.name, price: item.product.price, quantity: item.quantity })),
        subtotal: discountedSubtotal, tax, total, payment_method: 'razorpay'
      };

      const options = {
        key: razorpayData.key, amount: razorpayData.amount, currency: razorpayData.currency,
        name: settings?.business_name || 'JJ Frame Dream', description: `Order ${orderId}`,
        order_id: razorpayData.id,
        prefill: { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, contact: formData.phone },
        notes: { order_id: orderId },
        theme: { color: '#6366f1' },
        handler: async function (response: any) {
          try {
            await createOrder.mutateAsync({ ...orderPayload, status: 'processing' });
            await sendOrderConfirmationEmail({ orderId, subtotal: discountedSubtotal, tax, shipping: actualDeliveryCharge, discount, total, paymentMethod: 'razorpay' });
            if (appliedPromo) { await incrementPromoCodeUsage.mutateAsync(appliedPromo.code); localStorage.removeItem('appliedPromo'); }
            clearCart(); toast.success('Payment successful! Order placed.');
            navigate('/order-confirmation', { state: { orderId, total, paymentId: response.razorpay_payment_id } });
          } catch (err) { toast.error('Payment received but order creation failed. Please contact support.'); setIsSubmitting(false); }
        },
        modal: { ondismiss: function() { setIsSubmitting(false); toast.info('Payment cancelled.'); } }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) { toast.error(`Payment failed: ${response.error.description}`); setIsSubmitting(false); });
      razorpay.open();
    } catch (error: any) { toast.error(error.message || 'Payment failed. Please try again.'); setIsSubmitting(false); }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') await handleCODOrder();
    else await handleRazorpayPayment();
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  const subtotal = totalPrice;
  const discount = appliedPromo?.discountAmount || 0;
  const discountedSubtotal = subtotal - discount;
  const tax = Math.round(discountedSubtotal * taxRate);
  const total = discountedSubtotal + tax + actualDeliveryCharge;

  const OrderSummaryContent = () => (
    <>
      {/* Items */}
      <div className="space-y-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-4 items-center">
            <div className="relative flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-border" />
              <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm leading-tight truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{product.size}</p>
            </div>
            <p className="font-medium text-foreground text-sm whitespace-nowrap">
              {currencySymbol}{(product.price * quantity).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Promo Code */}
      {appliedPromo ? (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-primary">{appliedPromo.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">-{currencySymbol}{discount.toLocaleString('en-IN')}</span>
            <button onClick={handleRemovePromo} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input placeholder="Discount code" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="text-sm" />
          <Button variant="outline" onClick={handleApplyPromo} disabled={isValidatingPromo || !promoCode.trim()} className="px-6 shrink-0">
            {isValidatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
          </Button>
        </div>
      )}

      <Separator className="my-4" />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
        </div>
        {appliedPromo && (
          <div className="flex justify-between text-primary">
            <span>Discount</span>
            <span>-{currencySymbol}{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          {isDeliveryFree ? <span className="text-primary font-medium">Free</span> : <span>{currencySymbol}{actualDeliveryCharge.toLocaleString('en-IN')}</span>}
        </div>
        {taxRate > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{currencySymbol}{tax.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between items-center">
        <span className="text-base font-semibold text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">{currencySymbol}{total.toLocaleString('en-IN')}</span>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-foreground">
            {settings?.business_name || 'JJ Frame Dream'}
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Mobile Order Summary Toggle */}
      <div className="lg:hidden border-b border-border bg-card/50">
        <button
          onClick={() => setShowMobileOrderSummary(!showMobileOrderSummary)}
          className="container mx-auto px-4 py-3 flex items-center justify-between w-full text-sm"
        >
          <span className="text-primary font-medium flex items-center gap-2">
            {showMobileOrderSummary ? 'Hide' : 'Show'} order summary
            <ChevronRight className={`h-4 w-4 transition-transform ${showMobileOrderSummary ? 'rotate-90' : ''}`} />
          </span>
          <span className="text-lg font-bold text-foreground">{currencySymbol}{total.toLocaleString('en-IN')}</span>
        </button>
        {showMobileOrderSummary && (
          <div className="container mx-auto px-4 pb-4">
            <OrderSummaryContent />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-0 lg:gap-16 max-w-6xl mx-auto">
          {/* Left: Form */}
          <div className="py-8 lg:py-12">
            <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-8">
              <ArrowLeft className="h-4 w-4" />
              Return to cart
            </Link>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-8">
              <Link to="/cart" className="hover:text-foreground">Cart</Link>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => setActiveSection('contact')} className={`hover:text-foreground ${activeSection === 'contact' ? 'text-foreground font-medium' : ''}`}>Information</button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => contactComplete ? setActiveSection('shipping') : undefined} className={`hover:text-foreground ${activeSection === 'shipping' ? 'text-foreground font-medium' : ''} ${!contactComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>Shipping</button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => contactComplete && shippingComplete ? setActiveSection('payment') : undefined} className={`hover:text-foreground ${activeSection === 'payment' ? 'text-foreground font-medium' : ''} ${!(contactComplete && shippingComplete) ? 'opacity-50 cursor-not-allowed' : ''}`}>Payment</button>
            </nav>

            {/* Contact Information */}
            {activeSection === 'contact' && (
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Contact information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" />
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-foreground pt-4">Name</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" />
                  </div>
                </div>

                <Button onClick={() => setActiveSection('shipping')} className="w-full" size="lg" disabled={!contactComplete}>
                  Continue to shipping
                </Button>
              </section>
            )}

            {/* Shipping */}
            {activeSection === 'shipping' && (
              <section className="space-y-6">
                {/* Contact summary */}
                <div className="border border-border rounded-lg divide-y divide-border text-sm">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex gap-4">
                      <span className="text-muted-foreground w-16 shrink-0">Contact</span>
                      <span className="text-foreground">{formData.email}</span>
                    </div>
                    <button onClick={() => setActiveSection('contact')} className="text-primary text-xs hover:underline">Change</button>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-foreground">Shipping address</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">PIN code</Label>
                      <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="PIN code" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" value={formData.country} onChange={handleInputChange} disabled />
                    </div>
                  </div>
                </div>

                {/* Shipping method */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Standard Shipping</p>
                        <p className="text-xs text-muted-foreground">5-7 business days</p>
                      </div>
                    </div>
                    {isDeliveryFree ? (
                      <span className="text-primary font-medium text-sm">Free</span>
                    ) : (
                      <span className="text-foreground font-medium text-sm">{currencySymbol}{actualDeliveryCharge.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setActiveSection('contact')} className="text-sm text-primary hover:underline flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Return to information
                  </button>
                  <Button onClick={() => setActiveSection('payment')} size="lg" disabled={!shippingComplete}>
                    Continue to payment
                  </Button>
                </div>
              </section>
            )}

            {/* Payment */}
            {activeSection === 'payment' && (
              <section className="space-y-6">
                {/* Summary boxes */}
                <div className="border border-border rounded-lg divide-y divide-border text-sm">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex gap-4">
                      <span className="text-muted-foreground w-16 shrink-0">Contact</span>
                      <span className="text-foreground truncate">{formData.email}</span>
                    </div>
                    <button onClick={() => setActiveSection('contact')} className="text-primary text-xs hover:underline shrink-0 ml-2">Change</button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex gap-4">
                      <span className="text-muted-foreground w-16 shrink-0">Ship to</span>
                      <span className="text-foreground truncate">{formData.address}, {formData.city}, {formData.state} {formData.zip}</span>
                    </div>
                    <button onClick={() => setActiveSection('shipping')} className="text-primary text-xs hover:underline shrink-0 ml-2">Change</button>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-foreground">Payment</h2>
                <p className="text-sm text-muted-foreground -mt-4">All transactions are secure and encrypted.</p>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-0 border border-border rounded-lg overflow-hidden">
                  <label className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-border ${paymentMethod === 'cod' ? 'bg-primary/5' : 'bg-card'}`}>
                    <RadioGroupItem value="cod" />
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${paymentMethod === 'online' ? 'bg-primary/5' : 'bg-card'}`}>
                    <RadioGroupItem value="online" />
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Pay Online</p>
                      <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking, Wallets</p>
                    </div>
                    <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-5 opacity-60" />
                  </label>
                </RadioGroup>

                {paymentMethod === 'online' && (
                  <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p>You'll be redirected to Razorpay's secure payment page. Your order will only be placed after successful payment.</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setActiveSection('shipping')} className="text-sm text-primary hover:underline flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Return to shipping
                  </button>
                  <Button onClick={handlePlaceOrder} size="lg" disabled={isSubmitting} className="min-w-[180px]">
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                    ) : paymentMethod === 'cod' ? (
                      'Place order'
                    ) : (
                      'Pay now'
                    )}
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Encrypted data</span>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right: Order Summary (Desktop) */}
          <aside className="hidden lg:block border-l border-border bg-card/30 py-12 pl-12">
            <div className="sticky top-8">
              <OrderSummaryContent />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
