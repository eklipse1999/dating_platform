'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POINTS_PACKAGES } from '@/lib/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const benefits = [
  'Send unlimited messages',
  'View full profiles',
  'Global match access',
  'Advanced filters',
  'Priority support',
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-muted-foreground mb-4 font-serif">
            Points Packages
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features and expand your reach. Choose the package that fits your journey.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {POINTS_PACKAGES.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={itemVariants}
              className={`relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                pkg.isBestValue
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              {pkg.isBestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold">
                  <Star className="w-3 h-3" />
                  Best Value
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-lg font-semibold mb-2 ${pkg.isBestValue ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {pkg.name}
                </h3>
                <div className={`text-3xl font-bold ${pkg.isBestValue ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {pkg.points.toLocaleString()}
                </div>
                <div className={`text-sm ${pkg.isBestValue ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  points
                </div>
              </div>

              <div className={`text-center mb-6 pb-6 border-b ${pkg.isBestValue ? 'border-primary-foreground/20' : 'border-border'}`}>
                <div className={`text-2xl font-bold ${pkg.isBestValue ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  ${pkg.price}
                </div>
                <div className={`text-xs ${pkg.isBestValue ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  ${(pkg.price / pkg.points * 100).toFixed(2)} per 100 pts
                </div>
              </div>

              <Link href="/upgrade" className="block">
                <Button
                  className={`w-full ${
                    pkg.isBestValue
                      ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-semibold text-muted-foreground mb-6">All packages include:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                <Check className="w-4 h-4 text-secondary" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tier Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 p-8 bg-card rounded-2xl border border-border"
        >
          <h3 className="text-xl font-semibold text-muted-foreground mb-6 text-center">Tier System</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl mb-1">🥉</div>
              <div className="font-semibold text-muted-foreground">Bronze</div>
              <div className="text-xs text-muted-foreground">0-500 pts</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl mb-1">🥈</div>
              <div className="font-semibold text-muted-foreground">Silver</div>
              <div className="text-xs text-muted-foreground">501-1,500 pts</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl mb-1">🥇</div>
              <div className="font-semibold text-muted-foreground">Gold</div>
              <div className="text-xs text-muted-foreground">1,501-3,000 pts</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl mb-1">💎</div>
              <div className="font-semibold text-muted-foreground">Platinum</div>
              <div className="text-xs text-muted-foreground">3,001-5,000 pts</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 col-span-2 md:col-span-1">
              <div className="text-2xl mb-1">💠</div>
              <div className="font-semibold text-muted-foreground">Diamond</div>
              <div className="text-xs text-muted-foreground">5,000+ pts</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
