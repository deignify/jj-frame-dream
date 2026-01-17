import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Package, ShoppingCart, Eye, Settings, LogIn, LogOut, Loader2, Save, X, MapPin, Phone, Mail, Tag, CreditCard, FileSpreadsheet, Search, Filter, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useBusinessSettings, useUpdateBusinessSettings } from '@/hooks/useBusinessSettings';
import { usePromoCodes, useCreatePromoCode, useUpdatePromoCode, useDeletePromoCode, PromoCode } from '@/hooks/usePromoCodes';
import { useAuth } from '@/hooks/useAuth';
import { ImageUpload, MultiImageUpload } from '@/components/ImageUpload';
import { BulkProductCSV } from '@/components/BulkProductCSV';
import { toast } from 'sonner';
import LowStockAlert from '@/components/LowStockAlert';
import OrderAnalytics from '@/components/OrderAnalytics';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

// Predefined sizes for photo frames
const FRAME_SIZES = [
  '4x6 inches',
  '5x7 inches',
  '6x8 inches',
  '8x10 inches',
  '8x12 inches',
  '10x12 inches',
  '11x14 inches',
  '12x16 inches',
  '12x18 inches',
  '16x20 inches',
  '18x24 inches',
  '20x24 inches',
  '24x30 inches',
  '24x36 inches',
  'A4 (8.3x11.7 inches)',
  'A3 (11.7x16.5 inches)',
];

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signIn, signOut } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: settings, isLoading: settingsLoading } = useBusinessSettings();
  const { data: promoCodes, isLoading: promoCodesLoading } = usePromoCodes();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateSettings = useUpdateBusinessSettings();
  const createPromoCode = useCreatePromoCode();
  const updatePromoCode = useUpdatePromoCode();
  const deletePromoCode = useDeletePromoCode();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof orders extends (infer T)[] | undefined ? T : never | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Pagination states
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  
  // Filter states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    category: 'wooden',
    material: '',
    size: '8x10 inches',
    color: '',
    description: '',
    image: '',
    images: [] as string[],
    features: '',
    care_instructions: '',
    in_stock: true,
    featured: false,
    stock_quantity: '10'
  });

  const [promoFormData, setPromoFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '0',
    max_uses: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true
  });

  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_tagline: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    currency_symbol: '',
    tax_rate: '',
    delivery_charge: '',
    delivery_type: 'free',
    free_delivery_threshold: ''
  });

  useEffect(() => {
    if (settings) {
      setBusinessForm({
        business_name: settings.business_name || '',
        business_tagline: settings.business_tagline || '',
        business_email: settings.business_email || '',
        business_phone: settings.business_phone || '',
        business_address: settings.business_address || '',
        currency_symbol: settings.currency_symbol || '₹',
        tax_rate: settings.tax_rate || '0',
        delivery_charge: settings.delivery_charge || '0',
        delivery_type: settings.delivery_type || 'free',
        free_delivery_threshold: settings.free_delivery_threshold || '0'
      });
    }
  }, [settings]);

  // Pagination calculations
  const paginatedProducts = products?.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE) || [];
  const totalProductPages = Math.ceil((products?.length || 0) / ITEMS_PER_PAGE);
  
  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      const matchesSearch = orderSearch === '' || 
        order.order_id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);
  
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);
  const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  
  // Reset order page when filters change
  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, orderStatusFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      toast.error('Login failed: ' + error.message);
    } else {
      toast.success('Logged in successfully!');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully!');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      original_price: '',
      category: 'wooden',
      material: '',
      size: '8x10 inches',
      color: '',
      description: '',
      image: '',
      images: [],
      features: '',
      care_instructions: '',
      in_stock: true,
      featured: false,
      stock_quantity: '10'
    });
    setEditingProduct(null);
  };

  const resetPromoForm = () => {
    setPromoFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '0',
      max_uses: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true
    });
    setEditingPromo(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category: product.category,
      material: product.material,
      size: product.size,
      color: product.color,
      description: product.description || '',
      image: product.image,
      images: product.images || [],
      features: product.features?.join('\n') || '',
      care_instructions: product.care_instructions?.join('\n') || '',
      in_stock: product.in_stock,
      featured: product.featured,
      stock_quantity: product.stock_quantity?.toString() || '0'
    });
    setIsDialogOpen(true);
  };

  const openOrderDialog = (order: typeof orders extends (infer T)[] | undefined ? T : never) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const openPromoEditDialog = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoFormData({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value.toString(),
      min_order_amount: promo.min_order_amount.toString(),
      max_uses: promo.max_uses?.toString() || '',
      valid_from: promo.valid_from.split('T')[0],
      valid_until: promo.valid_until?.split('T')[0] || '',
      is_active: promo.is_active
    });
    setIsPromoDialogOpen(true);
  };

  const handleSubmitProduct = async () => {
    const stockQty = parseInt(formData.stock_quantity) || 0;
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      image: formData.image || '/placeholder.svg',
      images: formData.images,
      category: formData.category,
      material: formData.material,
      size: formData.size,
      color: formData.color,
      description: formData.description,
      features: formData.features.split('\n').filter(f => f.trim()),
      care_instructions: formData.care_instructions.split('\n').filter(c => c.trim()),
      in_stock: stockQty > 0,
      featured: formData.featured,
      stock_quantity: stockQty
    };

    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
    } else {
      await createProduct.mutateAsync(productData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmitPromo = async () => {
    const promoData = {
      code: promoFormData.code,
      discount_type: promoFormData.discount_type,
      discount_value: parseFloat(promoFormData.discount_value),
      min_order_amount: parseFloat(promoFormData.min_order_amount) || 0,
      max_uses: promoFormData.max_uses ? parseInt(promoFormData.max_uses) : null,
      valid_from: promoFormData.valid_from,
      valid_until: promoFormData.valid_until || null,
      is_active: promoFormData.is_active
    };

    if (editingPromo) {
      await updatePromoCode.mutateAsync({ id: editingPromo.id, ...promoData });
    } else {
      await createPromoCode.mutateAsync(promoData);
    }

    setIsPromoDialogOpen(false);
    resetPromoForm();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      await deletePromoCode.mutateAsync(id);
    }
  };

  const handleSaveSettings = async () => {
    await updateSettings.mutateAsync(businessForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStockColor = (quantity: number) => {
    if (quantity <= 0) return 'bg-red-100 text-red-700';
    if (quantity <= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Login Form
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-3xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogIn className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
                <p className="text-muted-foreground mt-2">Sign in to access the admin panel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="rounded-full"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="rounded-full"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={isLoggingIn}>
                  {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not Admin
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">You don't have admin privileges.</p>
          <Button onClick={handleLogout} variant="outline" className="rounded-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products, orders, promo codes and settings</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="rounded-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-card rounded-full p-1 flex-wrap h-auto">
            <TabsTrigger value="products" className="rounded-full gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="promo-codes" className="rounded-full gap-2">
              <Tag className="h-4 w-4" />
              Promo Codes
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-card rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-foreground">Products ({products?.length || 0})</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <BulkProductCSV products={products || []} />
                  <Button 
                    className="rounded-full"
                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map(product => (
                          <tr key={product.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-xl" />
                                <div>
                                  <p className="font-medium text-foreground">{product.name}</p>
                                  <p className="text-sm text-muted-foreground">{product.size}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full capitalize">
                                {product.category}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-foreground">₹{product.price.toLocaleString('en-IN')}</p>
                              {product.original_price && (
                                <p className="text-sm text-muted-foreground line-through">₹{product.original_price.toLocaleString('en-IN')}</p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStockColor(product.stock_quantity)}`}>
                                {product.stock_quantity} in stock
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => openEditDialog(product)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Product Pagination */}
                  {totalProductPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => productPage > 1 && setProductPage(productPage - 1)}
                              className={productPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(page => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setProductPage(page)}
                                isActive={productPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => productPage < totalProductPages && setProductPage(productPage + 1)}
                              className={productPage === totalProductPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="bg-card rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Orders ({filteredOrders.length}{filteredOrders.length !== (orders?.length || 0) ? ` of ${orders?.length}` : ''})
                </h2>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-9 rounded-full w-full sm:w-48"
                    />
                  </div>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="rounded-full w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {orders?.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                  </p>
                  {orders && orders.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="mt-4 rounded-full"
                      onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map(order => (
                          <tr key={order.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                            <td className="py-4 px-4">
                              <p className="font-mono text-sm text-foreground">{order.order_id}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-foreground">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-foreground">₹{order.total.toLocaleString('en-IN')}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-IN')}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus.mutate({ id: order.id, status: value })}
                              >
                                <SelectTrigger className={`w-32 rounded-full text-xs h-8 ${getStatusColor(order.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-4 px-4">
                              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => openOrderDialog(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Order Pagination */}
                  {totalOrderPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => orderPage > 1 && setOrderPage(orderPage - 1)}
                              className={orderPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(page => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setOrderPage(page)}
                                isActive={orderPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => orderPage < totalOrderPages && setOrderPage(orderPage + 1)}
                              className={orderPage === totalOrderPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promo-codes">
            <div className="bg-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Promo Codes ({promoCodes?.length || 0})</h2>
                <Button 
                  className="rounded-full"
                  onClick={() => { resetPromoForm(); setIsPromoDialogOpen(true); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promo Code
                </Button>
              </div>

              {promoCodesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : promoCodes?.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No promo codes yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Discount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Min Order</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usage</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodes?.map(promo => (
                        <tr key={promo.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-mono font-bold text-foreground">{promo.code}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-foreground">
                              {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `₹${promo.discount_value}`}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-muted-foreground">₹{promo.min_order_amount}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-muted-foreground">
                              {promo.used_count} / {promo.max_uses || '∞'}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {promo.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => openPromoEditDialog(promo)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeletePromo(promo.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Business Settings */}
              <div className="bg-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Business Settings</h2>

                {settingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6 max-w-2xl">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input
                          value={businessForm.business_name}
                          onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                          className="rounded-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency Symbol</Label>
                        <Input
                          value={businessForm.currency_symbol}
                          onChange={(e) => setBusinessForm({ ...businessForm, currency_symbol: e.target.value })}
                          className="rounded-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input
                        value={businessForm.business_tagline}
                        onChange={(e) => setBusinessForm({ ...businessForm, business_tagline: e.target.value })}
                        className="rounded-full"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={businessForm.business_email}
                          onChange={(e) => setBusinessForm({ ...businessForm, business_email: e.target.value })}
                          className="rounded-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={businessForm.business_phone}
                          onChange={(e) => setBusinessForm({ ...businessForm, business_phone: e.target.value })}
                          className="rounded-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        value={businessForm.business_address}
                        onChange={(e) => setBusinessForm({ ...businessForm, business_address: e.target.value })}
                        className="rounded-full"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tax Rate (%)</Label>
                        <Input
                          type="number"
                          value={businessForm.tax_rate}
                          onChange={(e) => setBusinessForm({ ...businessForm, tax_rate: e.target.value })}
                          className="rounded-full"
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Delivery Type</Label>
                        <Select 
                          value={businessForm.delivery_type} 
                          onValueChange={(value) => setBusinessForm({ ...businessForm, delivery_type: value })}
                        >
                          <SelectTrigger className="rounded-full">
                            <SelectValue placeholder="Select delivery type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free Delivery</SelectItem>
                            <SelectItem value="fixed">Fixed Charge</SelectItem>
                            <SelectItem value="threshold">Free Above Threshold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {businessForm.delivery_type !== 'free' && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Delivery Charge ({settings?.currency_symbol || '₹'})</Label>
                          <Input
                            type="number"
                            value={businessForm.delivery_charge}
                            onChange={(e) => setBusinessForm({ ...businessForm, delivery_charge: e.target.value })}
                            className="rounded-full"
                            placeholder="0"
                          />
                        </div>
                        {businessForm.delivery_type === 'threshold' && (
                          <div className="space-y-2">
                            <Label>Free Delivery Above ({settings?.currency_symbol || '₹'})</Label>
                            <Input
                              type="number"
                              value={businessForm.free_delivery_threshold}
                              onChange={(e) => setBusinessForm({ ...businessForm, free_delivery_threshold: e.target.value })}
                              className="rounded-full"
                              placeholder="500"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Settings Info */}
              <div className="bg-accent/50 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Payment Gateway</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Razorpay credentials are securely configured as environment variables and cannot be viewed or edited here for security reasons.
                  To update payment gateway settings, please contact your administrator.
                </p>
              </div>

              <Button onClick={handleSaveSettings} className="rounded-full" disabled={updateSettings.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateSettings.isPending ? 'Saving...' : 'Save All Settings'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-full"
                    placeholder="Classic Oak Frame"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wooden">Wooden</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="ornate">Ornate</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="collage">Collage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="rounded-full"
                    placeholder="2499"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="rounded-full"
                    placeholder="2999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock Quantity *</Label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="rounded-full"
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Input
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="rounded-full"
                    placeholder="Solid Oak"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {FRAME_SIZES.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="rounded-full"
                    placeholder="Natural Oak"
                  />
                </div>
              </div>
              
              {/* Image Upload */}
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Main Product Image"
              />
              
              {/* Multi Image Upload */}
              <MultiImageUpload
                values={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                maxImages={5}
              />

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-2xl"
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="rounded-2xl"
                  placeholder="UV-protective glass&#10;Easel back included"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Care Instructions (one per line)</Label>
                <Textarea
                  value={formData.care_instructions}
                  onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                  className="rounded-2xl"
                  placeholder="Dust with soft cloth&#10;Avoid direct sunlight"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })} />
                <Label>Featured Product</Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-full">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitProduct} 
                  className="flex-1 rounded-full"
                  disabled={!formData.name || !formData.price || createProduct.isPending || updateProduct.isPending}
                >
                  {(createProduct.isPending || updateProduct.isPending) ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Promo Code Dialog */}
        <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
          <DialogContent className="max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Promo Code *</Label>
                <Input
                  value={promoFormData.code}
                  onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })}
                  className="rounded-full font-mono"
                  placeholder="SAVE20"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select 
                    value={promoFormData.discount_type} 
                    onValueChange={(value: 'percentage' | 'fixed') => setPromoFormData({ ...promoFormData, discount_type: value })}
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    value={promoFormData.discount_value}
                    onChange={(e) => setPromoFormData({ ...promoFormData, discount_value: e.target.value })}
                    className="rounded-full"
                    placeholder={promoFormData.discount_type === 'percentage' ? '20' : '500'}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Order Amount (₹)</Label>
                  <Input
                    type="number"
                    value={promoFormData.min_order_amount}
                    onChange={(e) => setPromoFormData({ ...promoFormData, min_order_amount: e.target.value })}
                    className="rounded-full"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Uses</Label>
                  <Input
                    type="number"
                    value={promoFormData.max_uses}
                    onChange={(e) => setPromoFormData({ ...promoFormData, max_uses: e.target.value })}
                    className="rounded-full"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={promoFormData.valid_from}
                    onChange={(e) => setPromoFormData({ ...promoFormData, valid_from: e.target.value })}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={promoFormData.valid_until}
                    onChange={(e) => setPromoFormData({ ...promoFormData, valid_until: e.target.value })}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={promoFormData.is_active} 
                  onCheckedChange={(checked) => setPromoFormData({ ...promoFormData, is_active: checked })} 
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsPromoDialogOpen(false)} className="flex-1 rounded-full">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitPromo} 
                  className="flex-1 rounded-full"
                  disabled={!promoFormData.code || !promoFormData.discount_value || createPromoCode.isPending || updatePromoCode.isPending}
                >
                  {(createPromoCode.isPending || updatePromoCode.isPending) ? 'Saving...' : (editingPromo ? 'Update' : 'Add')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Order Detail Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.order_id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6 pt-4">
                {/* Order Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-accent/50 rounded-2xl p-4">
                  <h3 className="font-semibold text-foreground mb-3">Customer Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{selectedOrder.customer_email}</span>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{selectedOrder.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-accent/50 rounded-2xl p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Shipping Address
                  </h3>
                  <div className="text-muted-foreground">
                    <p className="font-medium text-foreground">{selectedOrder.customer_name}</p>
                    <p>{selectedOrder.shipping_address}</p>
                    <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_zip}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {(selectedOrder.items as unknown as OrderItem[]).map((item, index) => (
                      <div key={index} className="flex items-center gap-4 bg-accent/30 rounded-xl p-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">₹{selectedOrder.tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Admin;
