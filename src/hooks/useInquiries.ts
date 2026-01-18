import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useInquiries = () => {
  return useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Inquiry[];
    }
  });
};

export const useSubmitInquiry = () => {
  return useMutation({
    mutationFn: async (inquiry: { name: string; email: string; subject: string; message: string }) => {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .insert([inquiry])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Message sent! We\'ll get back to you soon.');
    },
    onError: (error: Error) => {
      toast.error('Failed to send message: ' + error.message);
    }
  });
};

export const useUpdateInquiry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status?: string; admin_notes?: string }) => {
      const updates: { status?: string; admin_notes?: string } = {};
      if (status !== undefined) updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      
      const { data, error } = await supabase
        .from('contact_inquiries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Inquiry updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update inquiry: ' + error.message);
    }
  });
};

export const useDeleteInquiry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_inquiries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Inquiry deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete inquiry: ' + error.message);
    }
  });
};
