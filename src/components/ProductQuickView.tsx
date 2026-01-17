import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Product } from '@/hooks/useProducts';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: settings } = useBusinessSettings();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const currencySymbol = settings?.currency_symbol || '₹';

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  
  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);
    if (success) {
      toast.success(`${quantity} × ${product.name} added to cart!`);
      onOpenChange(false);
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity);
    if (success) {
      onOpenChange(false);
      navigate('/checkout');
    }
  };

  const handleViewDetails = () => {
    onOpenChange(false);
    navigate(`/product/${product.slug || product.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-muted/30 p-4 md:p-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-card">
              <img
                src={allImages[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-primary font-medium text-xs uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h2 className="text-2xl font-bold text-foreground">
                  {product.name}
                </h2>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-bold text-primary">
                  {currencySymbol}{product.price.toLocaleString('en-IN')}
                </span>
                {product.original_price && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      {currencySymbol}{product.original_price.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-3 bg-muted/50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="text-sm font-medium text-foreground">{product.size}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Material</p>
                  <p className="text-sm font-medium text-foreground">{product.material}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Color</p>
                  <p className="text-sm font-medium text-foreground">{product.color}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    {product.in_stock ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        {product.stock_quantity} left
                      </>
                    ) : (
                      'Out of Stock'
                    )}
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Qty:</span>
                <div className="flex items-center bg-muted/50 rounded-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons - in a box together */}
            <div className="mt-6 space-y-3 bg-muted/30 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="h-12 rounded-xl font-medium"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 rounded-xl font-medium"
                  onClick={handleBuyNow}
                  disabled={!product.in_stock}
                >
                  Buy Now
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full h-10 rounded-xl text-muted-foreground hover:text-foreground"
                onClick={handleViewDetails}
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
