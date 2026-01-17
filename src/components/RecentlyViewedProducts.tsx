import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface RecentlyViewedProductsProps {
  excludeProductId?: string;
}

const RecentlyViewedProducts = ({ excludeProductId }: RecentlyViewedProductsProps) => {
  const { recentlyViewedIds } = useRecentlyViewed();
  const { data: products } = useProducts();

  // Filter products to only those in recently viewed
  const recentProducts = products?.filter(
    p => recentlyViewedIds.includes(p.id) && p.id !== excludeProductId
  ) || [];

  // Sort by the order in recentlyViewedIds
  const sortedProducts = recentProducts.sort(
    (a, b) => recentlyViewedIds.indexOf(a.id) - recentlyViewedIds.indexOf(b.id)
  );

  if (sortedProducts.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {sortedProducts.slice(0, 4).map(product => (
          <ProductCard key={product.id} product={product} showActions />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;
