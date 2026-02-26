'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Users, Globe, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

function MagneticOrb() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 20 });
  const springY = useSpring(y, { stiffness: 60, damping: 20 });
  const tx = useTransform(springX, v => v * 0.04);
  const ty = useTransform(springY, v => v * 0.04);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX - window.innerWidth / 2);
      y.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div style={{ x: tx, y: ty }} className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/3 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/8 blur-[120px]" />
    </motion.div>
  );
}

function Particles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 12 + 8,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-secondary"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(p.id) * 20, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
            scale: [1, 1.4, 1],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function Typewriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !deleting) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex(i => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(() => setSubIndex(s => s + (deleting ? -1 : 1)), deleting ? 60 : 100);
    return () => clearTimeout(t);
  }, [subIndex, index, deleting, words]);

  return (
    <span className="text-secondary">
      {words[index].substring(0, subIndex)}
      <span className={`inline-block w-0.5 h-[0.85em] bg-secondary ml-0.5 align-middle transition-opacity ${blink ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
}

function AnimatedStat({ value, label, icon: Icon, color, delay }: { value: string; label: string; icon: any; color: string; delay: number }) {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const numericValue = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(numericValue / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= numericValue) { setCount(numericValue); clearInterval(timer); }
      else setCount(start);
    }, 40);
    return () => clearInterval(timer);
  }, [inView, numericValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="text-center group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3 }}
        className={`flex items-center justify-center w-14 h-14 rounded-2xl ${color} mx-auto mb-3 shadow-lg`}
      >
        <Icon className="w-7 h-7" />
      </motion.div>
      <div className="text-3xl font-bold text-foreground tabular-nums">{count}{suffix}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/8" />
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          backgroundImage: 'radial-gradient(ellipse at 20% 30%, hsl(var(--primary)/0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, hsl(var(--secondary)/0.07) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
        }}
      />
      <Particles />
      <MagneticOrb />
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 backdrop-blur-sm"
            >
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-medium">Safe & Faith-Centered Dating</span>
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Headline with typewriter */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-serif text-balance"
            >
              <span className="text-foreground">Find Love </span>
              <br className="hidden sm:block" />
              <Typewriter words={['Built on Faith', 'That Lasts', 'With Purpose', 'Rooted in Christ']} />
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Where Christian singles connect with purpose. Join a community that
              values faith, authenticity, and meaningful relationships.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-16"
            >
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="relative bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg rounded-xl overflow-hidden shadow-lg shadow-secondary/20">
                    <motion.span className="absolute inset-0 bg-white/10" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.4 }} />
                    <span className="relative flex items-center gap-2">
                      Join Free
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/#how-it-works">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 px-8 py-6 text-lg rounded-xl bg-transparent backdrop-blur-sm">
                    Learn More
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <AnimatedStat value="50K+" label="Active Members" icon={Users} color="bg-primary/10 text-primary" delay={0.5} />
              <AnimatedStat value="100%" label="Verified Profiles" icon={Shield} color="bg-secondary/10 text-secondary" delay={0.6} />
              <AnimatedStat value="30+" label="Countries" icon={Globe} color="bg-amber-500/10 text-amber-500" delay={0.7} />
            </div>
          </div>

          {/* Right: Floating image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, type: 'spring', stiffness: 80 }}
            className="hidden lg:block relative"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 rounded-3xl bg-secondary/20 blur-3xl scale-95"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <Image
                src="/images/img142.jpg"
                alt="Committed App"
                width={500}
                height={700}
                className="relative rounded-3xl shadow-2xl shadow-black/20 border border-white/10"
                priority
              />
              {/* Badge bottom-left */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 -left-8 bg-card/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">Verified & Safe</div>
                    <div className="text-xs text-muted-foreground">Faith-first dating</div>
                  </div>
                </div>
              </motion.div>
              {/* Badge top-right */}
              <motion.div
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -top-5 -right-8 bg-card/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-border"
              >
                <div className="flex items-center gap-2">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  </motion.div>
                  <div>
                    <div className="text-xs text-muted-foreground">New matches today</div>
                    <div className="font-bold text-foreground text-sm">+127 connections</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-1.5">
          <motion.div
            className="w-1 h-1.5 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}