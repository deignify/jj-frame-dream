import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, ShoppingCart, Eye, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Layout from '@/components/Layout';
import { products as initialProducts, Product } from '@/data/products';
import { toast } from 'sonner';

const Admin = () => {
  const [productList, setProductList] = useState(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock orders data
  const orders = [
    { id: 'JJF-ABC123', customer: 'John Doe', date: '2024-01-15', total: 129.98, status: 'Delivered' },
    { id: 'JJF-DEF456', customer: 'Jane Smith', date: '2024-01-14', total: 89.99, status: 'Shipped' },
    { id: 'JJF-GHI789', customer: 'Bob Wilson', date: '2024-01-13', total: 199.97, status: 'Processing' },
    { id: 'JJF-JKL012', customer: 'Alice Brown', date: '2024-01-12', total: 54.99, status: 'Pending' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    material: '',
    size: '',
    color: '',
    description: '',
    image: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image || '/placeholder.svg',
      category: formData.category,
      material: formData.material,
      size: formData.size,
      color: formData.color,
      description: formData.description,
      features: [],
      careInstructions: [],
      inStock: true,
      featured: false
    };

    setProductList([...productList, newProduct]);
    setFormData({ name: '', price: '', category: '', material: '', size: '', color: '', description: '', image: '' });
    setIsDialogOpen(false);
    toast.success('Product added successfully!');
  };

  const handleDeleteProduct = (id: string) => {
    setProductList(productList.filter(p => p.id !== id));
    toast.success('Product deleted successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and orders</p>
          </div>
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
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Products ({productList.length})</h2>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Product Name</Label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="rounded-full"
                          placeholder="Classic Oak Frame"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price ($)</Label>
                          <Input
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="rounded-full"
                            placeholder="49.99"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="rounded-full"
                            placeholder="wooden"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Material</Label>
                          <Input
                            name="material"
                            value={formData.material}
                            onChange={handleInputChange}
                            className="rounded-full"
                            placeholder="Solid Oak"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <Input
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            className="rounded-full"
                            placeholder="8x10 inches"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Input
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="rounded-full"
                          placeholder="Natural Oak"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          className="rounded-full"
                          placeholder="/frame-1.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="rounded-2xl"
                          placeholder="Product description..."
                        />
                      </div>
                      <Button onClick={handleAddProduct} className="w-full rounded-full">
                        Add Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

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
                    {productList.map(product => (
                      <tr key={product.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-xl"
                            />
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
                        <td className="py-4 px-4 font-medium text-foreground">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="bg-card rounded-3xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Recent Orders</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-4 px-4 font-medium text-foreground">{order.id}</td>
                        <td className="py-4 px-4 text-foreground">{order.customer}</td>
                        <td className="py-4 px-4 text-muted-foreground">{order.date}</td>
                        <td className="py-4 px-4 font-medium text-foreground">${order.total.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
