'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { UserPlus, MapPin, Heart, MessageCircle } from 'lucide-react';
import { useRef } from 'react';

const steps = [
  { number: '01', icon: UserPlus, title: 'Create Your Profile', description: 'Sign up with your basic info and verify your age. Share your faith journey, interests, and what you are looking for.', accent: 'from-primary to-primary/60' },
  { number: '02', icon: MapPin, title: 'Set Your Location', description: 'Allow location access to discover matches near you. Free members see local profiles, premium members go global.', accent: 'from-secondary to-secondary/60' },
  { number: '03', icon: Heart, title: 'Browse & Connect', description: 'Explore profiles that match your values. Follow users you are interested in and express your genuine interest.', accent: 'from-rose-500 to-rose-400' },
  { number: '04', icon: MessageCircle, title: 'Start Conversations', description: 'Upgrade to message your matches. After 21 days, schedule real-life dates through our secure platform.', accent: 'from-amber-500 to-amber-400' },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ['0%', '100%']);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-20 md:py-32 bg-background overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4"
          >
            Simple steps
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-serif"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Finding your faith-based partner is simple. Follow these four steps to begin your journey.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Animated vertical line (mobile) */}
          <div className="lg:hidden absolute left-8 top-0 bottom-0 w-0.5 bg-border overflow-hidden">
            <motion.div className="w-full bg-gradient-to-b from-primary via-secondary to-amber-500" style={{ height: lineHeight }} />
          </div>

          {/* Animated horizontal line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-border overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-secondary to-amber-500"
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: index * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative flex flex-col items-center text-center pl-16 lg:pl-0"
              >
                {/* Icon circle */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10 mb-6 group cursor-default"
                >
                  {/* Animated ring */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.accent} opacity-20`}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, delay: index * 0.4, repeat: Infinity }}
                  />
                  <div className="relative w-20 h-20 rounded-2xl bg-card border-2 border-border flex items-center justify-center shadow-lg">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, delay: index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <step.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>
                  {/* Number badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 + 0.4, type: 'spring' }}
                    className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br ${step.accent} text-white flex items-center justify-center text-xs font-bold shadow-lg`}
                  >
                    {step.number}
                  </motion.div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
                  className="text-xl font-semibold text-foreground mb-3"
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 + 0.4 }}
                  className="text-muted-foreground leading-relaxed text-sm"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}