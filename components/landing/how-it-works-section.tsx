'use client';

import { motion } from 'framer-motion';
import { UserPlus, MapPin, Heart, MessageCircle } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up with your basic info and verify your age. Share your faith journey, interests, and what you are looking for.',
  },
  {
    number: '02',
    icon: MapPin,
    title: 'Set Your Location',
    description: 'Allow location access to discover matches near you. Free members see local profiles, premium members go global.',
  },
  {
    number: '03',
    icon: Heart,
    title: 'Browse & Connect',
    description: 'Explore profiles that match your values. Follow users you are interested in and express your genuine interest.',
  },
  {
    number: '04',
    icon: MessageCircle,
    title: 'Start Conversations',
    description: 'Upgrade to message your matches. After 21 days, schedule real-life dates through our secure platform.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background">
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Finding your faith-based partner is simple. Follow these four steps to begin your journey.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Number badge */}
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-card border-2 border-border flex items-center justify-center shadow-lg">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-muted-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
