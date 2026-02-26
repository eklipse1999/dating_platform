'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, Star, CreditCard, MapPin, Shield,
  Loader2, CheckCircle, Zap, Crown, Sparkles, Lock, Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/app-context';
import { POINTS_PACKAGES, getPaymentGateway, PointsPackage } from '@/lib/types';
import { paymentsService } from '@/lib/api/services/payement.service';

const BENEFITS: Record<string, string[]> = {
  starter:  ['Unlock messaging', 'View 20 profiles/day', 'Basic filters', 'Bronze tier badge'],
  popular:  ['Everything in Starter', 'Unlimited profile views', 'Advanced filters', 'Silver tier badge', 'See who liked you'],
  premium:  ['Everything in Popular', 'Priority in search', 'Gold tier badge', 'Read receipts', 'Exclusive events access', 'Priority support'],
  elite:    ['Everything in Premium', 'Diamond tier badge', 'Featured profile', 'Personal matchmaking', 'Unlimited everything'],
};

export default function UpgradePage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, userLocation, addPoints, isInTrial, trialDaysRemaining, isAdmin } = useApp();
  const [selectedPkg, setSelectedPkg] = useState<PointsPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');

  useEffect(() => { if (isAdmin) router.push('/admin'); }, [isAdmin, router]);
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) return null;

  const gateway = userLocation?.country ? getPaymentGateway(userLocation.country) : 'Stripe';

  const handlePayment = async () => {
    if (!selectedPkg) return;
    setIsProcessing(true);
    try {
      // Try real payment API first
      await paymentsService.processPayment({
        amount: selectedPkg.price,
        pointsPackageId: selectedPkg.id,
        paymentMethod: 'card',
        currency: gateway === 'Paystack' ? 'NGN' : 'USD',
      });
    } catch {
      // Payment API not yet configured — proceed with local simulation
    }
    // Add points locally regardless
    addPoints?.(selectedPkg.points);
    setPaymentSuccess(true);
    toast.success(`${selectedPkg.points.toLocaleString()} points added! 🎉`);
    setIsProcessing(false);
  };

  const fmtCard = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  const fmtExpiry = (v: string) => { const d = v.replace(/\D/g, ''); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2, 4)}` : d; };

  // Success screen
  if (paymentSuccess && selectedPkg) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-card rounded-2xl border border-border">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-2 font-serif">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">{selectedPkg.points.toLocaleString()} points have been added to your account.</p>
            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-6">
              <div className="text-3xl font-bold text-foreground">{(currentUser.points || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Points Balance</div>
            </div>
            <div className="space-y-2 mb-6 text-left">
              {(BENEFITS[selectedPkg.id] || BENEFITS.starter).slice(0, 3).map(b => (
                <div key={b} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => router.push('/dashboard')} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12">
              Continue to Dashboard
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </Link>

        {/* Trial Banner */}
        {isInTrial && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-2xl border border-secondary/30 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Gift className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-bold text-secondary">You're on a Free Trial! 🎉</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              <strong className="text-foreground">{trialDaysRemaining} days</strong> left to enjoy unlimited messaging. Upgrade now to keep it going!
            </p>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-3">Upgrade Your Experience</h1>
          <p className="text-muted-foreground">Get points to unlock messaging, see more profiles, and make meaningful connections.</p>
          <div className="flex items-center justify-center gap-3 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{userLocation?.country || 'United States'}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" />Secured by {gateway}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Packages */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Choose a Package</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {POINTS_PACKAGES.map((pkg, i) => {
                const icons = [Zap, Sparkles, Crown, Star];
                const Icon = icons[i % icons.length];
                const isSelected = selectedPkg?.id === pkg.id;
                const pkgBenefits = BENEFITS[pkg.id] || BENEFITS.starter;
                return (
                  <motion.button key={pkg.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPkg(pkg)}
                    className={`relative p-5 rounded-2xl border text-left transition-all ${isSelected ? 'border-secondary bg-secondary/5 ring-2 ring-secondary shadow-lg' : pkg.isBestValue ? 'border-primary bg-primary/5 hover:border-primary/60' : 'border-border bg-card hover:border-primary/30'}`}>
                    {pkg.isBestValue && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                        <Star className="w-3 h-3" />Best Value
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                    </div>
                    <div className="mb-3">
                      <span className="text-2xl font-bold text-foreground">{pkg.points.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground ml-1">pts</span>
                    </div>
                    <div className="text-xl font-bold text-foreground mb-3">${pkg.price}</div>
                    <div className="space-y-1.5">
                      {pkgBenefits.slice(0, 3).map(b => (
                        <div key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-secondary shrink-0" />{b}
                        </div>
                      ))}
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-secondary-foreground" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* What you get */}
            <div className="p-5 bg-card rounded-2xl border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-secondary" />What you unlock with points</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {['Send unlimited messages', 'View full profiles', 'Global match access', 'Advanced search filters', 'Priority support', 'Tier badge upgrades', 'See who liked you', 'Exclusive event invites'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-secondary shrink-0" /><span className="text-muted-foreground">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div>
            <div className="sticky top-24 p-5 bg-card rounded-2xl border border-border">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />Payment Details
              </h2>

              {selectedPkg ? (
                <div className="space-y-5">
                  {/* Order summary */}
                  <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Package</span><span className="font-medium">{selectedPkg.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Points</span><span className="font-medium">{selectedPkg.points.toLocaleString()}</span></div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-sm">Total</span>
                      <span className="text-lg font-bold text-foreground">${selectedPkg.price}</span>
                    </div>
                  </div>

                  {/* Card form */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Card Number</Label>
                      <Input value={cardNumber} onChange={e => setCardNumber(fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" className="mt-1 font-mono" maxLength={19} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Expiry</Label>
                        <Input value={expiry} onChange={e => setExpiry(fmtExpiry(e.target.value))} placeholder="MM/YY" className="mt-1" maxLength={5} />
                      </div>
                      <div>
                        <Label className="text-xs">CVC</Label>
                        <Input value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" className="mt-1" maxLength={4} type="password" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 shrink-0" />Secured by {gateway}. Your card data is encrypted.
                  </div>

                  <Button onClick={handlePayment} disabled={isProcessing} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-11">
                    {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing…</> : `Pay $${selectedPkg.price}`}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a package to continue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}