import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Send,
  Eye,
  BarChart3,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { NotificationService } from '@/services/NotificationService';

interface SupportTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  user_id: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id?: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export const AdminSupportDashboard: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const queryClient = useQueryClient();

  // Fetch support statistics
  const { data: stats } = useQuery({
    queryKey: ['support-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status, priority, created_at');
      
      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const todayTickets = data.filter(ticket => 
        ticket.created_at.startsWith(today)
      ).length;

      const statusCounts = data.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const priorityCounts = data.reduce((acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: data.length,
        todayTickets,
        statusCounts,
        priorityCounts,
        avgResponseTime: '2.3 hours' // Mock data
      };
    }
  });

  // Fetch tickets based on filter
  const { data: tickets } = useQuery({
    queryKey: ['admin-support-tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SupportTicket[];
    }
  });

  // Fetch messages for selected ticket
  const { data: messages } = useQuery({
    queryKey: ['ticket-messages', selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return [];
      
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', selectedTicket)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as TicketMessage[];
    },
    enabled: !!selectedTicket
  });

  // Update ticket status mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string, updates: Partial<SupportTicket> }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
      NotificationService.success('Ticket updated successfully');
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ ticketId, message, isInternal }: { ticketId: string, message: string, isInternal: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message: message,
          is_internal: isInternal
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', selectedTicket] });
      setNewMessage('');
      setIsInternalNote(false);
      NotificationService.success('Message sent successfully');
    }
  });

  const selectedTicketData = tickets?.find(t => t.id === selectedTicket);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      case 'waiting_for_customer': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold">{stats?.statusCounts?.open || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Tickets</p>
                <p className="text-2xl font-bold">{stats?.todayTickets || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{stats?.avgResponseTime || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Support Tickets</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_for_customer">Waiting</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {tickets?.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                      selectedTicket === ticket.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.ticket_number} • {ticket.category}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(ticket.status)} text-white text-xs`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${getPriorityColor(ticket.priority)} text-white text-xs`}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details & Messages */}
        <div className="lg:col-span-2">
          {selectedTicketData ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicketData.title}</CardTitle>
                    <CardDescription>
                      {selectedTicketData.ticket_number} • Created {formatDistanceToNow(new Date(selectedTicketData.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={selectedTicketData.status}
                      onValueChange={(value) => updateTicketMutation.mutate({
                        ticketId: selectedTicketData.id,
                        updates: { status: value as any }
                      })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="conversation">
                  <TabsList className="mb-4">
                    <TabsTrigger value="conversation">Conversation</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="conversation" className="space-y-4">
                    {/* Original ticket description */}
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-sm">Customer</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedTicketData.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{selectedTicketData.description}</p>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {messages?.map((message) => (
                        <div 
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.is_internal ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {message.is_internal ? 'Internal Note' : 'Support Agent'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                            {message.is_internal && (
                              <Badge variant="outline" className="text-xs">Internal</Badge>
                            )}
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Message Form */}
                    <Separator />
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your response..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="internal-note"
                            checked={isInternalNote}
                            onChange={(e) => setIsInternalNote(e.target.checked)}
                            className="rounded"
                          />
                          <label htmlFor="internal-note" className="text-sm">
                            Internal note (not visible to customer)
                          </label>
                        </div>
                        <Button
                          onClick={() => sendMessageMutation.mutate({
                            ticketId: selectedTicketData.id,
                            message: newMessage,
                            isInternal: isInternalNote
                          })}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                          className="gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Send {isInternalNote ? 'Note' : 'Response'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <p className="text-sm text-muted-foreground">{selectedTicketData.category}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Badge className={`${getPriorityColor(selectedTicketData.priority)} text-white`}>
                            {selectedTicketData.priority}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <Badge className={`${getStatusColor(selectedTicketData.status)} text-white`}>
                            {selectedTicketData.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Last Updated</label>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(selectedTicketData.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Support Ticket</h3>
                <p className="text-muted-foreground">
                  Choose a ticket from the list to view details and respond to the customer.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};