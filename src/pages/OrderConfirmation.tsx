import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

const OrderConfirmation = () => {
  const location = useLocation();
  const { data: settings } = useBusinessSettings();
  const { orderId, total } = location.state || { orderId: 'JJF-XXXXXXXX', total: 0 };
  const currencySymbol = settings?.currency_symbol || '₹';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-14 w-14 text-green-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Thank You for Your Order!
          </h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Your order has been successfully placed. We'll send you a confirmation email with tracking details shortly.
          </p>

          {/* Order Details Card */}
          <div className="bg-card rounded-3xl p-8 mb-8 text-left">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="text-xl font-bold text-foreground">{orderId}</p>
              </div>
              <Package className="h-10 w-10 text-primary" />
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-bold text-foreground">{currencySymbol}{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span className="font-medium text-foreground">5-7 Business Days</span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground mb-8">
            If you have any questions about your order, feel free to{' '}
            <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button className="rounded-full px-8">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="rounded-full px-8">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
