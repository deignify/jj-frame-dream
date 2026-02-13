import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

const OrderConfirmation = () => {
  const location = useLocation();
  const { data: settings } = useBusinessSettings();
  const { orderId, total, paymentId } = location.state || { orderId: 'JJF-XXXXXXXX', total: 0 };
  const currencySymbol = settings?.currency_symbol || '₹';

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-bold text-foreground">
            {settings?.business_name || 'JJ Frame Dream'}
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-xl mx-auto">
          {/* Success */}
          <div className="flex items-start gap-5 mb-8">
            <CheckCircle className="h-12 w-12 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order #{orderId}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Thank you for your purchase!
              </h1>
            </div>
          </div>

          {/* Order updates box */}
          <div className="border border-border rounded-lg p-5 mb-6">
            <h2 className="font-semibold text-foreground mb-2">Order updates</h2>
            <p className="text-sm text-muted-foreground">
              You'll receive an order confirmation email with tracking details shortly.
            </p>
          </div>

          {/* Order details */}
          <div className="border border-border rounded-lg divide-y divide-border mb-6">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Order details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium text-foreground">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-foreground">{currencySymbol}{total.toLocaleString('en-IN')}</span>
                </div>
                {paymentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID</span>
                    <span className="font-medium text-foreground text-xs">{paymentId}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground text-sm">Estimated delivery</p>
                  <p className="text-xs text-muted-foreground">5-7 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help */}
          <p className="text-sm text-muted-foreground mb-8">
            Need help?{' '}
            <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
            {' '}or{' '}
            <Link to="/track-order" className="text-primary hover:underline">track your order</Link>.
          </p>

          <Separator className="mb-8" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/products" className="flex-1">
              <Button className="w-full" size="lg">
                Continue shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
