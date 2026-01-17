import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

// Local storage key for guest wishlist
const GUEST_WISHLIST_KEY = 'guest_wishlist';

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [guestWishlist, setGuestWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync guest wishlist to localStorage
  useEffect(() => {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guestWishlist));
  }, [guestWishlist]);

  // Fetch wishlist from database for logged-in users
  const { data: dbWishlist, isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user
  });

  // Get product IDs in wishlist
  const wishlistProductIds = user 
    ? (dbWishlist?.map(item => item.product_id) || [])
    : guestWishlist;

  const isInWishlist = (productId: string) => wishlistProductIds.includes(productId);

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        // Guest: add to local storage
        setGuestWishlist(prev => [...prev, productId]);
        return;
      }
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist');
    },
    onError: (error) => {
      toast.error('Failed to add to wishlist: ' + error.message);
    }
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        // Guest: remove from local storage
        setGuestWishlist(prev => prev.filter(id => id !== productId));
        return;
      }
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error('Failed to remove from wishlist: ' + error.message);
    }
  });

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    wishlistProductIds,
    isInWishlist,
    toggleWishlist,
    isLoading,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate
  };
};
