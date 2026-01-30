'use client';

import { FileText, CheckCircle, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
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
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-4">Terms of Service</h1>
          <p className="text-xl text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-secondary" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                By accessing or using Committed's services, you agree to be bound by these Terms of Service
                and all applicable laws and regulations. If you do not agree with any part of these terms,
                you may not use our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                2. Account Eligibility and Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                To use our services, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Be at least 18 years of age</li>
                <li>Be single and seeking a serious relationship</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not create more than one account</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                3. User Conduct and Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Use the service only for lawful purposes and in accordance with these Terms</li>
                <li>Respect other users and maintain honest, authentic communications</li>
                <li>Not engage in harassment, discrimination, or harmful behavior</li>
                <li>Not solicit money or personal information from other users</li>
                <li>Not create false profiles or impersonate others</li>
                <li>Not use the service for any commercial or promotional purposes without authorization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-secondary" />
                4. Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                The following are strictly prohibited:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Any form of hate speech, racism, or discrimination</li>
                <li>Harassment, bullying, or threats toward other users</li>
                <li>Sending unsolicited sexual content or explicit material</li>
                <li>Scams, fraud, or any attempt to deceive other users</li>
                <li>Spam, junk mail, or automated messaging</li>
                <li>Commercial solicitation or prostitution</li>
                <li>Any activity that violates the laws of your jurisdiction</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-secondary" />
                5. Subscription and Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                Some features require a paid subscription. By subscribing, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Pay all fees associated with your chosen subscription plan</li>
                <li>Automatic renewal unless cancelled before the renewal date</li>
                <li>Our refund policy as stated in our billing terms</li>
                <li>Provide valid payment information and keep it updated</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-secondary" />
                6. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                We may terminate or suspend your account at our sole discretion, without prior notice,
                for conduct that we believe violates these Terms of Service or is harmful to other users,
                us, or third parties. You may also terminate your account at any time through your account settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
