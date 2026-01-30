'use client';

import { Shield, Phone, Mail, MapPin, Lock, Eye, AlertTriangle, Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SafetyPage() {
  const safetyTips = [
    {
      icon: Lock,
      title: 'Protect Your Personal Information',
      description: 'Never share your home address, phone number, financial information, or workplace details with someone you just met.'
    },
    {
      icon: Eye,
      title: 'Take Your Time',
      description: 'Get to know someone through our platform before meeting in person. Video calls are a great intermediate step.'
    },
    {
      icon: MapPin,
      title: 'Meet in Public Places',
      description: 'Always meet for the first time in a public, well-lit location. Never meet at your home or theirs.'
    },
    {
      icon: Phone,
      title: 'Tell Someone About Your Plans',
      description: "Let a friend or family member know where you're going and who you're meeting. Check in with them during the date."
    },
    {
      icon: AlertTriangle,
      title: 'Trust Your Instincts',
      description: 'If something feels off, end the conversation or date immediately. Your safety is more important than being polite.'
    },
    {
      icon: Heart,
      title: 'Report Suspicious Behavior',
      description: 'If someone makes you uncomfortable, reports them immediately. We take all reports seriously and act quickly.'
    }
  ];

  const warningSigns = [
    'Asks for money or financial assistance',
    'Moves the conversation to another platform too quickly',
    'Refuses to video chat or meet in person',
    'Inconsistent stories or details',
    'Expresses strong feelings very quickly',
    'Asks for personal or sensitive photos',
    'Claims to be overseas or in the military',
    'Has few photos or only professional-looking images'
  ];

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
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-4">Safety Center</h1>
          <p className="text-xl text-muted-foreground">Your safety is our top priority. Learn how to stay protected while using Committed.</p>
        </div>

        {/* Safety Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Safety Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {safetyTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <tip.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{tip.title}</h3>
                      <p className="text-muted-foreground text-sm">{tip.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Warning Signs */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Warning Signs to Watch For
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Be alert to these red flags that may indicate a scammer or someone with bad intentions:</p>
            <div className="grid md:grid-cols-2 gap-3">
              {warningSigns.map((sign, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{sign}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Need Help Now?</h3>
                <p className="text-muted-foreground mb-4">
                  If you are in immediate danger, contact your local emergency services (911, 999, or your local number) immediately.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/report">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Report a User
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/contact">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Commitment */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-secondary" />
              Our Safety Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Committed is dedicated to creating a safe environment for faith-based singles to connect.
              We employ multiple layers of protection to keep our community safe:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Profile verification to reduce fake accounts</li>
              <li>AI-powered detection of suspicious behavior</li>
              <li>24/7 moderation team reviewing reports</li>
              <li>Safe mode features to control who can contact you</li>
              <li>Block and report functionality on every profile</li>
              <li>Regular safety updates and community education</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
