import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Sensitive keys that should never be exposed to the client
const SENSITIVE_KEYS = [
  'razorpay_key_id',
  'razorpay_key_secret', 
  'razorpay_webhook_secret',
  'stripe_secret_key',
  'api_secret',
  'private_key'
];

export interface BusinessSettings {
  [key: string]: string;
}

export const useBusinessSettings = () => {
  return useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('setting_key, setting_value');
      
      if (error) throw error;
      
      const settings: BusinessSettings = {};
      data?.forEach(item => {
        // Filter out sensitive keys - never expose to client
        if (!SENSITIVE_KEYS.some(key => item.setting_key.toLowerCase().includes(key.toLowerCase()))) {
          settings[item.setting_key] = item.setting_value || '';
        }
      });
      
      return settings;
    }
  });
};

export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: BusinessSettings) => {
      // Filter out any sensitive keys before updating
      const safeSettings = Object.entries(settings).filter(
        ([key]) => !SENSITIVE_KEYS.some(sensitiveKey => 
          key.toLowerCase().includes(sensitiveKey.toLowerCase())
        )
      );
      
      for (const [setting_key, setting_value] of safeSettings) {
        const { error } = await supabase
          .from('business_settings')
          .update({ setting_value })
          .eq('setting_key', setting_key);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
      toast.success('Settings updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    }
  });
};
