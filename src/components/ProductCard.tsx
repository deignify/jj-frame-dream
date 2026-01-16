import { Link, useNavigate } from 'react-router-dom';
import { Eye, ShoppingCart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

const ProductCard = ({ product, showActions = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { data: settings } = useBusinessSettings();
  const navigate = useNavigate();
  const currencySymbol = settings?.currency_symbol || '₹';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  return (
    <div className="group">
      <Link to={`/product/${product.slug || product.id}`}>
        <div className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-accent/30">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button size="icon" variant="secondary" className="rounded-full h-12 w-12">
                <Eye className="h-5 w-5" />
              </Button>
            </div>

            {/* Sale Badge */}
            {product.original_price && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {currencySymbol}{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {currencySymbol}{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Action Buttons - Always visible */}
      {showActions && (
        <div className="flex gap-2 mt-3">
          <Button 
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 rounded-full"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button 
            onClick={handleBuyNow}
            className="flex-1 rounded-full"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
