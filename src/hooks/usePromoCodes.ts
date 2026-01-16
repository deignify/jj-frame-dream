import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePromoCodes = () => {
  return useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PromoCode[];
    }
  });
};

export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async ({ code, orderAmount }: { code: string; orderAmount: number }) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Invalid promo code');
      
      const promo = data as PromoCode;
      
      // Check validity
      if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
        throw new Error('This promo code has expired');
      }
      
      if (promo.max_uses && promo.used_count >= promo.max_uses) {
        throw new Error('This promo code has reached its usage limit');
      }
      
      if (orderAmount < promo.min_order_amount) {
        throw new Error(`Minimum order amount is ₹${promo.min_order_amount}`);
      }
      
      return promo;
    }
  });
};

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (promo: Omit<PromoCode, 'id' | 'created_at' | 'updated_at' | 'used_count'>) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert({ ...promo, code: promo.code.toUpperCase() })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Promo code created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create promo code: ' + error.message);
    }
  });
};

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PromoCode> & { id: string }) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Promo code updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update promo code: ' + error.message);
    }
  });
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Promo code deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete promo code: ' + error.message);
    }
  });
};

export const useIncrementPromoCodeUsage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get current count and increment
      const { data: current } = await supabase
        .from('promo_codes')
        .select('used_count')
        .eq('id', id)
        .single();
      
      if (current) {
        await supabase
          .from('promo_codes')
          .update({ used_count: (current.used_count || 0) + 1 })
          .eq('id', id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    }
  });
};
