import { useMemo } from 'react';
import { Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
  maxItems?: number;
}

const RelatedProducts = ({ currentProduct, allProducts, maxItems = 4 }: RelatedProductsProps) => {
  const relatedProducts = useMemo(() => {
    // Filter out current product
    const others = allProducts.filter(p => p.id !== currentProduct.id);
    
    // Score products by relevance
    const scored = others.map(product => {
      let score = 0;
      
      // Same category = highest priority
      if (product.category === currentProduct.category) score += 10;
      
      // Similar price range (within 30%)
      const priceDiff = Math.abs(product.price - currentProduct.price) / currentProduct.price;
      if (priceDiff <= 0.3) score += 5;
      
      // Same material
      if (product.material === currentProduct.material) score += 3;
      
      // Same color
      if (product.color === currentProduct.color) score += 2;
      
      // Featured products get a small boost
      if (product.featured) score += 1;
      
      return { product, score };
    });
    
    // Sort by score and take top items
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems)
      .map(item => item.product);
  }, [currentProduct, allProducts, maxItems]);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {relatedProducts.map(product => (
          <ProductCard key={product.id} product={product} showActions />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
