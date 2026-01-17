import { useMemo } from 'react';
import { TrendingUp, Package, DollarSign, ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/hooks/useOrders';

interface OrderAnalyticsProps {
  orders: Order[];
  currencySymbol?: string;
}

const OrderAnalytics = ({ orders, currencySymbol = '₹' }: OrderAnalyticsProps) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);
    const weekOrders = orders.filter(o => new Date(o.created_at) >= sevenDaysAgo);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const recentRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalOrders: orders.length,
      totalRevenue,
      recentOrders: recentOrders.length,
      recentRevenue,
      weekOrders: weekOrders.length,
      statusCounts,
      avgOrderValue
    };
  }, [orders]);

  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Status', 'Total', 'Payment Method', 'Date'];
    const rows = orders.map(o => [
      o.order_id,
      o.customer_name,
      o.customer_email,
      o.customer_phone || '',
      o.status,
      o.total.toString(),
      o.payment_method,
      new Date(o.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalOrders}</p>
          <p className="text-sm text-muted-foreground">Total Orders</p>
        </div>

        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {currencySymbol}{analytics.totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>

        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {currencySymbol}{Math.round(analytics.avgOrderValue).toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-muted-foreground">Avg Order Value</p>
        </div>

        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.weekOrders}</p>
          <p className="text-sm text-muted-foreground">Orders (7 days)</p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(analytics.statusCounts).map(([status, count]) => (
          <span
            key={status}
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              status === 'delivered' ? 'bg-green-100 text-green-700' :
              status === 'shipped' ? 'bg-blue-100 text-blue-700' :
              status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
              status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-muted text-muted-foreground'
            }`}
          >
            {status}: {count}
          </span>
        ))}
      </div>

      {/* Export Button */}
      <Button variant="outline" onClick={exportOrdersCSV} className="rounded-full">
        <Download className="h-4 w-4 mr-2" />
        Export Orders CSV
      </Button>
    </div>
  );
};

export default OrderAnalytics;
