'use client';

import { Cookie, Settings, Shield, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CookiePolicyPage() {
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
            <Cookie className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-4">Cookie Policy</h1>
          <p className="text-xl text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cookie className="w-5 h-5 text-secondary" />
                1. What Are Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your device when you visit our website.
                They help us provide you with a better experience by enabling certain functionality and
                helping us understand how you use our platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-secondary" />
                2. Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Essential Cookies</h4>
                  <p className="text-muted-foreground text-sm">
                    Required for the website to function properly. They enable core features like
                    account authentication, security, and network management.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Cookies</h4>
                  <p className="text-muted-foreground text-sm">
                    Help us understand how visitors interact with our website by collecting anonymous
                    information about page visits and error messages.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Functionality Cookies</h4>
                  <p className="text-muted-foreground text-sm">
                    Allow us to remember choices you make, such as language preferences and display settings.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Targeting/Advertising Cookies</h4>
                  <p className="text-muted-foreground text-sm">
                    Used to deliver relevant advertisements to you and measure their effectiveness.
                    These may be set by our advertising partners.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-secondary" />
                3. How We Use Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our platform to improve our services</li>
                <li>Personalize your experience and content</li>
                <li>Protect against fraud and unauthorized access</li>
                <li>Deliver relevant advertisements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-secondary" />
                4. Managing Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground mb-4">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>View cookies stored on your device</li>
                <li>Delete all or specific cookies</li>
                <li>Block cookies from all or specific websites</li>
                <li>Set preferences for first-party and third-party cookies</li>
              </ul>
              <div className="mt-6 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> Blocking essential cookies may prevent you from using certain
                  features of our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-secondary" />
                5. Do Not Track
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                Some browsers have a "Do Not Track" (DNT) feature. Currently, there is no industry
                standard for handling DNT signals, so we do not respond to DNT signals at this time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cookie className="w-5 h-5 text-secondary" />
                6. Updates to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in technology,
                legislation, or our business practices. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
