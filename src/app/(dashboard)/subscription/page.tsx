'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Infinity, 
  Download, 
  Image, 
  Video, 
  MessageSquare,
  Sparkles,
  Shield,
  Users,
  Calendar,
  CreditCard,
  Gift
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    period: 'forever',
    badge: null,
    features: [
      'Up to 10 AI generations per day',
      'Basic character templates',
      'Standard image quality',
      'Community chat access',
      'Basic customization options'
    ],
    limitations: [
      'Limited daily generations',
      'No premium characters',
      'Standard resolution only',
      'Ads supported'
    ],
    buttonText: 'Current Plan',
    popular: false,
    current: true
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Most popular choice for creators',
    price: 9.99,
    period: 'month',
    badge: 'Most Popular',
    features: [
      'Unlimited AI generations',
      'Access to premium characters',
      'HD quality downloads',
      'Priority generation queue',
      'Advanced customization tools',
      'No ads',
      'Early access to new features',
      'Email support'
    ],
    limitations: [],
    buttonText: 'Upgrade Now',
    popular: true,
    current: false
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional creators and teams',
    price: 19.99,
    period: 'month',
    badge: 'Best Value',
    features: [
      'Everything in Premium',
      'Commercial usage rights',
      '4K ultra-high quality',
      'Batch generation tools',
      'API access',
      'Custom character creation',
      'Team collaboration features',
      'Priority support',
      'Advanced analytics'
    ],
    limitations: [],
    buttonText: 'Upgrade Now',
    popular: false,
    current: false
  }
];

const faqs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.'
  },
  {
    question: 'What happens to my generated content if I downgrade?',
    answer: 'All your previously generated content remains accessible. However, you may lose access to premium features and higher quality downloads.'
  },
  {
    question: 'Is there a free trial for premium plans?',
    answer: 'Yes! New users get a 7-day free trial of Premium features. No credit card required to start.'
  },
  {
    question: 'Can I use generated content commercially?',
    answer: 'Commercial usage rights are included with Pro plans. Free and Premium users have personal use licenses only.'
  }
];

export default function SubscriptionPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const getDiscountedPrice = (price: number) => {
    return isAnnual ? (price * 12 * 0.8).toFixed(2) : price.toFixed(2);
  };

  const getSavings = (price: number) => {
    return isAnnual ? (price * 12 * 0.2).toFixed(2) : '0';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Choose Your <span className="text-purple-500">Perfect Plan</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Unlock unlimited creativity with our AI-powered character generation platform
        </p>
        
        {/* Annual/Monthly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isAnnual ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <span className={`text-sm ${isAnnual ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            Annual
          </span>
          <Badge variant="secondary" className="ml-2">
            Save 20%
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative overflow-hidden ${
              plan.popular 
                ? 'border-purple-500 shadow-lg scale-105' 
                : plan.current 
                ? 'border-green-500' 
                : ''
            }`}
          >
            {plan.badge && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-semibold">
                {plan.badge}
              </div>
            )}
            
            <CardHeader className="text-center pb-8">
              <div className="mb-4">
                {plan.id === 'free' && <Gift className="w-8 h-8 mx-auto text-gray-500" />}
                {plan.id === 'premium' && <Crown className="w-8 h-8 mx-auto text-purple-500" />}
                {plan.id === 'pro' && <Sparkles className="w-8 h-8 mx-auto text-gold-500" />}
              </div>
              
              <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
              <CardDescription className="text-base mb-4">
                {plan.description}
              </CardDescription>
              
              <div className="text-center">
                {plan.price === 0 ? (
                  <div className="text-3xl font-bold">Free</div>
                ) : (
                  <div>
                    <div className="text-4xl font-bold">
                      ${isAnnual ? getDiscountedPrice(plan.price) : plan.price}
                      <span className="text-lg text-muted-foreground font-normal">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && plan.price > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        Save ${getSavings(plan.price)} per year
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Limitations for free plan */}
              {plan.limitations.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Limitations:</h4>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {limitation}
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                className={`w-full ${
                  plan.current 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : plan.popular 
                    ? 'bg-purple-500 hover:bg-purple-600' 
                    : ''
                }`}
                disabled={plan.current}
                size="lg"
              >
                {plan.current ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {plan.buttonText}
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Features</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold">Premium</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Daily Generations', free: '10', premium: 'Unlimited', pro: 'Unlimited' },
                    { feature: 'Image Quality', free: 'Standard', premium: 'HD', pro: '4K Ultra' },
                    { feature: 'Character Library', free: 'Basic', premium: 'Premium', pro: 'All + Custom' },
                    { feature: 'Download Rights', free: 'Personal', premium: 'Personal', pro: 'Commercial' },
                    { feature: 'Support', free: 'Community', premium: 'Email', pro: 'Priority' },
                    { feature: 'API Access', free: '✗', premium: '✗', pro: '✓' },
                    { feature: 'Team Features', free: '✗', premium: '✗', pro: '✓' }
                  ].map((row, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center text-sm">{row.free}</td>
                      <td className="p-4 text-center text-sm">{row.premium}</td>
                      <td className="p-4 text-center text-sm">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="text-center mt-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Our support team is here to help you choose the right plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
