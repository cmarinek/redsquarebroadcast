import { useState, useEffect } from "react";
import { HelpCircle, X, Search, Book, Video, MessageCircle, ExternalLink, ChevronRight, ArrowLeft, Play, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'advertising' | 'screen-management' | 'payments' | 'troubleshooting';
  content: string;
  videoUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
}

interface HelpSystemProps {
  userType?: 'advertiser' | 'screen-owner';
  currentPage?: string;
  trigger?: React.ReactNode;
}

export const HelpSystem = ({ userType, currentPage, trigger }: HelpSystemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [contextualHelp, setContextualHelp] = useState<HelpArticle[]>([]);

  const helpArticles: HelpArticle[] = [
    // Getting Started
    {
      id: 'first-steps-advertiser',
      title: 'Getting Started as an Advertiser',
      description: 'Learn the basics of finding screens and creating your first ad campaign',
      category: 'getting-started',
      difficulty: 'beginner',
      estimatedTime: '5 min',
      tags: ['beginner', 'advertiser', 'setup'],
      content: `
# Getting Started as an Advertiser

Welcome to RedSquare! Here's everything you need to know to create your first advertising campaign.

## Step 1: Find Screens
1. Use the **Discover** page to browse available screens
2. Filter by location, price, and audience size
3. Check screen photos and reviews from other advertisers

## Step 2: Upload Your Content
1. Go to **Content Upload** in the main menu
2. Choose your image or video file (max 50MB)
3. Add a title and description for easy organization
4. Preview how it will look on different screen sizes

## Step 3: Schedule Your Campaign
1. Select time slots that work for your audience
2. Choose duration (minimum 30 seconds)
3. Review pricing and confirm your booking
4. Make payment to activate your campaign

## Tips for Success
- **Best times**: Lunch hours (11am-2pm) and evening commute (5pm-7pm) typically get the most views
- **Content quality**: High-contrast images with large text work best on digital screens
- **Duration**: 15-30 seconds is optimal for most content types

Need help? Use the chat support button or browse our video tutorials!
      `
    },
    {
      id: 'first-steps-screen-owner',
      title: 'Setting Up Your First Screen',
      description: 'Complete guide to registering your screen and earning your first revenue',
      category: 'getting-started',
      difficulty: 'beginner',
      estimatedTime: '10 min',
      tags: ['beginner', 'screen-owner', 'setup'],
      content: `
# Setting Up Your First Screen

Transform your TV or monitor into a revenue-generating advertising display with these simple steps.

## Before You Start
Make sure you have:
- A TV, monitor, or tablet with internet connection
- The RedSquare Broadcast app installed
- A smartphone with the RedSquare Platform app

## Step 1: Register Your Screen
1. Open RedSquare Broadcast app on your display device
2. Note the **Screen ID** displayed (format: RS-XXX-XXXXXX)
3. On your phone, go to **My Screens** and tap **Add Screen**
4. Enter the Screen ID to link your devices

## Step 2: Complete Your Screen Profile
1. Add photos of your screen and location
2. Describe your audience (foot traffic, demographics)
3. Set your availability hours
4. Choose your pricing strategy

## Step 3: Set Competitive Pricing
- **Research local rates**: Check similar screens in your area
- **Start competitive**: Lower prices initially to get your first bookings
- **Peak hours**: Charge 2-3x more during busy times
- **Bulk discounts**: Offer lower rates for longer bookings

## Step 4: Go Live
1. Enable **Accept Bookings** in your screen settings
2. Share your QR code with local businesses
3. Monitor bookings from your dashboard
4. Get paid automatically after each completed display

## Maximizing Earnings
- **Great photos**: Well-lit, clear photos of your screen get 3x more bookings
- **Detailed descriptions**: Mention foot traffic, target audience, and unique features
- **Responsive hosting**: Quick replies to inquiries lead to more bookings
- **Consistent availability**: Regular hours build trust with advertisers

Your screen is now ready to start earning money! 🎉
      `
    },
    {
      id: 'content-best-practices',
      title: 'Creating Effective Digital Ad Content',
      description: 'Design tips and best practices for content that performs well on digital screens',
      category: 'advertising',
      difficulty: 'intermediate',
      estimatedTime: '8 min',
      tags: ['content', 'design', 'performance'],
      videoUrl: 'https://example.com/content-tips-video',
      content: `
# Creating Effective Digital Ad Content

Learn how to design content that captures attention and drives results on digital screens.

## Design Principles

### 1. Keep It Simple
- **One main message** per ad
- **Large, readable fonts** (minimum 24pt)
- **High contrast** between text and background
- **Minimal text** - aim for 7 words or fewer

### 2. Visual Hierarchy
- **Biggest element**: Your main message or offer
- **Second largest**: Your business name or logo
- **Supporting info**: Contact details, dates, etc.

### 3. Color Psychology
- **Red**: Urgency, sales, food
- **Blue**: Trust, technology, professional services
- **Green**: Health, nature, money/savings
- **Yellow**: Attention, happiness, caution

## Technical Requirements

### Image Specs
- **Resolution**: 1920x1080 (Full HD) minimum
- **Format**: PNG or JPEG preferred
- **File size**: Under 10MB for quick loading

### Video Specs
- **Resolution**: 1920x1080 or higher
- **Format**: MP4 (H.264 codec)
- **Duration**: 15-30 seconds optimal
- **File size**: Under 50MB

## Content That Converts

### Strong Headlines
- Use action words: "Save," "Get," "Join," "Discover"
- Include benefits: "50% Off," "Free Trial," "Same Day Service"
- Create urgency: "Limited Time," "Today Only," "While Supplies Last"

### Clear Call to Action
- **Be specific**: "Visit us today" vs "Call 555-0123"
- **Make it easy**: QR codes for instant action
- **Single action**: Don't confuse with multiple options

### Local Appeal
- **Mention location**: "Downtown Seattle Special"
- **Local imagery**: Recognize local landmarks
- **Community focus**: "Family-owned since 1995"

## Testing and Optimization

### A/B Testing Tips
1. **Test one element** at a time (headline, image, or CTA)
2. **Run tests simultaneously** for accurate comparison
3. **Measure relevant metrics**: views, engagement, conversions
4. **Give tests time**: Run for at least a week for reliable data

### Performance Metrics to Track
- **View duration**: How long people look at your ad
- **Engagement rate**: Actions taken (QR scans, visits, calls)
- **Cost per view**: Budget efficiency
- **Conversion rate**: Views that become customers

## Common Mistakes to Avoid

❌ **Too much text** - Viewers have only seconds to read
❌ **Low contrast** - Text that's hard to read gets ignored
❌ **Poor image quality** - Blurry or pixelated content looks unprofessional
❌ **No clear CTA** - Don't leave viewers guessing what to do next
❌ **Wrong dimensions** - Content that doesn't fit the screen properly

✅ **Pro tip**: Preview your content on different devices before publishing to ensure it looks good everywhere!

Ready to create your first ad? Use our built-in design templates to get started quickly!
      `
    },
    {
      id: 'pricing-strategy',
      title: 'Screen Owner Pricing Strategy',
      description: 'How to set competitive rates and maximize your screen revenue',
      category: 'screen-management',
      difficulty: 'intermediate',
      estimatedTime: '12 min',
      tags: ['pricing', 'revenue', 'strategy'],
      content: `
# Screen Owner Pricing Strategy

Maximize your earnings with smart pricing strategies that attract advertisers while optimizing revenue.

## Understanding Your Value

### Location Factors
- **Foot traffic**: More viewers = higher rates
- **Demographics**: Target audience quality matters
- **Visibility**: Street-facing vs interior placement
- **Competition**: Other screens in the area

### Audience Quality Metrics
- **Daily viewers**: Peak vs off-peak traffic
- **Dwell time**: How long people spend near your screen
- **Demographics**: Age, income, interests of typical viewers
- **Conversion potential**: Likelihood viewers will take action

## Pricing Models

### 1. Simple Flat Rate
**Best for**: New screen owners, consistent traffic
- One rate for all time slots
- Easy for advertisers to understand
- Example: $10/hour all day

**Pros**: Simple, predictable
**Cons**: May leave money on the table during peak times

### 2. Peak/Off-Peak Pricing
**Best for**: Variable traffic patterns
- Higher rates during busy periods
- Lower rates during quiet times
- Example: $15/hour peak, $7/hour off-peak

**Peak times typically**:
- Morning: 7am-10am (commute)
- Lunch: 11am-2pm (foot traffic)
- Evening: 5pm-8pm (commute/shopping)

### 3. Dynamic Pricing
**Best for**: Experienced owners, high-demand locations
- Prices change based on demand
- Higher rates for last-minute bookings
- Seasonal adjustments

### 4. Package Deals
- **Daily rates**: 8+ hours at discounted price
- **Weekly packages**: 20% discount for 5+ days
- **Bulk discounts**: Reduced rates for long-term commitments

## Market Research

### Competitive Analysis
1. **Find similar screens** in your area
2. **Check their rates** and availability
3. **Analyze their booking patterns**
4. **Identify gaps** in the market

### Testing Your Rates
1. **Start conservative**: Better to get bookings than no revenue
2. **Gradually increase**: Raise rates by 10-20% as you get busy
3. **Monitor booking rate**: Aim for 60-80% utilization
4. **Track revenue**: Total earnings vs booking rate

## Psychological Pricing Tactics

### Charm Pricing
- $9/hour feels much less than $10/hour
- $19.99 vs $20.00 psychological effect

### Anchoring
- Show premium package first
- Makes standard rates seem reasonable
- "Premium: $25/hour, Standard: $15/hour"

### Scarcity
- "Only 3 slots left today"
- "Early bird: Book 24hrs ahead for 15% off"

## Revenue Optimization Tips

### Maximize Bookings
- **Quick responses**: Reply to inquiries within 30 minutes
- **Flexible scheduling**: Offer various time slot durations
- **Easy booking**: Streamlined process increases conversions
- **Great photos**: Professional images get 3x more bookings

### Upselling Opportunities
- **Extended duration**: "Add 30 minutes for just $5 more"
- **Premium placement**: Best viewing angles cost extra
- **Package deals**: "Book 3 hours, get 1 free"
- **Recurring campaigns**: Monthly discounts for regular advertisers

### Seasonal Adjustments
- **Holiday premiums**: 50-100% increase during busy seasons
- **Event pricing**: Concerts, festivals, sports events nearby
- **Weather impacts**: Indoor screens premium during bad weather
- **School calendar**: Different rates during summer/school year

## Common Pricing Mistakes

❌ **Too expensive initially**: No bookings = no revenue or reviews
❌ **Race to the bottom**: Competing only on price reduces profits
❌ **Ignoring peak times**: Missing high-value opportunities
❌ **Complex pricing**: Confusing rates deter advertisers
❌ **Set and forget**: Not adjusting based on performance

## Success Metrics to Track

### Financial KPIs
- **Revenue per day**: Total daily earnings
- **Utilization rate**: Percentage of time booked
- **Average booking value**: Revenue per booking
- **Revenue per hour**: Total revenue ÷ available hours

### Operational Metrics
- **Booking conversion rate**: Inquiries that become bookings
- **Repeat customer rate**: Percentage of returning advertisers
- **Average response time**: How quickly you reply to inquiries
- **Customer satisfaction**: Reviews and ratings

## Sample Pricing Structure

### Coffee Shop (Medium Traffic)
- **Morning peak** (7am-10am): $12/hour
- **Lunch rush** (11am-2pm): $15/hour
- **Afternoon** (2pm-5pm): $8/hour
- **Evening** (5pm-8pm): $12/hour
- **Night/Early morning**: $5/hour

### Gym (Consistent Traffic)
- **Peak hours** (6am-9am, 5pm-8pm): $18/hour
- **Mid-day** (9am-5pm): $10/hour
- **Evening** (8pm-10pm): $12/hour
- **Off-hours**: $6/hour

Remember: Your pricing should reflect your screen's unique value. Start competitive and optimize based on real performance data!
      `
    },
    {
      id: 'payment-troubleshooting',
      title: 'Payment and Billing Help',
      description: 'Resolve common payment issues and understand billing cycles',
      category: 'payments',
      difficulty: 'beginner',
      estimatedTime: '6 min',
      tags: ['payments', 'billing', 'troubleshooting'],
      content: `
# Payment and Billing Help

Everything you need to know about payments, billing, and resolving common issues.

## For Advertisers

### Making Payments
RedSquare accepts:
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Digital Wallets**: Apple Pay, Google Pay
- **Bank Transfers**: Available for large campaigns ($500+)

### Billing Cycle
- **Pre-payment**: Pay before your ad displays
- **Automatic billing**: For recurring campaigns
- **Invoicing**: Available for business accounts

### Payment Timeline
1. **Book time slot**: Payment processed immediately
2. **Ad displays**: Content goes live at scheduled time
3. **Completion**: Ad runs for full duration
4. **Receipt**: Emailed within 24 hours

### Refund Policy
- **Full refund**: Cancel 24+ hours before scheduled time
- **Partial refund**: Cancel 2-24 hours before (50% refund)
- **No refund**: Cancellations less than 2 hours before
- **Technical issues**: Full refund for platform problems

## For Screen Owners

### Getting Paid
- **Automatic deposits**: Earnings transferred weekly
- **Minimum payout**: $25 minimum for transfers
- **Payment methods**: Bank transfer, PayPal, or Stripe
- **International**: Available in 50+ countries

### Earnings Timeline
1. **Ad completes**: Revenue recorded in your account
2. **Weekly processing**: Payments calculated every Monday
3. **Transfer initiated**: Tuesday (if above minimum)
4. **Funds arrive**: 2-5 business days depending on bank

### Tax Information
- **1099 forms**: Sent for US earnings over $600/year
- **International**: Tax responsibility varies by country
- **Business expenses**: Track costs for deductions
- **Records**: Keep receipts for equipment and utilities

## Common Issues & Solutions

### Payment Declined
**Possible causes:**
- Insufficient funds
- Expired card
- Bank security block
- International transaction block

**Solutions:**
1. **Try a different card**
2. **Contact your bank** to authorize the transaction
3. **Use PayPal** as an alternative method
4. **Check card details** for typos or expiration

### Missing Payment
**For Advertisers:**
1. Check email for payment confirmation
2. Verify transaction in your bank/card statement
3. Contact support with booking reference number

**For Screen Owners:**
1. Confirm ads ran successfully (check dashboard)
2. Verify minimum payout threshold reached
3. Check payment method is current and valid
4. Allow 2-5 business days for bank processing

### Disputed Charges
**If you see unexpected charges:**
1. **Check booking history** in your account
2. **Verify family/team member** didn't make the booking
3. **Review recurring campaigns** you may have set up
4. **Contact support** with transaction details if unrecognized

### International Payments
**Supported countries**: 50+ countries worldwide
**Currencies**: USD, EUR, GBP, CAD, AUD, and 20+ others
**Conversion**: Real-time rates, small conversion fee (2.9%)
**Tax implications**: Follow local tax laws for foreign income

## Payment Security

### How We Protect You
- **SSL encryption**: All transactions secured
- **PCI compliance**: Credit card data never stored on our servers
- **Two-factor authentication**: Available for account security
- **Fraud monitoring**: Automatic suspicious activity detection

### Best Practices
- **Use secure networks**: Avoid public WiFi for payments
- **Keep software updated**: Use latest browser versions
- **Monitor accounts**: Check statements regularly
- **Strong passwords**: Use unique passwords for your RedSquare account

## Business Accounts

### Features Available
- **Invoicing**: Net-30 payment terms
- **Bulk purchasing**: Discounts for high-volume bookings
- **Team management**: Multiple user access
- **Advanced reporting**: Detailed campaign analytics
- **Priority support**: Dedicated account manager

### Upgrade Benefits
- **Extended payment terms**
- **Volume discounts** (10-25% off)
- **Custom contracts** for large campaigns
- **White-label options** available

## Support Contacts

### Payment Issues (24/7)
- **Email**: payments@redsquare.tv
- **Phone**: 1-800-RED-SQUA (US/Canada)
- **Chat**: Available in-app during business hours

### Business Accounts
- **Email**: business@redsquare.tv
- **Dedicated phone**: Provided after upgrade

### International Support
- **EU**: support-eu@redsquare.tv
- **Asia Pacific**: support-apac@redsquare.tv
- **Other regions**: support@redsquare.tv

Need immediate help? Use the chat button in the bottom right corner for fastest response!
      `
    }
  ];

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: Play },
    { id: 'advertising', label: 'Advertising', icon: Video },
    { id: 'screen-management', label: 'Screen Management', icon: CheckCircle },
    { id: 'payments', label: 'Payments', icon: CheckCircle },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle }
  ];

  useEffect(() => {
    // Set contextual help based on current page and user type
    const getContextualHelp = () => {
      let relevant: HelpArticle[] = [];
      
      if (currentPage === 'discover' && userType === 'advertiser') {
        relevant = helpArticles.filter(article => 
          article.tags.includes('advertiser') || article.category === 'advertising'
        );
      } else if (currentPage === 'screen-registration' && userType === 'screen-owner') {
        relevant = helpArticles.filter(article => 
          article.tags.includes('screen-owner') || article.category === 'screen-management'
        );
      } else if (userType) {
        relevant = helpArticles.filter(article => 
          article.tags.includes(userType) || article.category === 'getting-started'
        );
      } else {
        relevant = helpArticles.filter(article => article.category === 'getting-started');
      }
      
      return relevant.slice(0, 3);
    };

    setContextualHelp(getContextualHelp());
  }, [currentPage, userType]);

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedArticleData = helpArticles.find(article => article.id === selectedArticle);

  const DifficultyBadge = ({ level }: { level: string }) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return <Badge className={colors[level as keyof typeof colors]}>{level}</Badge>;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 shadow-lg">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                {selectedArticle ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedArticle(null)}
                      className="mr-2 p-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    Help Center
                  </>
                ) : (
                  <>
                    <HelpCircle className="h-5 w-5" />
                    Help Center
                  </>
                )}
              </SheetTitle>
              <SheetDescription>
                {selectedArticle 
                  ? selectedArticleData?.title
                  : "Find answers and learn how to get the most out of RedSquare"
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {selectedArticle && selectedArticleData ? (
          // Article View
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <DifficultyBadge level={selectedArticleData.difficulty} />
              <Badge variant="outline">{selectedArticleData.estimatedTime}</Badge>
              {selectedArticleData.videoUrl && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Video
                </Badge>
              )}
            </div>

            {selectedArticleData.videoUrl && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <Play className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Video Tutorial Available</p>
                      <p className="text-sm text-muted-foreground">
                        Watch the video version of this guide
                      </p>
                    </div>
                    <Button asChild>
                      <a href={selectedArticleData.videoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Watch
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div 
                className="space-y-4"
                dangerouslySetInnerHTML={{ 
                  __html: selectedArticleData.content
                    .replace(/\n/g, '<br />')
                    .replace(/#{1}\s/g, '<h1 class="text-2xl font-bold mt-6 mb-3">')
                    .replace(/#{2}\s/g, '<h2 class="text-xl font-semibold mt-5 mb-2">')
                    .replace(/#{3}\s/g, '<h3 class="text-lg font-medium mt-4 mb-2">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/❌\s(.*?)$/gm, '<div class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg mb-2"><span class="text-red-500">❌</span><span class="text-red-800 dark:text-red-200">$1</span></div>')
                    .replace(/✅\s(.*?)$/gm, '<div class="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg mb-2"><span class="text-green-500">✅</span><span class="text-green-800 dark:text-green-200">$1</span></div>')
                }}
              />
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Was this helpful?</p>
                    <p className="text-sm text-muted-foreground">Let us know how we can improve</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">👍 Yes</Button>
                    <Button variant="outline" size="sm">👎 No</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Help Center Home
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Contextual Help */}
            {contextualHelp.length > 0 && !searchQuery && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recommended for you</h3>
                <div className="space-y-3">
                  {contextualHelp.map((article) => (
                    <Card 
                      key={article.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow hover-scale"
                      onClick={() => setSelectedArticle(article.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{article.title}</h4>
                            <p className="text-sm text-muted-foreground">{article.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <DifficultyBadge level={article.difficulty} />
                              <Badge variant="outline">{article.estimatedTime}</Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <Tabs defaultValue="getting-started" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{category.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-3">
                  {(searchQuery ? filteredArticles : helpArticles)
                    .filter(article => article.category === category.id)
                    .map((article) => (
                      <Card 
                        key={article.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow hover-scale"
                        onClick={() => setSelectedArticle(article.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{article.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{article.description}</p>
                              <div className="flex items-center gap-2">
                                <DifficultyBadge level={article.difficulty} />
                                <Badge variant="outline">{article.estimatedTime}</Badge>
                                {article.videoUrl && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <Video className="h-3 w-3" />
                                    Video
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Need More Help?
                </CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Our support team is here to help.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Live Chat
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <a href="mailto:support@redsquare.tv">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};