import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, Eye, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const statusConfig: Record<string, { label: string; icon: any; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: Clock, variant: 'secondary' },
  processing: { label: 'Processing', icon: Package, variant: 'default' },
  shipped: { label: 'Shipped', icon: Truck, variant: 'outline' },
  delivered: { label: 'Delivered', icon: CheckCircle, variant: 'default' },
  cancelled: { label: 'Cancelled', icon: XCircle, variant: 'destructive' },
};

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const { data: settings } = useBusinessSettings();
  const navigate = useNavigate();
  const currencySymbol = settings?.currency_symbol || '₹';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      // Fetch orders by user_id OR by matching email (for old orders placed before account linking)
      const { data: byUserId, error: err1 } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      const { data: byEmail, error: err2 } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user!.email!)
        .order('created_at', { ascending: false });

      if (err1 && err2) throw err1;
      
      // Merge and deduplicate by order id
      const allOrders = [...(byUserId || []), ...(byEmail || [])];
      const unique = Array.from(new Map(allOrders.map(o => [o.id, o])).values());
      unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return unique;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast.error('Failed to sign out');
    else { toast.success('Signed out successfully'); navigate('/'); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Account</h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{currencySymbol}{totalSpent.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Order History</h2>

        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
              <Button asChild><Link to="/products">Browse Products</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const orderItems = Array.isArray(order.items) ? order.items : [];
              
              return (
                <Card key={order.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{order.order_id}</span>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{currencySymbol}{Number(order.total).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      {orderItems.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                          <span className="text-foreground">{currencySymbol}{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      {orderItems.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{orderItems.length - 3} more items</p>
                      )}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button variant="ghost" size="sm" asChild className="gap-1 text-primary">
                        <Link to={`/track-order?orderId=${order.order_id}&email=${order.customer_email}`}>
                          <Eye className="h-3.5 w-3.5" /> Track Order
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Account;
