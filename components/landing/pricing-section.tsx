'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POINTS_PACKAGES } from '@/lib/types';
import { useRef, useState } from 'react';

const benefits = [
  'Send unlimited messages',
  'View full profiles',
  'Global match access',
  'Advanced filters',
  'Priority support',
];

const tiers = [
  { emoji: '🥉', name: 'Bronze', range: '0–500 pts', color: 'from-amber-700/20 to-amber-600/10', border: 'border-amber-700/20' },
  { emoji: '🥈', name: 'Silver', range: '501–1,500 pts', color: 'from-slate-400/20 to-slate-300/10', border: 'border-slate-400/20' },
  { emoji: '🥇', name: 'Gold', range: '1,501–3,000 pts', color: 'from-amber-400/20 to-amber-300/10', border: 'border-amber-400/20' },
  { emoji: '💎', name: 'Platinum', range: '3,001–5,000 pts', color: 'from-cyan-400/20 to-cyan-300/10', border: 'border-cyan-400/20' },
  { emoji: '💠', name: 'Diamond', range: '5,000+ pts', color: 'from-blue-400/20 to-indigo-300/10', border: 'border-blue-400/20' },
];

function PricingCard({ pkg, index }: { pkg: any; index: number }) {
  const isBestValue = pkg.isBestValue === true;
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);//hover
  const rotateX = useSpring(useTransform(mouseY, [-120, 120], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-120, 120], [-5, 5]), { stiffness: 300, damping: 30 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); setHovered(false); };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHovered(true)}
      className="relative"
    >
      {/* Best value glow */}
      {isBestValue && (
        <motion.div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-primary/40 to-secondary/40 blur-md"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className={`relative p-6 rounded-2xl border transition-all duration-300 h-full flex flex-col ${
        isBestValue
          ? 'bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20'
          : 'bg-card border-border hover:border-primary/30 shadow-md hover:shadow-xl'
      }`}>
        {/* Best value badge */}
        {isBestValue && (
          <motion.div
            initial={{ scale: 0, y: -10 }}
            whileInView={{ scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 300, delay: index * 0.08 + 0.3 }}
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold shadow-lg whitespace-nowrap"
          >
            <Star className="w-3 h-3 fill-current" />
            Best Value
          </motion.div>
        )}

        {/* Points */}
        <div className="text-center mb-5 mt-2">
          <h3 className={`text-base font-semibold mb-3 ${isBestValue ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {pkg.name}
          </h3>
          <motion.div
            className={`text-4xl font-bold tabular-nums ${isBestValue ? 'text-primary-foreground' : 'text-foreground'}`}
            animate={hovered ? { scale: 1.07 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {pkg.points.toLocaleString()}
          </motion.div>
          <div className={`text-xs mt-0.5 ${isBestValue ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            points
          </div>
        </div>

        {/* Price */}
        <div className={`text-center mb-5 pb-5 border-b ${isBestValue ? 'border-primary-foreground/15' : 'border-border'}`}>
          <div className={`text-2xl font-bold ${isBestValue ? 'text-primary-foreground' : 'text-foreground'}`}>
            ${pkg.price.toFixed(2)}
          </div>
          <div className={`text-xs mt-0.5 ${isBestValue ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            ${(pkg.price / pkg.points * 100).toFixed(2)} per 100 pts
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Link href="/upgrade" className="block">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className={`w-full relative overflow-hidden ${
                isBestValue
                  ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/30'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}>
                <motion.span
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.35 }}
                />
                <span className="relative flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Get Started
                </span>
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function PricingSection() {
  const plans = POINTS_PACKAGES;

  return (
    <section id="pricing" className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none"
        animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4"
          >
            <Zap className="w-3.5 h-3.5" />
            Flexible packages
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-serif"
          >
            Points Packages
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Unlock premium features and expand your reach. Choose the package that fits your journey.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5" style={{ perspective: '1200px' }}>
          {plans.map((pkg, index) => (
            <PricingCard key={pkg.id} pkg={pkg} index={index} />
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">All packages include</p>
          <div className="flex flex-wrap justify-center gap-3">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm hover:border-secondary/30 hover:shadow-md transition-all duration-200 cursor-default"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                >
                  <Check className="w-3.5 h-3.5 text-secondary" />
                </motion.div>
                <span className="text-sm text-foreground">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tier system */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-8 bg-card rounded-3xl border border-border shadow-md overflow-hidden relative"
        >
          {/* Background shimmer */}
          <motion.div
            className="absolute inset-0 opacity-30 pointer-events-none"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--secondary)/0.1), transparent)',
              backgroundSize: '200% 100%',
            }}
          />

          <h3 className="text-xl font-semibold text-foreground mb-8 text-center relative">Tier System</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.06, y: -4 }}
                className={`p-4 rounded-2xl bg-gradient-to-b ${tier.color} border ${tier.border} text-center cursor-default transition-all duration-300 hover:shadow-lg col-span-${i === 4 ? '2' : '1'} md:col-span-1`}
              >
                <motion.div
                  className="text-3xl mb-2"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}
                >
                  {tier.emoji}
                </motion.div>
                <div className="font-semibold text-foreground text-sm">{tier.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{tier.range}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}