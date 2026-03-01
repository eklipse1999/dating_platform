'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, Star, CreditCard, MapPin, Shield,
  Loader2, CheckCircle, Zap, Crown, Sparkles, Lock, Gift,
  AlertCircle, RefreshCw, Wifi, WifiOff, MessageCircle,
  Calendar, X
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/app-context';
import { POINTS_PACKAGES, getPaymentGateway, PointsPackage } from '@/lib/types';
import { paymentsService, PaymentResponse } from '@/lib/api/services/payement.service';

// ─── Helpers ────────────────────────────────────────────────────────────────
// Backend returns price in cents (999 = $9.99); values ≤ 500 treated as dollars
const fmtPrice = (p: number, currency = 'USD') => {
  const amount = p > 500 ? p / 100 : p;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

const fmtCard   = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
const fmtExpiry = (v: string) => { const d = v.replace(/\D/g, ''); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2,4)}` : d; };

const PLAN_ICONS = [Zap, Sparkles, Crown, Star, Gift];

// Tier display — maps plan name/points to a human label + emoji badge
// (tierID from backend is a UUID, so we derive tier from plan name + points)
const TIER_DISPLAY: Record<string, { label: string; emoji: string; color: string }> = {
  bronze:   { label: 'Bronze',   emoji: '🥉', color: 'text-amber-600'  },
  silver:   { label: 'Silver',   emoji: '🥈', color: 'text-slate-400'  },
  gold:     { label: 'Gold',     emoji: '🥇', color: 'text-yellow-500' },
  diamond:  { label: 'Diamond',  emoji: '💎', color: 'text-cyan-400'   },
  platinum: { label: 'Platinum', emoji: '👑', color: 'text-purple-400' },
};

const getTierInfo = (name: string, points: number) => {
  const n = name.toLowerCase();
  if (n.includes('platinum') || points >= 8000) return TIER_DISPLAY.platinum;
  if (n.includes('diamond')  || points >= 5000) return TIER_DISPLAY.diamond;
  if (n.includes('gold')     || points >= 3000) return TIER_DISPLAY.gold;
  if (n.includes('silver')   || points >= 1000) return TIER_DISPLAY.silver;
  return TIER_DISPLAY.bronze;
};

// ─── Plan card ───────────────────────────────────────────────────────────────
function PlanCard({ pkg, index, isSelected, onClick }: {
  pkg: PointsPackage; index: number; isSelected: boolean; onClick: () => void;
}) {
  const Icon = PLAN_ICONS[index % PLAN_ICONS.length];
  const isUnlimited = !pkg.dailyMessageLimit || pkg.dailyMessageLimit === 0;

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl border text-left transition-all duration-200 w-full ${
        isSelected
          ? 'border-secondary bg-secondary/5 ring-2 ring-secondary shadow-lg shadow-secondary/10'
          : pkg.isBestValue
          ? 'border-primary bg-primary/5 hover:border-primary/70'
          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
      }`}
    >
      {pkg.isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold whitespace-nowrap">
          <Star className="w-3 h-3" /> Best Value
        </div>
      )}

      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="absolute top-3 right-3 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-secondary-foreground" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-foreground'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground leading-none">{pkg.name}</h3>
          {(() => { const t = getTierInfo(pkg.name, pkg.points); return (
            <p className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 ${t.color}`}>
              <span>{t.emoji}</span><span>{t.label} Tier</span>
            </p>
          );})()}
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-foreground">{fmtPrice(pkg.price, pkg.currency)}</div>
        <div className="text-sm text-muted-foreground mt-0.5">
          <span className="font-semibold text-foreground">{pkg.points.toLocaleString()}</span> points
        </div>
      </div>

      {/* Features */}
      <div className="space-y-1.5 border-t border-border/60 pt-3">
        {[
          { icon: MessageCircle, label: pkg.canMessage ? 'Messaging enabled' : 'No messaging', active: pkg.canMessage ?? false },
          { icon: Calendar,      label: pkg.canScheduleDate ? 'Date scheduling' : 'No date scheduling', active: pkg.canScheduleDate ?? false },
          { icon: Check,         label: isUnlimited ? 'Unlimited messages/day' : `${pkg.dailyMessageLimit} messages/day`, active: true },
        ].map(({ icon: Ico, label, active }) => (
          <div key={label} className={`flex items-center gap-1.5 text-xs ${active ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-secondary/20 text-secondary' : 'bg-muted'}`}>
              {active ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
            </div>
            <span className={active ? '' : 'line-through'}>{label}</span>
          </div>
        ))}
      </div>
    </motion.button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function UpgradePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, currentUser, userLocation, addPoints, isInTrial, trialDaysRemaining, isAdmin } = useApp();

  // Plans
  const [packages, setPackages]       = useState<PointsPackage[]>(POINTS_PACKAGES);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError]   = useState(false);
  const [plansSource, setPlansSource] = useState<'live' | 'fallback'>('fallback');

  // Payment
  const [selectedPkg, setSelectedPkg]     = useState<PointsPackage | null>(null);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError]   = useState('');
  const [paymentRef, setPaymentRef]       = useState('');

  // Card form
  const [cardName, setCardName]     = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvc, setCvc]               = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (isAdmin) router.push('/admin'); }, [isAdmin, router]);
  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isAuthenticated, isLoading, router]);

  // ── GET /plans ─────────────────────────────────────────────────────────────
  const loadPlans = async () => {
    setPlansLoading(true);
    setPlansError(false);
    try {
      const raw = await paymentsService.getPlans();
      if (raw?.length > 0) {
        setPackages(raw.map((p, i) => ({
          id:               p.id     || String(i),
          name:             p.name   || `Plan ${i + 1}`,
          price:            p.price  ?? 0,
          points:           p.points ?? 0,
          currency:         p.currency || 'USD',
          tierID:           p.tierID   || '',
          canMessage:       p.canMessage      ?? false,
          canScheduleDate:  p.canScheduleDate ?? false,
          // null from backend means unlimited → normalise to 0
          dailyMessageLimit: p.dailyMessageLimit == null ? 0 : p.dailyMessageLimit,
          createdAt:        p.createdAt || '',
          isBestValue:      i === 1,
        })));
        setPlansSource('live');
        console.log(`✅ GET /plans — loaded ${raw.length} plans`);
      } else {
        setPlansSource('fallback');
        console.warn('⚠️ GET /plans returned empty — using fallback');
      }
    } catch (err: any) {
      setPlansError(true);
      setPlansSource('fallback');
      console.error('❌ GET /plans failed:', err?.message);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => { loadPlans(); }, []);

  if (!isAuthenticated || !currentUser) return null;

  const gateway = userLocation?.country ? getPaymentGateway(userLocation.country) : 'Stripe';

  // ── Card validation ────────────────────────────────────────────────────────
  const validateCard = () => {
    const errs: Record<string, string> = {};
    if (!cardName.trim())                        errs.cardName   = 'Name on card required';
    if (cardNumber.replace(/\s/g, '').length < 13) errs.cardNumber = 'Invalid card number';
    if (expiry.length < 5) {
      errs.expiry = 'Invalid expiry';
    } else {
      const [mm, yy] = expiry.split('/');
      if (new Date(2000 + +yy, +mm - 1) < new Date()) errs.expiry = 'Card has expired';
    }
    if (cvc.length < 3) errs.cvc = 'Invalid CVC';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── POST /payments ─────────────────────────────────────────────────────────
  // Exact Swagger body: { amount: number, plan_id: string, type: string }
  const handlePayment = async () => {
    if (!selectedPkg) { toast.error('Please select a plan'); return; }
    // Card validation only needed for Stripe — Paystack handles its own checkout
    if (gateway === 'Stripe' && !validateCard()) { toast.error('Please fix the card details'); return; }

    setIsProcessing(true);
    setPaymentError('');

    const payload = {
      amount:  selectedPkg.price,
      plan_id: selectedPkg.id,
      type:    gateway === 'Paystack' ? 'paystack' : 'stripe',
    };

    try {
      console.log('💳 POST /payments', payload);
      const res: PaymentResponse = await paymentsService.processPayment(payload);
      console.log('✅ Payment response:', res);

      // Capture reference from any known response field shape
      const ref = res.reference || res.transactionId
        || res.additionalProp1 || res.additionalProp2 || '';
      setPaymentRef(String(ref));

      // Update user points + tier locally
      addPoints?.(selectedPkg.points);
      setPaymentSuccess(true);
      toast.success(`${selectedPkg.points.toLocaleString()} points added!`);

    } catch (err: any) {
      const msg = err?.message || 'Payment failed. Please try again.';
      setPaymentError(msg);
      toast.error(msg);
      console.error('❌ POST /payments failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (paymentSuccess && selectedPkg) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-card rounded-2xl border border-border">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
              className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2 font-serif">Payment Successful!</h1>
            <p className="text-muted-foreground mb-1 text-sm">
              <strong className="text-foreground">{selectedPkg.points.toLocaleString()} points</strong> added to your account.
            </p>
            {paymentRef && (
              <p className="text-[11px] text-muted-foreground/50 font-mono mb-6">Ref: {paymentRef}</p>
            )}

            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-5 border border-primary/10">
              <div className="text-3xl font-bold text-foreground">{(currentUser.points || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Points Balance</div>
            </div>

            <div className="space-y-2 mb-6 text-left">
              {selectedPkg.canMessage && <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 shrink-0" /><span>Messaging unlocked</span></div>}
              {selectedPkg.canScheduleDate && <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 shrink-0" /><span>Date scheduling enabled</span></div>}
              {selectedPkg.tierID && <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 shrink-0" /><span>{selectedPkg.tierID} tier badge unlocked</span></div>}
            </div>

            <Button onClick={() => router.push('/dashboard')} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12">
              Continue to Dashboard
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {isInTrial && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-2xl border border-secondary/30 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Gift className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-bold text-secondary">Free Trial Active 🎉</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              <strong className="text-foreground">{trialDaysRemaining} days</strong> remaining. Upgrade to keep all features!
            </p>
          </motion.div>
        )}

        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-3">Choose Your Plan</h1>
          <p className="text-muted-foreground text-sm">Unlock messaging, see more profiles, and make meaningful connections.</p>
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{userLocation?.city || userLocation?.country || 'Your region'}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Secured by {gateway}</span>
            <span>•</span>
            <span className={`flex items-center gap-1 ${plansSource === 'live' ? 'text-green-500' : ''}`}>
              {plansSource === 'live' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {plansSource === 'live' ? 'Live pricing' : 'Preview pricing'}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Plans column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Select a Plan</h2>
              {plansError && (
                <button onClick={loadPlans} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              )}
            </div>

            <AnimatePresence>
              {plansError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Could not reach pricing server — showing preview plans.
                  <button onClick={loadPlans} className="underline ml-1 font-medium">Retry</button>
                </motion.div>
              )}
            </AnimatePresence>

            {plansLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[0,1,2,3].map(i => <div key={i} className="h-52 rounded-2xl border border-border bg-card animate-pulse" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {packages.map((pkg, i) => (
                  <PlanCard
                    key={pkg.id}
                    pkg={pkg}
                    index={i}
                    isSelected={selectedPkg?.id === pkg.id}
                    onClick={() => { setSelectedPkg(pkg); setPaymentError(''); }}
                  />
                ))}
              </div>
            )}

            {!plansLoading && (
              <div className="p-5 bg-card rounded-2xl border border-border">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" /> What points unlock
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {['Send messages to matches','View full profiles','Global match access','Advanced search filters',
                    'Priority in search','Tier badge upgrades','See who liked you','Exclusive event invites'].map(b => (
                    <div key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-secondary shrink-0" />{b}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment form column */}
          <div className="lg:sticky lg:top-24">
            <div className="p-5 bg-card rounded-2xl border border-border">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Payment Details
              </h2>

              {selectedPkg ? (
                <div className="space-y-4">
                  {/* Order summary */}
                  <div className="p-4 bg-muted/40 rounded-xl space-y-2 border border-border/60">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium">{selectedPkg.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Points</span>
                      <span className="font-medium">{selectedPkg.points.toLocaleString()} pts</span>
                    </div>
                    {selectedPkg.tierID && (() => { const t = getTierInfo(selectedPkg.name, selectedPkg.points); return (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tier</span>
                        <span className={`font-medium flex items-center gap-1 ${t.color}`}>
                          <span>{t.emoji}</span><span>{t.label}</span>
                        </span>
                      </div>
                    );})()}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-sm">Total</span>
                      <span className="text-lg font-bold text-foreground">{fmtPrice(selectedPkg.price, selectedPkg.currency)}</span>
                    </div>
                  </div>

                  {/* Card form — only for Stripe; Paystack handles payment on their own page */}
                  {gateway === 'Stripe' ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Name on Card</Label>
                        <Input value={cardName}
                          onChange={e => { setCardName(e.target.value); setCardErrors(p => ({...p, cardName:''})); }}
                          placeholder="Grace Walker" className={`mt-1 ${cardErrors.cardName ? 'border-destructive' : ''}`} />
                        {cardErrors.cardName && <p className="text-[11px] text-destructive mt-0.5">{cardErrors.cardName}</p>}
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Card Number</Label>
                        <div className="relative mt-1">
                          <Input value={cardNumber}
                            onChange={e => { setCardNumber(fmtCard(e.target.value)); setCardErrors(p => ({...p, cardNumber:''})); }}
                            placeholder="1234 5678 9012 3456" className={`font-mono pr-10 ${cardErrors.cardNumber ? 'border-destructive' : ''}`}
                            maxLength={19} inputMode="numeric" />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        </div>
                        {cardErrors.cardNumber && <p className="text-[11px] text-destructive mt-0.5">{cardErrors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Expiry</Label>
                          <Input value={expiry}
                            onChange={e => { setExpiry(fmtExpiry(e.target.value)); setCardErrors(p => ({...p, expiry:''})); }}
                            placeholder="MM/YY" className={`mt-1 ${cardErrors.expiry ? 'border-destructive' : ''}`}
                            maxLength={5} inputMode="numeric" />
                          {cardErrors.expiry && <p className="text-[11px] text-destructive mt-0.5">{cardErrors.expiry}</p>}
                        </div>
                        <div>
                          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">CVC</Label>
                          <Input value={cvc}
                            onChange={e => { setCvc(e.target.value.replace(/\D/g,'').slice(0,4)); setCardErrors(p => ({...p, cvc:''})); }}
                            placeholder="123" className={`mt-1 ${cardErrors.cvc ? 'border-destructive' : ''}`}
                            type="password" maxLength={4} inputMode="numeric" />
                          {cardErrors.cvc && <p className="text-[11px] text-destructive mt-0.5">{cardErrors.cvc}</p>}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground/60 bg-muted/30 rounded-lg p-2.5">
                        <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>256-bit encrypted. Processed by <strong className="text-foreground">Stripe</strong>. We never store card details.</span>
                      </div>
                    </div>
                  ) : (
                    /* Paystack — no card inputs needed, payment happens on Paystack's secure page */
                    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Pay securely with Paystack</p>
                          <p className="text-xs text-muted-foreground">You'll be redirected to Paystack's secure checkout</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        {['Card (Visa, Mastercard, Verve)', 'Bank Transfer', 'USSD', 'Mobile Money'].map(method => (
                          <div key={method} className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500 shrink-0" />
                            <span>{method}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/60 pt-1 border-t border-border">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>256-bit SSL encrypted. Your card details go directly to Paystack.</span>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {paymentError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{paymentError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div whileHover={{ scale: isProcessing ? 1 : 1.01 }} whileTap={{ scale: isProcessing ? 1 : 0.98 }}>
                    <Button onClick={handlePayment} disabled={isProcessing}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 font-semibold">
                      {isProcessing
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
                        : <>Pay {fmtPrice(selectedPkg.price, selectedPkg.currency)} via {gateway}</>
                      }
                    </Button>
                  </motion.div>

                  <p className="text-[11px] text-center text-muted-foreground/50">
                    By paying you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>.
                    Payments are non-refundable.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Select a plan to continue</p>
                  <p className="text-xs mt-1 opacity-60">Pick one from the options on the left</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}