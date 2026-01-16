import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts } = useProducts();
  const { data: settings } = useBusinessSettings();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const currencySymbol = settings?.currency_symbol || '₹';

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products">
            <Button className="rounded-full">Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedProducts = allProducts?.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4) || [];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-3xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Thumbnail placeholder */}
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={product.image}
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-primary font-medium text-sm uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  {currencySymbol}{product.price.toLocaleString('en-IN')}
                </span>
                {product.original_price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {currencySymbol}{product.original_price.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                      {discount}% OFF - Save {currencySymbol}{(product.original_price - product.price).toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 bg-card rounded-2xl p-5">
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium text-foreground">{product.size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Material</p>
                <p className="font-medium text-foreground">{product.material}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium text-foreground">{product.color}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <p className="font-medium text-foreground flex items-center gap-1">
                  {product.in_stock ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      In Stock
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center bg-card rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-full"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={handleBuyNow}
                disabled={!product.in_stock}
              >
                Buy Now
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full px-4">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="w-full bg-card rounded-full p-1">
                <TabsTrigger value="description" className="flex-1 rounded-full">Description</TabsTrigger>
                <TabsTrigger value="features" className="flex-1 rounded-full">Features</TabsTrigger>
                <TabsTrigger value="care" className="flex-1 rounded-full">Care</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </TabsContent>
              <TabsContent value="features" className="pt-6">
                <ul className="space-y-2">
                  {product.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="care" className="pt-6">
                <ul className="space-y-2">
                  {product.care_instructions?.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="text-2xl font-bold text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} showActions />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
