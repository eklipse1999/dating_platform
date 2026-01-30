'use client';

import { HelpCircle, Book, MessageCircle, Mail, Phone, Video, FileText, ArrowLeft, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const helpCategories = [
  {
    icon: Book,
    title: 'Getting Started',
    description: 'Learn the basics of setting up your profile and using Committed',
    articles: ['Creating your profile', 'Uploading photos', 'Setting preferences', 'Understanding matches']
  },
  {
    icon: MessageCircle,
    title: 'Messaging & Connections',
    description: 'How to communicate with other members safely',
    articles: ['Sending messages', 'Video calls', 'Safe dating tips', 'Blocking users']
  },
  {
    icon: FileText,
    title: 'Subscription & Billing',
    description: 'Manage your account, payments, and subscription',
    articles: ['Premium features', 'Payment methods', 'Cancellation', 'Refunds']
  },
  {
    icon: Video,
    title: 'Safety & Privacy',
    description: 'Stay safe and protect your personal information',
    articles: ['Safety guidelines', 'Privacy settings', 'Reporting', 'Two-factor authentication']
  }
];

const faqItems = [
  {
    question: 'How do I create a profile?',
    answer: 'Click the "Sign Up" button on the homepage and follow the prompts. You will need to provide basic information, add photos, and describe yourself and what you are looking for in a partner.'
  },
  {
    question: 'Is Committed really free?',
    answer: 'Committed offers a free basic membership that lets you browse profiles and send likes. Premium features like unlimited messaging and advanced search require a subscription.'
  },
  {
    question: 'How does matching work?',
    answer: 'Our algorithm considers your preferences, interests, and activity to suggest compatible matches. You can also browse profiles and connect with people who share your values.'
  },
  {
    question: 'Is my information safe?',
    answer: 'Yes, we take your privacy seriously. We use encryption and never share your personal information with third parties without your consent. Read our Privacy Policy for more details.'
  }
];

export default function HelpCenterPage() {
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
          <h1 className="text-4xl font-bold font-serif mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">Find answers to common questions and get support</p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <category.icon className="w-5 h-5 text-secondary" />
                  {category.title}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-secondary flex items-center gap-2 transition-colors">
                        <FileText className="w-3 h-3" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick FAQ */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-secondary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">{item.question}</h4>
                  <p className="text-muted-foreground text-sm">{item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-secondary" />
              Still Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Our support team is here to assist you</p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/contact">
                  <MessageCircle className="w-6 h-6" />
                  <span>Live Chat</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="mailto:support@committed.app">
                  <Mail className="w-6 h-6" />
                  <span>Email Us</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/faq">
                  <HelpCircle className="w-6 h-6" />
                  <span>Browse FAQ</span>
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
