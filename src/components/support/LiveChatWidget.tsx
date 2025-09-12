import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Maximize2,
  User,
  Bot,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  message: string;
  user_id?: string;
  is_internal: boolean;
  created_at: string;
}

interface LiveChatWidgetProps {
  supportTicketId?: string;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ supportTicketId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const queryClient = useQueryClient();

  // Auto-responses for common questions
  const autoResponses = [
    {
      keywords: ['hello', 'hi', 'hey', 'start'],
      response: "Hello! I'm here to help you with any questions about Red Square. How can I assist you today?"
    },
    {
      keywords: ['hours', 'support hours', 'when', 'available'],
      response: "Our support team is available Monday-Friday 9 AM to 6 PM EST. For urgent issues outside these hours, please create a high-priority support ticket."
    },
    {
      keywords: ['screen', 'device', 'setup', 'installation'],
      response: "For screen setup help, check our setup guide or create a support ticket with 'Screen Management' category. Our team can provide step-by-step assistance."
    },
    {
      keywords: ['payment', 'billing', 'charge', 'refund'],
      response: "For billing questions, please create a support ticket with 'Account & Billing' category. Include your account details and our team will review your issue promptly."
    },
    {
      keywords: ['upload', 'content', 'file', 'video'],
      response: "Content upload issues can usually be resolved by checking file format (MP4, JPG, PNG, GIF) and size limits. Create a 'Content & Booking' support ticket for detailed help."
    }
  ];

  // Fetch chat messages if there's an active ticket
  const { data: messages } = useQuery({
    queryKey: ['chat-messages', supportTicketId],
    queryFn: async () => {
      if (!supportTicketId) return [];
      
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', supportTicketId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!supportTicketId && isOpen
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!supportTicketId) {
        // For demo purposes, simulate auto-response
        return Promise.resolve({
          id: Date.now().toString(),
          message: getAutoResponse(message),
          is_internal: false,
          created_at: new Date().toISOString()
        });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: supportTicketId,
          user_id: user.id,
          message: message,
          is_internal: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', supportTicketId] });
      setCurrentMessage('');
    }
  });

  const getAutoResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    for (const response of autoResponses) {
      if (response.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return response.response;
      }
    }
    
    return "Thanks for your message! A support team member will respond shortly. For faster assistance, you can also create a support ticket with detailed information about your issue.";
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    sendMessageMutation.mutate(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle unread indicator when messages change
  useEffect(() => {
    if (messages && messages.length > 0 && !isOpen) {
      setHasUnreadMessages(true);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasUnreadMessages(false);
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-primary hover:shadow-[var(--shadow-red)] relative"
        >
          <MessageCircle className="h-6 w-6" />
          {hasUnreadMessages && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 bg-red-500">
              <span className="sr-only">Unread messages</span>
            </Badge>
          )}
        </Button>
      ) : (
        <Card className={`w-80 shadow-xl transition-all duration-300 ${isMinimized ? 'h-12' : 'h-96'}`}>
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {supportTicketId ? 'Support Chat' : 'Quick Help'}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {!isMinimized && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </div>
                <span>•</span>
                <span>Usually replies in a few minutes</span>
              </div>
            )}
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-3 pt-0 flex flex-col h-80">
              <ScrollArea className="flex-1 mb-3">
                <div className="space-y-3 pr-3">
                  {/* Welcome message */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted p-2 rounded-lg text-sm">
                        Hi! I'm here to help with any questions about Red Square. How can I assist you?
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Just now
                      </div>
                    </div>
                  </div>

                  {/* Chat messages */}
                  {messages?.map((message) => (
                    <div key={message.id} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg text-sm">
                          {message.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                  className="px-3"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};