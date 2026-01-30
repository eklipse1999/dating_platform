'use client';

import { Shield, Eye, Lock, Database, Share2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold font-serif mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-secondary" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                We collect information you provide directly to us, including when you create an account,
                update your profile, communicate with other users, or use our services. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Account Information:</strong> Name, email address, phone number, date of birth, gender</li>
                <li><strong>Profile Information:</strong> Photos, bio, interests, faith background, and other details you choose to share</li>
                <li><strong>Communications:</strong> Messages, feedback, and support inquiries</li>
                <li><strong>Usage Data:</strong> How you interact with our platform, including features you use and time spent</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-secondary" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Provide, maintain, and improve our dating services</li>
                <li>Create and manage your account</li>
                <li>Match you with compatible singles based on your preferences</li>
                <li>Facilitate communication between users</li>
                <li>Send you updates, notifications, and marketing communications</li>
                <li>Protect the safety and security of our community</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="w-5 h-5 text-secondary" />
                3. Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                Your data is stored on secure servers with industry-standard encryption. We implement
                appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method
                of transmission over the Internet is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-secondary" />
                4. Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Other Users:</strong> Profile information you choose to display publicly</li>
                <li><strong>Service Providers:</strong> Third parties who assist in operating our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                5. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Committed</p>
                <p className="text-muted-foreground">Email: privacy@committed.app</p>
                <p className="text-muted-foreground">Address: 100 Faith Street, Lagos, Nigeria</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
