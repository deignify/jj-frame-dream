import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, ShoppingCart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { toast } from 'sonner';
import ProductQuickView from './ProductQuickView';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

const ProductCard = ({ product, showActions = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { data: settings } = useBusinessSettings();
  const navigate = useNavigate();
  const currencySymbol = settings?.currency_symbol || '₹';
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = addToCart(product);
    if (success) {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = addToCart(product);
    if (success) {
      navigate('/checkout');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  return (
    <>
      <div className="group h-full">
        <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
          {/* Image Container */}
          <Link to={`/product/${product.slug || product.id}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Quick View Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="rounded-full h-12 w-12 shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background hover:scale-110 transition-transform"
                  onClick={handleQuickView}
                >
                  <Eye className="h-5 w-5" />
                </Button>
              </div>

              {/* Sale Badge */}
              {product.original_price && discount > 0 && (
                <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  {discount}% OFF
                </span>
              )}

              {/* Stock Badge */}
              {!product.in_stock && (
                <span className="absolute top-3 right-3 bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <Link to={`/product/${product.slug || product.id}`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-1.5">
                {product.category}
              </p>
              <h3 className="font-semibold text-foreground text-sm leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-lg font-bold text-primary">
                {currencySymbol}{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && (
                <span className="text-xs text-muted-foreground line-through">
                  {currencySymbol}{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons - inside the card */}
          {showActions && (
            <div className="p-4 pt-0">
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full rounded-xl h-10 text-sm font-medium border-border hover:border-primary hover:bg-primary/5"
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  className="w-full rounded-xl h-10 text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                  disabled={!product.in_stock}
                >
                  <ShoppingBag className="h-4 w-4 mr-2 flex-shrink-0" />
                  Buy Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickView 
        product={product} 
        open={quickViewOpen} 
        onOpenChange={setQuickViewOpen} 
      />
    </>
  );
};

export default ProductCard;
