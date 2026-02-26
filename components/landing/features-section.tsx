'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Cross, Shield, Globe, Diamond, MessageCircle, Calendar } from 'lucide-react';
import { useRef } from 'react';

const features = [
  { icon: Cross, title: 'Faith-Centered Community', description: 'Connect with singles who share your Christian values and beliefs. Build relationships on a strong spiritual foundation.', color: 'bg-primary/10 text-primary', glow: 'group-hover:shadow-primary/20' },
  { icon: Shield, title: 'Safe & Monitored', description: 'Our 3-week safety period ensures genuine connections. All messages are monitored to protect our community.', color: 'bg-secondary/10 text-secondary', glow: 'group-hover:shadow-secondary/20' },
  { icon: Globe, title: 'Global Network', description: 'Find your match anywhere in the world. Premium members can connect with faith-based singles across 30+ countries.', color: 'bg-primary/10 text-primary', glow: 'group-hover:shadow-primary/20' },
  { icon: Diamond, title: 'Points-Based Access', description: 'Unlock more features as you grow. Our tier system rewards committed members with expanded access.', color: 'bg-amber-500/10 text-amber-500', glow: 'group-hover:shadow-amber-500/20' },
  { icon: MessageCircle, title: 'Meaningful Conversations', description: 'Quality over quantity. Our messaging system encourages deep, thoughtful conversations that lead to real connections.', color: 'bg-secondary/10 text-secondary', glow: 'group-hover:shadow-secondary/20' },
  { icon: Calendar, title: 'Date Scheduling', description: 'After building trust, schedule real-life dates through our secure platform. Verified members get exclusive access.', color: 'bg-primary/10 text-primary', glow: 'group-hover:shadow-primary/20' },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative"
    >
      <div className={`relative p-8 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-2xl ${feature.glow} cursor-default`}>
        {/* Shimmer on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)',
          }}
        />
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.4 }}
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} mb-6 shadow-md`}
        >
          <feature.icon className="w-7 h-7" />
        </motion.div>

        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
        />
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        style={{
          backgroundImage: 'radial-gradient(ellipse at 0% 0%, hsl(var(--primary)/0.05) 0%, transparent 60%), radial-gradient(ellipse at 100% 100%, hsl(var(--secondary)/0.05) 0%, transparent 60%)',
          backgroundSize: '200% 200%',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            Everything you need
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-serif"
          >
            Why Choose{' '}
            <span className="relative">
              Committed?
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            We have designed every feature to help you find meaningful, faith-based relationships.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}