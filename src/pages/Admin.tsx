import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package, ShoppingCart, Eye, Settings, LogIn, LogOut, Loader2, Save, X, MapPin, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

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
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateSettings = useUpdateBusinessSettings();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof orders extends (infer T)[] | undefined ? T : never | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Pagination states
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    category: 'wooden',
    material: '',
    size: '',
    color: '',
    description: '',
    image: '',
    features: '',
    care_instructions: '',
    in_stock: true,
    featured: false,
    stock_quantity: '10'
  });

  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_tagline: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    currency_symbol: '',
    tax_rate: ''
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
        tax_rate: settings.tax_rate || '18'
      });
    }
  }, [settings]);

  // Pagination calculations
  const paginatedProducts = products?.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE) || [];
  const totalProductPages = Math.ceil((products?.length || 0) / ITEMS_PER_PAGE);
  
  const paginatedOrders = orders?.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE) || [];
  const totalOrderPages = Math.ceil((orders?.length || 0) / ITEMS_PER_PAGE);

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
      size: '',
      color: '',
      description: '',
      image: '',
      features: '',
      care_instructions: '',
      in_stock: true,
      featured: false,
      stock_quantity: '10'
    });
    setEditingProduct(null);
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

  const handleSubmitProduct = async () => {
    const stockQty = parseInt(formData.stock_quantity) || 0;
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      image: formData.image || '/placeholder.svg',
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

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id);
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
            <p className="text-muted-foreground">Manage your products, orders and settings</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="rounded-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-card rounded-full p-1">
            <TabsTrigger value="products" className="rounded-full gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Products ({products?.length || 0})</h2>
                <Button 
                  className="rounded-full"
                  onClick={() => { resetForm(); setIsDialogOpen(true); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
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
              <h2 className="text-xl font-bold text-foreground mb-6">Orders ({orders?.length || 0})</h2>

              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map(order => (
                          <tr key={order.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                            <td className="py-4 px-4 font-medium text-foreground">{order.order_id}</td>
                            <td className="py-4 px-4">
                              <p className="text-foreground">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {(order.items as unknown as OrderItem[]).length} items
                            </td>
                            <td className="py-4 px-4 font-medium text-foreground">₹{order.total.toLocaleString('en-IN')}</td>
                            <td className="py-4 px-4">
                              <Select 
                                value={order.status} 
                                onValueChange={(value) => updateOrderStatus.mutate({ id: order.id, status: value })}
                              >
                                <SelectTrigger className={`w-32 rounded-full text-xs ${getStatusColor(order.status)}`}>
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

          {/* Settings Tab */}
          <TabsContent value="settings">
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
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={businessForm.tax_rate}
                      onChange={(e) => setBusinessForm({ ...businessForm, tax_rate: e.target.value })}
                      className="rounded-full w-32"
                    />
                  </div>
                  <Button onClick={handleSaveSettings} className="rounded-full" disabled={updateSettings.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              )}
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
                  <Input
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="rounded-full"
                    placeholder="8x10 inches"
                  />
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
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="rounded-full"
                  placeholder="/frame-1.jpg"
                />
              </div>
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

                {/* Payment Method */}
                <div className="text-sm text-muted-foreground">
                  Payment Method: <span className="capitalize font-medium text-foreground">{selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}</span>
                </div>

                {/* Update Status */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Label>Update Status:</Label>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value) => {
                      updateOrderStatus.mutate({ id: selectedOrder.id, status: value });
                      setSelectedOrder({ ...selectedOrder, status: value });
                    }}
                  >
                    <SelectTrigger className="w-40 rounded-full">
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
