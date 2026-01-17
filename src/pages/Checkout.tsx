import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Truck, User, MapPin, Loader2, Tag, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useCreateOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useValidatePromoCode, useIncrementPromoCodeUsage } from '@/hooks/usePromoCodes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const { items, totalPrice, clearCart } = useCart();
  const { data: settings } = useBusinessSettings();
  const createOrder = useCreateOrder();
  const updateOrderStatus = useUpdateOrderStatus();
  const validatePromoCode = useValidatePromoCode();
  const incrementPromoCodeUsage = useIncrementPromoCodeUsage();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Promo code state - load from localStorage if available
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

  const currencySymbol = settings?.currency_symbol || '₹';
  const taxRate = parseFloat(settings?.tax_rate || '0') / 100;
  const deliveryCharge = parseFloat(settings?.delivery_charge || '0');
  const deliveryType = settings?.delivery_type || 'free';
  const freeDeliveryThreshold = parseFloat(settings?.free_delivery_threshold || '0');
  
  // Calculate if delivery is free based on settings
  const isDeliveryFree = deliveryType === 'free' || 
    (deliveryType === 'threshold' && totalPrice >= freeDeliveryThreshold);
  const actualDeliveryCharge = isDeliveryFree ? 0 : deliveryCharge;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle promo code validation
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const result = await validatePromoCode.mutateAsync({
        code: promoCode.trim().toUpperCase(),
        orderAmount: totalPrice
      });
      
      // Calculate discount amount
      let discountAmount = 0;
      if (result.discount_type === 'percentage') {
        discountAmount = Math.round((totalPrice * result.discount_value) / 100);
      } else {
        discountAmount = result.discount_value;
      }
      
      setAppliedPromo({
        code: result.code,
        discount_type: result.discount_type as 'percentage' | 'fixed',
        discount_value: result.discount_value,
        discountAmount
      });
      
      toast.success(`Promo code applied! You save ${currencySymbol}${discountAmount.toLocaleString('en-IN')}`);
    } catch (error: any) {
      toast.error(error.message || 'Invalid promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    localStorage.removeItem('appliedPromo');
    toast.info('Promo code removed');
  };

  const sendOrderConfirmationEmail = async (orderData: {
    orderId: string;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    paymentMethod: string;
  }) => {
    try {
      await supabase.functions.invoke('send-order-email', {
        body: {
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          orderId: orderData.orderId,
          items: items.map(item => ({
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          })),
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping: orderData.shipping,
          discount: orderData.discount,
          total: orderData.total,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingState: formData.state,
          shippingZip: formData.zip,
          paymentMethod: orderData.paymentMethod,
          businessName: settings?.business_name || 'JJ Frame Studio',
          businessEmail: settings?.business_email || 'hello@jjframestudio.com',
          businessPhone: settings?.business_phone || '+91 98765 43210',
          currencySymbol
        }
      });
      console.log('Order confirmation email sent successfully');
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Don't fail the order if email fails
    }
  };

  const handleCODOrder = async () => {
    setIsSubmitting(true);
    
    const orderId = 'JJF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const subtotal = totalPrice;
    const discount = appliedPromo?.discountAmount || 0;
    const discountedSubtotal = subtotal - discount;
    const tax = Math.round(discountedSubtotal * taxRate);
    const total = discountedSubtotal + tax + actualDeliveryCharge;
    
    try {
      await createOrder.mutateAsync({
        order_id: orderId,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_zip: formData.zip,
        items: items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        subtotal: discountedSubtotal,
        tax,
        total,
        payment_method: 'cod',
        status: 'pending'
      });

      // Send order confirmation email
      await sendOrderConfirmationEmail({
        orderId,
        subtotal: discountedSubtotal,
        tax,
        shipping: actualDeliveryCharge,
        discount,
        total,
        paymentMethod: 'cod'
      });

      // Increment promo code usage if applied
      if (appliedPromo) {
        await incrementPromoCodeUsage.mutateAsync(appliedPromo.code);
        localStorage.removeItem('appliedPromo');
      }

      clearCart();
      navigate('/order-confirmation', { state: { orderId, total } });
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading. Please try again.');
      return;
    }

    setIsSubmitting(true);
    
    const orderId = 'JJF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const subtotal = totalPrice;
    const discount = appliedPromo?.discountAmount || 0;
    const discountedSubtotal = subtotal - discount;
    const tax = Math.round(discountedSubtotal * taxRate);
    const total = discountedSubtotal + tax + actualDeliveryCharge;
    
    try {
      // Create Razorpay order via edge function FIRST (before creating DB order)
      const { data: razorpayData, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: total,
          currency: 'INR',
          orderId: orderId,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email
        }
      });

      if (razorpayError || razorpayData?.error) {
        throw new Error(razorpayData?.error || razorpayError?.message || 'Failed to create payment order');
      }

      // Store order data for later use after payment success
      const orderPayload = {
        order_id: orderId,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_zip: formData.zip,
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        subtotal: discountedSubtotal,
        tax,
        total,
        payment_method: 'razorpay'
      };

      // Open Razorpay checkout - order will only be created after successful payment
      const options = {
        key: razorpayData.key,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: settings?.business_name || 'JJ Frame Dream',
        description: `Order ${orderId}`,
        order_id: razorpayData.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          order_id: orderId
        },
        theme: {
          color: '#6366f1'
        },
        handler: async function (response: any) {
          console.log('Payment successful:', response);
          
          // Only create order in database AFTER successful payment
          try {
            await createOrder.mutateAsync({
              ...orderPayload,
              status: 'processing' // Order is confirmed since payment succeeded
            });

            // Send order confirmation email
            await sendOrderConfirmationEmail({
              orderId,
              subtotal: discountedSubtotal,
              tax,
              shipping: actualDeliveryCharge,
              discount,
              total,
              paymentMethod: 'razorpay'
            });
            
            // Increment promo code usage if applied
            if (appliedPromo) {
              await incrementPromoCodeUsage.mutateAsync(appliedPromo.code);
              localStorage.removeItem('appliedPromo');
            }
            
            clearCart();
            toast.success('Payment successful! Order placed.');
            navigate('/order-confirmation', { 
              state: { 
                orderId, 
                total, 
                paymentId: response.razorpay_payment_id 
              } 
            });
          } catch (err) {
            console.error('Failed to create order after payment:', err);
            toast.error('Payment received but order creation failed. Please contact support.');
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
            toast.info('Payment cancelled. No order was placed.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}. No order was placed.`);
        setIsSubmitting(false);
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      await handleCODOrder();
    } else {
      await handleRazorpayPayment();
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const steps = [
    { number: 1, title: 'Customer Info', icon: User },
    { number: 2, title: 'Shipping', icon: MapPin },
    { number: 3, title: 'Payment', icon: CreditCard }
  ];

  const subtotal = totalPrice;
  const discount = appliedPromo?.discountAmount || 0;
  const discountedSubtotal = subtotal - discount;
  const tax = Math.round(discountedSubtotal * taxRate);
  const total = discountedSubtotal + tax + actualDeliveryCharge;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center">
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  step >= s.number 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card text-muted-foreground'
                }`}
              >
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-3xl p-6 md:p-8">
              {/* Step 1: Customer Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">Customer Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="rounded-full"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="rounded-full"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="rounded-full"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="rounded-full"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <Button 
                    onClick={() => setStep(2)} 
                    className="w-full rounded-full"
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                  >
                    Continue to Shipping
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">Shipping Address</h2>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="rounded-full"
                      placeholder="123 Frame Street"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="rounded-full"
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="rounded-full"
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">PIN Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="rounded-full"
                        placeholder="400001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="rounded-full"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="bg-accent/50 rounded-2xl p-4 flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Free Standard Shipping</p>
                      <p className="text-sm text-muted-foreground">Delivery in 5-7 business days</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full">
                      Back
                    </Button>
                    <Button 
                      onClick={() => setStep(3)} 
                      className="flex-1 rounded-full"
                      disabled={!formData.address || !formData.city || !formData.state || !formData.zip}
                    >
                      Continue to Payment
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">Payment Method</h2>
                  
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}>
                      <RadioGroupItem value="cod" />
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}>
                      <RadioGroupItem value="online" />
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Pay Online (Razorpay)</p>
                        <p className="text-sm text-muted-foreground">UPI, Credit/Debit Card, Net Banking, Wallets</p>
                      </div>
                      <div className="flex gap-1">
                        <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6" />
                      </div>
                    </label>
                  </RadioGroup>

                  {paymentMethod === 'online' && (
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        🔒 Secure Payment via Razorpay
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click "Proceed to Pay" to open Razorpay's secure payment page. Your order will only be placed after successful payment.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="text-xs bg-background px-2 py-1 rounded-full text-muted-foreground">UPI</span>
                        <span className="text-xs bg-background px-2 py-1 rounded-full text-muted-foreground">Credit Card</span>
                        <span className="text-xs bg-background px-2 py-1 rounded-full text-muted-foreground">Debit Card</span>
                        <span className="text-xs bg-background px-2 py-1 rounded-full text-muted-foreground">Net Banking</span>
                        <span className="text-xs bg-background px-2 py-1 rounded-full text-muted-foreground">Wallets</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-full">
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      className="flex-1 rounded-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : paymentMethod === 'cod' ? (
                        'Place Order'
                      ) : (
                        'Proceed to Pay'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                    </div>
                    <p className="font-medium text-foreground">
                      {currencySymbol}{(product.price * quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo Code Section */}
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground text-sm">Promo Code</span>
                </div>
                
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary text-sm">{appliedPromo.code}</span>
                      <span className="text-xs text-muted-foreground">
                        ({appliedPromo.discount_type === 'percentage' 
                          ? `${appliedPromo.discount_value}% off` 
                          : `${currencySymbol}${appliedPromo.discount_value} off`})
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={handleRemovePromo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="rounded-xl flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApplyPromo}
                      disabled={isValidatingPromo || !promoCode.trim()}
                      className="rounded-xl"
                    >
                      {isValidatingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-primary">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-{currencySymbol}{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  {isDeliveryFree ? (
                    <span className="text-primary font-medium">Free</span>
                  ) : (
                    <span>{currencySymbol}{actualDeliveryCharge.toLocaleString('en-IN')}</span>
                  )}
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({Math.round(taxRate * 100)}%)</span>
                    <span>{currencySymbol}{tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{currencySymbol}{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
