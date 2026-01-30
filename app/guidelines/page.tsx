'use client';

import { Users, Heart, Shield, MessageCircle, Smile, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const communityValues = [
  {
    icon: Heart,
    title: 'Respect & Kindness',
    description: 'Treat every member with dignity and respect. We are all here to find meaningful connections.'
  },
  {
    icon: Shield,
    title: 'Authenticity',
    description: 'Be yourself. Fake profiles and misrepresentation harm the community and waste everyone time.'
  },
  {
    icon: Smile,
    title: 'Positivity',
    description: 'Focus on building connections rather than tearing others down. Bring positive energy to interactions.'
  },
  {
    icon: MessageCircle,
    title: 'Honest Communication',
    description: 'Clear, honest, and respectful communication leads to better connections and fewer misunderstandings.'
  }
];

const dos = [
  'Be authentic in your profile and interactions',
  'Respect other members boundaries and preferences',
  'Communicate clearly and kindly',
  'Report suspicious or inappropriate behavior',
  'Keep personal information private until you are ready',
  'Be patient and give relationships time to develop',
  'Celebrate others success and connections',
  'Maintain a positive attitude'
];

const donts = [
  'Harass, bully, or demean other members',
  'Send unwanted messages or inappropriate content',
  'Create fake profiles or impersonate others',
  'Solicit money or financial information',
  'Discriminate based on race, ethnicity, gender, or religion',
  'Spam or promote commercial services',
  'Share others private information without consent',
  'Use the platform for hookups or non-faith-based relationships'
];

export default function CommunityGuidelinesPage() {
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
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-4">Community Guidelines</h1>
          <p className="text-xl text-muted-foreground">Building a faith-based community built on love, respect, and authenticity</p>
        </div>

        {/* Our Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {communityValues.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <value.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground text-sm">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Do and Do Not */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-600">
                <CheckCircle className="w-5 h-5" />
                We Encourage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {dos.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                We Do Not Tolerate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {donts.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Faith-Based Focus */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-secondary" />
              Our Faith-Based Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Committed was created specifically for Christian singles seeking meaningful, faith-based relationships.
              Our community guidelines reflect our mission to honor God in how we treat one another and pursue relationships.
            </p>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="font-medium mb-2">Remember:</p>
              <p className="text-muted-foreground text-sm">
                We are all children of God seeking to find love according to His plan. Let us treat each other
                with the same love and respect that Christ showed us.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reporting */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">See Something Wrong?</h3>
                <p className="text-muted-foreground mb-4">
                  If you see behavior that violates these guidelines, please report it immediately.
                  Our moderation team reviews all reports and takes appropriate action.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/report"
                    className="inline-flex items-center px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report a User
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
