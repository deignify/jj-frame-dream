import { AlertTriangle, Package } from 'lucide-react';
import { Product } from '@/hooks/useProducts';

interface LowStockAlertProps {
  products: Product[];
  threshold?: number;
}

const LowStockAlert = ({ products, threshold = 5 }: LowStockAlertProps) => {
  const lowStockProducts = products.filter(p => p.stock_quantity <= threshold && p.stock_quantity > 0);
  const outOfStockProducts = products.filter(p => p.stock_quantity <= 0);

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">All products have adequate stock</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {outOfStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-700 font-medium">
              {outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's' : ''} out of stock
            </span>
          </div>
          <div className="space-y-1">
            {outOfStockProducts.slice(0, 5).map(product => (
              <div key={product.id} className="text-sm text-red-600 flex justify-between">
                <span>{product.name}</span>
                <span className="font-medium">0 in stock</span>
              </div>
            ))}
            {outOfStockProducts.length > 5 && (
              <div className="text-sm text-red-500">
                +{outOfStockProducts.length - 5} more products
              </div>
            )}
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-amber-700 font-medium">
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} low on stock
            </span>
          </div>
          <div className="space-y-1">
            {lowStockProducts.slice(0, 5).map(product => (
              <div key={product.id} className="text-sm text-amber-600 flex justify-between">
                <span>{product.name}</span>
                <span className="font-medium">{product.stock_quantity} left</span>
              </div>
            ))}
            {lowStockProducts.length > 5 && (
              <div className="text-sm text-amber-500">
                +{lowStockProducts.length - 5} more products
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;
