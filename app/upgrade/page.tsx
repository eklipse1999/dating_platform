'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, CreditCard, MapPin, Shield, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/app-context';
import { POINTS_PACKAGES, getPaymentGateway, PointsPackage } from '@/lib/types';

export default function UpgradePage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, userLocation, addPoints } = useApp();
  const [selectedPackage, setSelectedPackage] = useState<PointsPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const paymentGateway = userLocation?.country 
    ? getPaymentGateway(userLocation.country) 
    : 'Stripe';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const handleSelectPackage = (pkg: PointsPackage) => {
    setSelectedPackage(pkg);
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add points to user
    addPoints(selectedPackage.points);
    setPaymentSuccess(true);
    
    toast.success(`Successfully purchased ${selectedPackage.points.toLocaleString()} points!`);
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (paymentSuccess && selectedPackage) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-card rounded-2xl border border-border"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-accent mb-2 font-serif">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              {selectedPackage.points.toLocaleString()} points have been added to your account.
            </p>
            <div className="p-4 bg-muted/50 rounded-xl mb-6">
              <div className="text-3xl font-bold text-accent">
                {(currentUser.points).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <Button 
              onClick={handleContinue}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12"
            >
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
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-accent mb-4 font-serif">
              Upgrade Your Experience
            </h1>
            <p className="text-muted-foreground">
              Get points to unlock messaging, see more profiles, and make meaningful connections.
            </p>
          </div>

          {/* Location Detection */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Detected location: <span className="text-accent font-medium">{userLocation?.country || 'United States'}</span>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Payment via <span className="text-accent font-medium">{paymentGateway}</span>
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Packages */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-accent mb-4">Select a Package</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {POINTS_PACKAGES.map((pkg) => (
                  <motion.button
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPackage(pkg)}
                    className={`relative p-6 rounded-2xl border text-left transition-all ${
                      selectedPackage?.id === pkg.id
                        ? 'border-secondary bg-secondary/5 ring-2 ring-secondary'
                        : pkg.isBestValue
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    {pkg.isBestValue && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                        <Star className="w-3 h-3" />
                        Best Value
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="font-semibold text-accent">{pkg.name}</h3>
                      <div className="text-2xl font-bold text-accent">
                        {pkg.points.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="text-xl font-bold text-accent">${pkg.price}</div>
                      <div className="text-xs text-muted-foreground">
                        ${(pkg.price / pkg.points * 100).toFixed(2)} per 100 pts
                      </div>
                    </div>

                    {selectedPackage?.id === pkg.id && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-secondary-foreground" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Benefits */}
              <div className="mt-8 p-6 bg-card rounded-2xl border border-border">
                <h3 className="font-semibold text-accent mb-4">What you get with points:</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Send unlimited messages',
                    'View full profiles',
                    'Global match access',
                    'Advanced filters',
                    'Priority support',
                    'Tier upgrades',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-secondary" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 bg-card rounded-2xl border border-border">
                <h2 className="text-lg font-semibold text-accent mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Details
                </h2>

                {selectedPackage ? (
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Package</span>
                        <span className="font-medium text-accent">{selectedPackage.name}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Points</span>
                        <span className="font-medium text-accent">{selectedPackage.points.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="font-semibold text-accent">Total</span>
                        <span className="text-xl font-bold text-accent">${selectedPackage.price}</span>
                      </div>
                    </div>

                    {/* Payment Form (Mock) */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          defaultValue="4242 4242 4242 4242"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            defaultValue="12/28"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            defaultValue="123"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Security */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Secured by {paymentGateway}. Your data is encrypted.</span>
                    </div>

                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Pay ${selectedPackage.price}</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a package to proceed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
