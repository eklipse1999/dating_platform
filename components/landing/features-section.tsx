'use client';

import { motion } from 'framer-motion';
import { Cross, Shield, Globe, Diamond, MessageCircle, Calendar } from 'lucide-react';

const features = [
  {
    icon: Cross,
    title: 'Faith-Centered Community',
    description: 'Connect with singles who share your Christian values and beliefs. Build relationships on a strong spiritual foundation.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Shield,
    title: 'Safe & Monitored',
    description: 'Our 3-week safety period ensures genuine connections. All messages are monitored to protect our community.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Find your match anywhere in the world. Premium members can connect with faith-based singles across 30+ countries.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Diamond,
    title: 'Points-Based Access',
    description: 'Unlock more features as you grow. Our tier system rewards committed members with expanded access.',
    color: 'bg-gold/20 text-gold',
  },
  {
    icon: MessageCircle,
    title: 'Meaningful Conversations',
    description: 'Quality over quantity. Our messaging system encourages deep, thoughtful conversations that lead to real connections.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Calendar,
    title: 'Date Scheduling',
    description: 'After building trust, schedule real-life dates through our secure platform. Verified members get exclusive access.',
    color: 'bg-primary/10 text-primary',
  },
];

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

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
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
            Why Choose Committed?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We have designed every feature to help you find meaningful, faith-based relationships.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-8 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} mb-6`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-muted-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
