import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        settings[item.setting_key] = item.setting_value || '';
      });
      
      return settings;
    }
  });
};

export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: BusinessSettings) => {
      const updates = Object.entries(settings).map(([setting_key, setting_value]) => ({
        setting_key,
        setting_value
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('business_settings')
          .update({ setting_value: update.setting_value })
          .eq('setting_key', update.setting_key);
        
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
