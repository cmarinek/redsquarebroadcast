import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from '@/services/NotificationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ticketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface SupportTicketFormProps {
  onSuccess?: () => void;
}

export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'medium'
    }
  });

  // Fetch support categories
  const { data: categories } = useQuery({
    queryKey: ['support-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    }
  });

  const createTicketMutation = useMutation({
    mutationFn: async (formData: TicketFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      NotificationService.success('Support ticket created successfully', {
        description: `Ticket #${data.ticket_number} has been created and assigned to our support team.`
      });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating ticket:', error);
      NotificationService.error('Failed to create support ticket', {
        description: 'Please try again or contact support directly.'
      });
    }
  });

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500', 
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Create Support Ticket
        </CardTitle>
        <CardDescription>
          Describe your issue and our support team will help you resolve it quickly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of your issue"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select 
                defaultValue="medium"
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${priorityColors.low}`} />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${priorityColors.medium}`} />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${priorityColors.high}`} />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${priorityColors.urgent}`} />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible about your issue, including any error messages, steps to reproduce, and what you expected to happen."
              rows={6}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Ticket...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Create Support Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};