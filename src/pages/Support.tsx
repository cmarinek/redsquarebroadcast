import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  HelpCircle, 
  Phone, 
  Mail, 
  Clock,
  FileText,
  Search,
  Book,
  Users,
  Zap
} from 'lucide-react';
import { SupportTicketForm } from '@/components/support/SupportTicketForm';
import { SupportTicketList } from '@/components/support/SupportTicketList';
import { LiveChatWidget } from '@/components/support/LiveChatWidget';
import { HelpSystem } from '@/components/HelpSystem';

export default function Support() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Mon-Fri 9 AM - 6 PM EST',
      responseTime: 'Usually within 5 minutes',
      action: 'Start Chat',
      color: 'bg-blue-500'
    },
    {
      icon: FileText,
      title: 'Support Tickets',
      description: 'Create detailed support requests',
      availability: '24/7 submission',
      responseTime: 'Within 2-4 hours',
      action: 'Create Ticket',
      color: 'bg-green-500'
    },
    {
      icon: Book,
      title: 'Knowledge Base',
      description: 'Browse our comprehensive help articles',
      availability: 'Always available',
      responseTime: 'Instant access',
      action: 'Browse Articles',
      color: 'bg-purple-500'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed email',
      availability: '24/7 submission',
      responseTime: 'Within 24 hours',
      action: 'Send Email',
      color: 'bg-orange-500'
    }
  ];

  const quickHelp = [
    {
      question: 'How do I set up my screen?',
      answer: 'Download the Red Square Screens app, register your device, and follow the setup wizard.',
      category: 'Getting Started'
    },
    {
      question: 'How do I upload content?',
      answer: 'Use the content upload feature in your dashboard. Supported formats: MP4, JPG, PNG, GIF.',
      category: 'Content'
    },
    {
      question: 'What are the payment methods?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for larger accounts.',
      category: 'Billing'
    },
    {
      question: 'How do I book a time slot?',
      answer: 'Find a screen, select your time slot, upload your content, and complete the payment.',
      category: 'Booking'
    }
  ];

  const supportStats = [
    { label: 'Average Response Time', value: '2.3 hours', icon: Clock },
    { label: 'Customer Satisfaction', value: '98.5%', icon: Users },
    { label: 'Issues Resolved', value: '99.2%', icon: Zap },
    { label: 'Articles Available', value: '150+', icon: FileText }
  ];

  return (
    <>
      <SEO 
        title="Support Center | Red Square"
        description="Get help with Red Square. Access our support tickets, live chat, knowledge base, and contact information for technical assistance."
        path="/support"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Support Center</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help you get the most out of Red Square. Find answers, get support, and connect with our team.
            </p>
          </div>

          {/* Support Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {supportStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="create">Create Ticket</TabsTrigger>
              <TabsTrigger value="help">Help Center</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Support Channels */}
              <div>
                <h2 className="text-2xl font-bold mb-6">How can we help you?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {supportChannels.map((channel, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="text-center pb-4">
                        <div className={`w-12 h-12 rounded-full ${channel.color} flex items-center justify-center mx-auto mb-3`}>
                          <channel.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{channel.title}</CardTitle>
                        <CardDescription>{channel.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {channel.availability}
                          </div>
                          <div className="text-sm font-medium">{channel.responseTime}</div>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            if (channel.title === 'Support Tickets') {
                              setActiveTab('create');
                            } else if (channel.title === 'Knowledge Base') {
                              setActiveTab('help');
                            }
                          }}
                        >
                          {channel.action}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Help */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quickHelp.map((item, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{item.question}</CardTitle>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Still need help?</CardTitle>
                  <CardDescription>
                    Our support team is available to assist you during business hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-muted-foreground">support@redsquare.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Phone Support</p>
                        <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Business Hours</p>
                        <p className="text-sm text-muted-foreground">Mon-Fri 9 AM - 6 PM EST</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <SupportTicketList onTicketSelect={setSelectedTicket} />
            </TabsContent>

            <TabsContent value="create">
              <SupportTicketForm onSuccess={() => setActiveTab('tickets')} />
            </TabsContent>

            <TabsContent value="help">
              <Card>
                <CardHeader>
                  <CardTitle>Help Center</CardTitle>
                  <CardDescription>
                    Browse our comprehensive knowledge base for detailed guides and tutorials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HelpSystem userType="advertiser" currentPage="support" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Chat Widget */}
        <LiveChatWidget supportTicketId={selectedTicket || undefined} />
      </div>
    </>
  );
}