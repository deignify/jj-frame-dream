import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  variant?: 'icon' | 'default';
  className?: string;
}

const WishlistButton = ({ productId, variant = 'icon', className }: WishlistButtonProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full bg-background/80 hover:bg-background",
          className
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(productId);
        }}
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors",
            inWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
          )} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={inWishlist ? "default" : "outline"}
      className={cn("rounded-full", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
    >
      <Heart 
        className={cn(
          "h-4 w-4 mr-2",
          inWishlist ? "fill-current" : ""
        )} 
      />
      {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
    </Button>
  );
};

export default WishlistButton;
