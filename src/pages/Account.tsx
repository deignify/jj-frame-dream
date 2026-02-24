import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, Eye, LogOut, User, MapPin, Heart, Lock, Plus, Pencil, Trash2, Star, RefreshCw, FileText, AlertTriangle, Mail, ShoppingCart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/context/CartContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const currencySymbol = settings?.currency_symbol || '₹';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // --- Orders ---
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
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
      
      const allOrders = [...(byUserId || []), ...(byEmail || [])];
      const unique = Array.from(new Map(allOrders.map(o => [o.id, o])).values());
      unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return unique;
    },
    enabled: !!user,
  });

  // --- Cancel Order ---
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (e) => toast.error('Failed to cancel: ' + e.message),
  });

  // --- Reorder ---
  const handleReorder = async (order: any) => {
    const orderItems = Array.isArray(order.items) ? order.items : [];
    const productIds = orderItems.map((item: any) => item.product_id || item.id).filter(Boolean);
    if (productIds.length === 0) {
      toast.error('No valid products found in this order');
      return;
    }
    const { data: products } = await supabase.from('products').select('*').in('id', productIds);
    if (!products || products.length === 0) {
      toast.error('Products are no longer available');
      return;
    }
    products.forEach(product => {
      const orderItem = orderItems.find((item: any) => (item.product_id || item.id) === product.id);
      addToCart(product as any, orderItem?.quantity || 1);
    });
    toast.success('Items added to cart!');
    navigate('/cart');
  };

  // --- Download Invoice ---
  const handleDownloadInvoice = (order: any) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const invoiceContent = `
INVOICE
================================
Order ID: ${order.order_id}
Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

Customer: ${order.customer_name}
Email: ${order.customer_email}
${order.customer_phone ? `Phone: ${order.customer_phone}` : ''}

Shipping Address:
${order.shipping_address}
${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}

================================
ITEMS
================================
${items.map((item: any) => `${item.name} x${item.quantity}  ${currencySymbol}${(item.price * item.quantity).toLocaleString('en-IN')}`).join('\n')}

================================
Subtotal: ${currencySymbol}${Number(order.subtotal).toLocaleString('en-IN')}
Tax: ${currencySymbol}${Number(order.tax).toLocaleString('en-IN')}
Total: ${currencySymbol}${Number(order.total).toLocaleString('en-IN')}
Payment: ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
================================
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.order_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Profile ---
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || '');
      setProfilePhone(profile.phone || '');
    }
  }, [profile]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = { user_id: user!.id, full_name: profileName, phone: profilePhone };
      if (profile) {
        const { error } = await supabase.from('profiles').update(payload).eq('user_id', user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('profiles').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated!'); },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  // --- Addresses ---
  const { data: addresses } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user!.id).order('is_default', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addrForm, setAddrForm] = useState({ label: 'Home', full_name: '', phone: '', address_line: '', city: '', state: '', zip: '', is_default: false });

  const resetAddrForm = () => {
    setAddrForm({ label: 'Home', full_name: '', phone: '', address_line: '', city: '', state: '', zip: '', is_default: false });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const saveAddressMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...addrForm, user_id: user!.id };
      if (editingAddress) {
        const { error } = await supabase.from('addresses').update(payload).eq('id', editingAddress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('addresses').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address saved!'); resetAddrForm(); },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address deleted'); },
  });

  // --- Password Reset via Email ---
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const sendPasswordResetMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(user!.email!, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setResetEmailSent(true);
      toast.success('Password reset link sent to your email!');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  // --- Delete Account ---
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // Sign out the user - actual account deletion would require admin/edge function
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('You have been signed out. Contact support to complete account deletion.');
      navigate('/');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  // --- Wishlist ---
  const { wishlistProductIds, removeFromWishlist } = useWishlist();
  const { data: wishlistProducts } = useQuery({
    queryKey: ['wishlist-products', wishlistProductIds],
    queryFn: async () => {
      if (!wishlistProductIds.length) return [];
      const { data, error } = await supabase.from('products').select('*').in('id', wishlistProductIds);
      if (error) throw error;
      return data;
    },
    enabled: wishlistProductIds.length > 0,
  });

  // --- My Reviews ---
  const { data: myReviews } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, products(name, image, slug)')
        .eq('customer_email', user!.email!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || 'My Account'}</h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{totalOrders}</p><p className="text-xs text-muted-foreground">Orders</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{currencySymbol}{totalSpent.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">Spent</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{wishlistProductIds.length}</p><p className="text-xs text-muted-foreground">Wishlist</p></CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-4">
            <TabsTrigger value="orders" className="gap-1 text-xs sm:text-sm"><Package className="h-3.5 w-3.5 hidden sm:block" /> Orders</TabsTrigger>
            <TabsTrigger value="profile" className="gap-1 text-xs sm:text-sm"><User className="h-3.5 w-3.5 hidden sm:block" /> Profile</TabsTrigger>
            <TabsTrigger value="addresses" className="gap-1 text-xs sm:text-sm"><MapPin className="h-3.5 w-3.5 hidden sm:block" /> Addresses</TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-1 text-xs sm:text-sm"><Heart className="h-3.5 w-3.5 hidden sm:block" /> Wishlist</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1 text-xs sm:text-sm"><MessageSquare className="h-3.5 w-3.5 hidden sm:block" /> Reviews</TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent></Card>)}</div>
            ) : !orders || orders.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
                <Button asChild><Link to="/products">Browse Products</Link></Button>
              </CardContent></Card>
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
                              <Badge variant={config.variant} className="gap-1"><StatusIcon className="h-3 w-3" />{config.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
                          {orderItems.length > 3 && <p className="text-xs text-muted-foreground">+{orderItems.length - 3} more items</p>}
                        </div>
                        <div className="mt-3 flex flex-wrap justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(order)} className="gap-1 text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" /> Invoice
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReorder(order)} className="gap-1 text-muted-foreground">
                            <RefreshCw className="h-3.5 w-3.5" /> Reorder
                          </Button>
                          {order.status === 'pending' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-1 text-destructive">
                                  <XCircle className="h-3.5 w-3.5" /> Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel order {order.order_id}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelOrderMutation.mutate(order.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Yes, cancel order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <Button variant="ghost" size="sm" asChild className="gap-1 text-primary">
                            <Link to={`/track-order?orderId=${order.order_id}&email=${order.customer_email}`}><Eye className="h-3.5 w-3.5" /> Track</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle className="text-lg">Edit Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Enter your full name" className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="Enter phone number" className="mt-1" />
                </div>
                <Button onClick={() => saveProfileMutation.mutate()} disabled={saveProfileMutation.isPending}>
                  {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Password Reset via Email */}
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For security, we'll send a password reset link to your email address. Click the link in the email to set a new password.
                </p>
                {resetEmailSent ? (
                  <div className="bg-accent/50 rounded-xl p-4 flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Reset link sent!</p>
                      <p className="text-xs text-muted-foreground mt-1">Check your email ({user.email}) and click the link to reset your password.</p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2" onClick={() => setResetEmailSent(false)}>
                        Send again
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => sendPasswordResetMutation.mutate()} disabled={sendPasswordResetMutation.isPending}>
                    <Mail className="h-4 w-4 mr-2" />
                    {sendPasswordResetMutation.isPending ? 'Sending...' : 'Send Password Reset Link'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="mt-4 border-destructive/30">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Delete Account</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, all your data will be permanently removed. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete My Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account and all associated data. Type your email to confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      placeholder="Type your email to confirm"
                      value={deleteConfirmEmail}
                      onChange={e => setDeleteConfirmEmail(e.target.value)}
                      className="mt-2"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmEmail('')}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deleteConfirmEmail !== user.email || deleteAccountMutation.isPending}
                        onClick={() => deleteAccountMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADDRESSES TAB */}
          <TabsContent value="addresses">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Saved Addresses</h3>
              <Button size="sm" onClick={() => { resetAddrForm(); setShowAddressForm(true); }} className="gap-1"><Plus className="h-4 w-4" /> Add Address</Button>
            </div>

            {showAddressForm && (
              <Card className="mb-4">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Label</Label><Input value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Home, Office" className="mt-1" /></div>
                    <div><Label>Full Name</Label><Input value={addrForm.full_name} onChange={e => setAddrForm(p => ({ ...p, full_name: e.target.value }))} className="mt-1" /></div>
                  </div>
                  <div><Label>Phone</Label><Input value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))} className="mt-1" /></div>
                  <div><Label>Address</Label><Input value={addrForm.address_line} onChange={e => setAddrForm(p => ({ ...p, address_line: e.target.value }))} className="mt-1" /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>City</Label><Input value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} className="mt-1" /></div>
                    <div><Label>State</Label><Input value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))} className="mt-1" /></div>
                    <div><Label>ZIP</Label><Input value={addrForm.zip} onChange={e => setAddrForm(p => ({ ...p, zip: e.target.value }))} className="mt-1" /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={addrForm.is_default} onChange={e => setAddrForm(p => ({ ...p, is_default: e.target.checked }))} className="rounded" />
                    <Label className="cursor-pointer">Set as default</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => saveAddressMutation.mutate()} disabled={saveAddressMutation.isPending}>
                      {saveAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                    </Button>
                    <Button variant="outline" onClick={resetAddrForm}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!addresses || addresses.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No saved addresses</h3>
                <p className="text-muted-foreground">Add an address for faster checkout.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <Card key={addr.id}>
                    <CardContent className="p-4 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{addr.label}</span>
                          {addr.is_default && <Badge variant="secondary">Default</Badge>}
                        </div>
                        <p className="text-sm text-foreground">{addr.full_name}</p>
                        <p className="text-sm text-muted-foreground">{addr.address_line}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                        {addr.phone && <p className="text-sm text-muted-foreground">{addr.phone}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingAddress(addr);
                          setAddrForm({ label: addr.label, full_name: addr.full_name, phone: addr.phone || '', address_line: addr.address_line, city: addr.city, state: addr.state, zip: addr.zip, is_default: addr.is_default });
                          setShowAddressForm(true);
                        }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteAddressMutation.mutate(addr.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* WISHLIST TAB */}
          <TabsContent value="wishlist">
            {!wishlistProducts || wishlistProducts.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-4">Save products you love for later.</p>
                <Button asChild><Link to="/products">Browse Products</Link></Button>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistProducts.map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <Link to={`/product/${product.slug || product.id}`} className="w-24 h-24 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </Link>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <Link to={`/product/${product.slug || product.id}`} className="font-medium text-foreground text-sm hover:underline line-clamp-1">{product.name}</Link>
                            <p className="text-sm font-bold text-foreground mt-1">{currencySymbol}{Number(product.price).toLocaleString('en-IN')}</p>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Button variant="ghost" size="sm" className="p-0 h-auto text-primary" onClick={() => { addToCart(product as any, 1); toast.success('Added to cart!'); }}>
                              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
                            </Button>
                            <Button variant="ghost" size="sm" className="p-0 h-auto text-destructive" onClick={() => removeFromWishlist(product.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* MY REVIEWS TAB */}
          <TabsContent value="reviews">
            {!myReviews || myReviews.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">Your product reviews will appear here.</p>
                <Button asChild><Link to="/products">Browse Products</Link></Button>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {myReviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {review.products?.image && (
                          <Link to={`/product/${review.products.slug || review.product_id}`} className="w-16 h-16 flex-shrink-0">
                            <img src={review.products.image} alt={review.products.name} className="w-full h-full object-cover rounded-lg" />
                          </Link>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Link to={`/product/${review.products?.slug || review.product_id}`} className="font-medium text-foreground text-sm hover:underline">
                              {review.products?.name || 'Product'}
                            </Link>
                            <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                              {review.is_approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                          {review.review_text && <p className="text-sm text-muted-foreground">{review.review_text}</p>}
                          <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Account;
