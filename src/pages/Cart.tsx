import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useValidatePromoCode, PromoCode } from '@/hooks/usePromoCodes';
import { toast } from 'sonner';

interface StoredPromo {
  code: string;
  discountAmount: number;
  promoData: PromoCode;
}

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const { data: settings } = useBusinessSettings();
  const validatePromoCode = useValidatePromoCode();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<StoredPromo | null>(() => {
    const saved = localStorage.getItem('appliedPromo');
    return saved ? JSON.parse(saved) : null;
  });
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  
  const currencySymbol = settings?.currency_symbol || '₹';
  
  // Get tax and delivery settings
  const taxRate = parseFloat(settings?.tax_rate || '0') / 100;
  const deliveryCharge = parseFloat(settings?.delivery_charge || '0');
  const deliveryType = settings?.delivery_type || 'free';
  const freeDeliveryThreshold = parseFloat(settings?.free_delivery_threshold || '0');
  
  // Calculate if delivery is free based on settings
  const isDeliveryFree = deliveryType === 'free' || 
    (deliveryType === 'threshold' && totalPrice >= freeDeliveryThreshold);
  const actualDeliveryCharge = isDeliveryFree ? 0 : deliveryCharge;
  
  // Recalculate discount when totalPrice changes (in case items changed)
  useEffect(() => {
    if (appliedPromo && totalPrice > 0) {
      let discountAmount = 0;
      if (appliedPromo.promoData.discount_type === 'percentage') {
        discountAmount = Math.round(totalPrice * (appliedPromo.promoData.discount_value / 100));
      } else {
        discountAmount = Math.min(appliedPromo.promoData.discount_value, totalPrice);
      }
      if (discountAmount !== appliedPromo.discountAmount) {
        const updatedPromo = { ...appliedPromo, discountAmount };
        setAppliedPromo(updatedPromo);
        localStorage.setItem('appliedPromo', JSON.stringify(updatedPromo));
      }
    }
  }, [totalPrice]);
  
  // Calculate totals with promo discount
  const discount = appliedPromo?.discountAmount || 0;
  const discountedSubtotal = totalPrice - discount;
  const taxAmount = Math.round(discountedSubtotal * taxRate);
  const grandTotal = discountedSubtotal + taxAmount + actualDeliveryCharge;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const promo = await validatePromoCode.mutateAsync({
        code: promoCode.trim(),
        orderAmount: totalPrice,
      });

      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = Math.round(totalPrice * (promo.discount_value / 100));
      } else {
        discountAmount = Math.min(promo.discount_value, totalPrice);
      }

      const promoToStore: StoredPromo = {
        code: promo.code,
        discountAmount,
        promoData: promo,
      };
      
      setAppliedPromo(promoToStore);
      localStorage.setItem('appliedPromo', JSON.stringify(promoToStore));
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

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any frames to your cart yet.
            </p>
            <Link to="/products">
              <Button className="rounded-full px-8">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-card rounded-3xl p-4 md:p-6 flex gap-4">
                <Link to={`/product/${product.id}`} className="flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{product.size}</p>
                      {product.original_price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {currencySymbol}{product.original_price.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center bg-background rounded-full">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-lg font-bold text-primary">
                      {currencySymbol}{(product.price * quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

              {/* Promo Code Section */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">Promo Code</label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-primary/10 rounded-full px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">{appliedPromo.code}</span>
                      <span className="text-sm text-muted-foreground">
                        (-{currencySymbol}{appliedPromo.discountAmount.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={handleRemovePromo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="rounded-full"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      disabled={isValidatingPromo}
                      className="rounded-full"
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

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{currencySymbol}{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{currencySymbol}{appliedPromo.discountAmount.toLocaleString('en-IN')}</span>
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
                    <span>{currencySymbol}{taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{currencySymbol}{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link to="/checkout" className="block">
                <Button className="w-full rounded-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <Link to="/products" className="block mt-4">
                <Button variant="ghost" className="w-full rounded-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
