'use client';

import { AlertTriangle, Flag, Shield, User, MessageCircle, FileText, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const reportReasons = [
  { value: 'fake', label: 'Fake Profile', description: 'This person is pretending to be someone they are not' },
  { value: 'harassment', label: 'Harassment', description: 'They are being abusive, threatening, or offensive' },
  { value: 'scam', label: 'Scam / Fraud', description: 'They are asking for money or trying to defraud me' },
  { value: 'spam', label: 'Spam', description: 'They are sending unwanted commercial messages' },
  { value: 'inappropriate', label: 'Inappropriate Content', description: 'Their photos or messages contain explicit material' },
  { value: 'discrimination', label: 'Discrimination', description: 'They are making racist, sexist, or discriminatory remarks' },
  { value: 'underage', label: 'Underage User', description: 'This person appears to be under 18' },
  { value: 'other', label: 'Other', description: 'Something else that violates our guidelines' }
];

export default function ReportIssuePage() {
  const [selectedReason, setSelectedReason] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    description: '',
    evidence: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Report submitted successfully', {
      description: 'Thank you for helping keep our community safe. We will review your report within 24 hours.'
    });
    setFormData({ username: '', description: '', evidence: '' });
    setSelectedReason('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 text-destructive mb-6">
            <Flag className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-4">Report an Issue</h1>
          <p className="text-muted-foreground">
            Help us maintain a safe community by reporting behavior that violates our guidelines.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Before You Report
            </CardTitle>
            <CardDescription>
              Please review our safety guidelines and community guidelines first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/safety">
                  <Shield className="w-4 h-4 mr-2" />
                  Safety Guidelines
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/guidelines">
                  <FileText className="w-4 h-4 mr-2" />
                  Community Guidelines
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Flag className="w-5 h-5 text-secondary" />
              Submit a Report
            </CardTitle>
            <CardDescription>
              All reports are confidential and reviewed by our moderation team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username of the person you are reporting</Label>
                <Input
                  id="username"
                  placeholder="Enter their username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Reason for reporting</Label>
                <div className="grid gap-3">
                  {reportReasons.map((reason) => (
                    <div
                      key={reason.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedReason === reason.value
                          ? 'border-secondary bg-secondary/5'
                          : 'border-border hover:border-secondary/50'
                      }`}
                      onClick={() => setSelectedReason(reason.value)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedReason === reason.value ? 'border-secondary bg-secondary' : 'border-muted-foreground'
                        }`}>
                          {selectedReason === reason.value && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium">{reason.label}</p>
                          <p className="text-sm text-muted-foreground">{reason.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Details</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide as much detail as possible about the issue..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence (Optional)</Label>
                <Textarea
                  id="evidence"
                  placeholder="Paste any relevant message excerpts or describe what happened..."
                  rows={3}
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Do not include sensitive personal information. Our team will have access to the relevant conversation history.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={!selectedReason}>
                <Send className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Your Report is Confidential</p>
              <p className="text-sm text-muted-foreground">
                We protect your identity and will never inform the reported user that you filed a complaint.
                Your safety and privacy are our top priorities.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
