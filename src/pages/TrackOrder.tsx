import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, CheckCircle, Clock, Search, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: number;
  items: OrderItem[];
  created_at: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
}

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      toast.error('Please enter both Order ID and Email');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Use secure edge function to lookup order (bypasses RLS safely)
      const { data: response, error } = await supabase.functions.invoke('lookup-order', {
        body: {
          orderId: orderId.trim(),
          email: email.trim().toLowerCase()
        }
      });

      if (error) throw error;

      if (response?.order) {
        setOrder({
          ...response.order,
          items: response.order.items as unknown as OrderItem[]
        } as Order);
      } else {
        setOrder(null);
        toast.error('Order not found. Please check your details.');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const statuses = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm mb-2 block">Order Status</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your order details to see the current status of your delivery.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-card rounded-3xl p-8 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  placeholder="e.g., ORD-1234567890"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email used for the order"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full"
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Track Order
              </Button>
            </form>
          </div>

          {/* Order Results */}
          {searched && !loading && (
            order ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-card rounded-3xl p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{order.order_id}</h2>
                      <p className="text-muted-foreground text-sm">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  {order.status !== 'cancelled' && (
                    <div className="mb-8">
                      <div className="flex justify-between relative">
                        <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(getStatusStep(order.status) / 3) * 100}%` }}
                          />
                        </div>
                        {statuses.map((status, index) => {
                          const StatusIcon = status.icon;
                          const isCompleted = getStatusStep(order.status) >= index;
                          const isCurrent = getStatusStep(order.status) === index;
                          
                          return (
                            <div key={status.key} className="flex flex-col items-center relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                                <StatusIcon className="h-5 w-5" />
                              </div>
                              <span className={`text-xs mt-2 ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {status.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-foreground mb-1">Shipping Address</h3>
                        <p className="text-muted-foreground text-sm">
                          {order.customer_name}<br />
                          {order.shipping_address}<br />
                          {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-card rounded-3xl p-8">
                  <h3 className="font-bold text-foreground mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {(order.items as OrderItem[]).map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-foreground text-lg">₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-3xl p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Order Not Found</h2>
                <p className="text-muted-foreground">
                  We couldn't find an order with those details. Please check your Order ID and email address.
                </p>
              </div>
            )
          )}

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Can't find your order?{' '}
              <a href="/contact" className="text-primary hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;
