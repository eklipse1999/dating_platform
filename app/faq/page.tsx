'use client';

import { HelpCircle, MessageCircle, User, Heart, Shield, CreditCard, Camera, Search, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqCategories = [
  {
    icon: User,
    title: 'Account & Profile',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" on the homepage and follow the prompts. You will need to provide your email, create a password, and fill out your profile information including photos and preferences.'
      },
      {
        q: 'How do I edit my profile?',
        a: 'Log in to your account and navigate to your profile settings. From there, you can update your photos, bio, interests, and preferences at any time.'
      },
      {
        q: 'Can I have multiple accounts?',
        a: 'No, we allow only one account per person. Multiple accounts may result in all accounts being suspended.'
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings > Account > Delete Account. Please note this action is irreversible and all your data will be permanently removed.'
      }
    ]
  },
  {
    icon: Heart,
    title: 'Matching & Connections',
    questions: [
      {
        q: 'How does matching work?',
        a: 'Our algorithm analyzes your profile, preferences, and activity to suggest compatible matches. We consider factors like faith background, interests, location, and relationship goals.'
      },
      {
        q: 'How do I connect with someone?',
        a: 'You can browse profiles and tap the heart icon to send a like. If the person likes you back, you will be able to message each other. Premium members can send messages directly.'
      },
      {
        q: 'Can I search for specific people?',
        a: 'Yes, use our search filters to find members based on age, location, denomination, interests, and other criteria.'
      },
      {
        q: 'Why am I not getting matches?',
        a: 'Make sure your profile is complete with good photos and a thoughtful bio. Also review your preferences to ensure they are not too restrictive. Being active on the platform also helps.'
      }
    ]
  },
  {
    icon: CreditCard,
    title: 'Subscription & Billing',
    questions: [
      {
        q: 'Is Committed free to use?',
        a: 'Yes, basic membership is free. You can browse profiles, send likes, and receive messages. Premium features like unlimited messaging and advanced search require a subscription.'
      },
      {
        q: 'What are the premium features?',
        a: 'Premium members can send unlimited messages, see who liked their profile, use advanced search filters, and get priority support.'
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'Go to Settings > Subscription > Cancel Subscription. Your access to premium features will continue until the end of your current billing period.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer a 7-day money-back guarantee for new subscriptions. Please contact support@committed.app to request a refund.'
      }
    ]
  },
  {
    icon: Shield,
    title: 'Safety & Privacy',
    questions: [
      {
        q: 'Is my personal information safe?',
        a: 'Yes, we use industry-standard encryption and security measures to protect your data. We never sell your information to third parties.'
      },
      {
        q: 'How do I report someone?',
        a: 'Visit the user profile, click the three dots menu, and select "Report." You can also file a detailed report at /report.'
      },
      {
        q: 'How do you verify profiles?',
        a: 'We use a combination of photo verification, social media linking, and AI-powered detection to identify and remove fake profiles.'
      },
      {
        q: 'Can I block someone?',
        a: 'Yes, you can block any user from their profile or from your messages. Blocked users cannot see your profile or message you.'
      }
    ]
  },
  {
    icon: Camera,
    title: 'Photos & Media',
    questions: [
      {
        q: 'How many photos can I upload?',
        a: 'Premium members can upload up to 6 photos. Free members can upload up to 3 photos.'
      },
      {
        q: 'What types of photos are allowed?',
        a: 'Photos must be of you, clear and well-lit. Selfies, professional photos, and candid shots are welcome. No group photos, photos of celebrities, or inappropriate content.'
      },
      {
        q: 'Why was my photo rejected?',
        a: 'Photos may be rejected if they do not meet our guidelines: must be of you alone, no nudity or suggestive content, no copyrighted images, and face must be clearly visible.'
      },
      {
        q: 'How do I verify my photos?',
        a: 'We offer optional photo verification where you take a selfie pose to match your profile photos. Verified profiles get a checkmark badge.'
      }
    ]
  }
];

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-lg px-4 -mx-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 px-4 text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground mb-8">Find answers to common questions about using Committed</p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <category.icon className="w-5 h-5 text-secondary" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {category.questions.map((q, qIndex) => (
                    <FAQItem key={qIndex} question={q.q} answer={q.a} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 bg-secondary/5 border-secondary/20">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Can not find the answer you are looking for? Please reach out to our support team.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/contact">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/help">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Visit Help Center
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
