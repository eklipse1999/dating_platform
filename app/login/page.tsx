'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Eye, EyeOff, Heart, Loader2, MapPin, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/app-context';
import { LocationPermissionModal } from '@/components/location-permission-modal';
import { Checkbox } from '@/components/ui/checkbox';

// Floating orbs for the decorative panel
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { size: 300, x: '10%', y: '20%', delay: 0, duration: 8 },
        { size: 200, x: '60%', y: '60%', delay: 1.5, duration: 10 },
        { size: 150, x: '30%', y: '75%', delay: 0.8, duration: 7 },
        { size: 100, x: '80%', y: '15%', delay: 2, duration: 9 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10 blur-2xl"
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: orb.duration, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Animated background particles
function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 10 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.35 + 0.1,
    }))
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/60"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -50, 0], opacity: [p.opacity, p.opacity * 2.5, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Animated form field wrapper
function AnimatedField({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!isHuman) { setCaptchaError('Please verify that you are not a robot'); newErrors.captcha = 'required'; }
    else setCaptchaError('');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      setIsSuccess(true);
      toast.success('Welcome back! 👋');
      
      // If admin, redirect to admin page immediately
      if (result.type?.toUpperCase() === 'ADMIN') {
        router.push('/admin');
        return;
      }
      
      setTimeout(() => {
        setShowLocationModal(true);
      }, 600);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationComplete = () => {
    setShowLocationModal(false);
    router.push('/dashboard');
  };

  return (
    <>
      <div className="min-h-screen flex overflow-hidden">

        {/* ── Left decorative panel ── */}
        <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-secondary via-secondary/90 to-accent items-center justify-center p-12 overflow-hidden">
          <FloatingOrbs />
          <Particles />

          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          <div className="relative z-10 text-center text-secondary-foreground max-w-md">
            {/* Animated logo mark */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 150 }}
              className="relative w-28 h-28 mx-auto mb-10"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="absolute inset-0 rounded-full bg-white/10 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MapPin className="w-14 h-14" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl font-bold mb-5 font-serif"
            >
              Welcome Back
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-secondary-foreground/80 leading-relaxed text-lg"
            >
              Continue your journey to find meaningful, faith-based connections. Your matches are waiting!
            </motion.p>

            {/* Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 grid grid-cols-2 gap-4"
            >
              {[
                { icon: '💑', label: 'New matches', value: '+127 today' },
                { icon: '🛡️', label: 'Verified profiles', value: '100%' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3 + i, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-left"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                  <div className="font-bold text-white">{stat.value}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background relative overflow-hidden">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-secondary/3 pointer-events-none" />

          <AnimatePresence mode="wait">
            {isSuccess ? (
              // Success state
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: 2 }}>
                    <Heart className="w-10 h-10 text-secondary fill-secondary" />
                  </motion.div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-foreground"
                >
                  You're in!
                </motion.p>
              </motion.div>
            ) : (
              // Form state
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
              >
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-secondary-foreground shadow-md shadow-secondary/20"
                    >
                      <Heart className="w-5 h-5" />
                    </motion.div>
                    <span className="text-xl font-bold text-foreground font-serif">Committed</span>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h1 className="text-3xl font-bold text-foreground mb-1 font-serif">Log In</h1>
                  <p className="text-muted-foreground mb-8">Welcome back to our community</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <AnimatedField delay={0.15}>
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative mt-1">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your email"
                        className={`transition-all duration-200 ${errors.email ? 'border-destructive' : focusedField === 'email' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                      />
                      <AnimatePresence>
                        {focusedField === 'email' && (
                          <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0, scaleX: 0 }}
                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full origin-left"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </AnimatedField>

                  {/* Password */}
                  <AnimatedField delay={0.22}>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your password"
                        className={`pr-10 transition-all duration-200 ${errors.password ? 'border-destructive' : focusedField === 'password' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <AnimatePresence mode="wait">
                          {showPassword
                            ? <motion.div key="off" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><EyeOff className="w-4 h-4" /></motion.div>
                            : <motion.div key="on" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Eye className="w-4 h-4" /></motion.div>
                          }
                        </AnimatePresence>
                      </motion.button>
                      <AnimatePresence>
                        {focusedField === 'password' && (
                          <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0, scaleX: 0 }} className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full origin-left" />
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </AnimatedField>

                  {/* CAPTCHA */}
                  <AnimatedField delay={0.30}>
                    <motion.div
                      whileHover={{ borderColor: 'hsl(var(--secondary)/0.5)' }}
                      className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl border border-border transition-colors"
                    >
                      <Checkbox
                        id="captcha"
                        checked={isHuman}
                        onCheckedChange={(checked: boolean) => { setIsHuman(checked); if (checked) setCaptchaError(''); }}
                      />
                      <label htmlFor="captcha" className="text-sm leading-relaxed cursor-pointer">
                        <span className="font-medium">I'm not a robot</span>
                        <div className="flex items-center gap-2 mt-1">
                          <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-5 h-5" />
                          <span className="text-xs text-muted-foreground">reCAPTCHA verification</span>
                        </div>
                      </label>
                      <AnimatePresence>
                        {isHuman && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ml-auto mt-0.5">
                            <Shield className="w-4 h-4 text-secondary" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <AnimatePresence>
                      {captchaError && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">
                          {captchaError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </AnimatedField>

                  {/* Submit */}
                  <AnimatedField delay={0.38}>
                    <motion.div whileHover={{ scale: isLoading ? 1 : 1.01 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full relative bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-base font-medium rounded-xl overflow-hidden shadow-lg shadow-secondary/20"
                        disabled={isLoading || !isHuman}
                      >
                        <motion.span className="absolute inset-0 bg-white/10" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.4 }} />
                        <span className="relative flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            <>
                              Log In
                              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                <ArrowRight className="w-4 h-4" />
                              </motion.span>
                            </>
                          )}
                        </span>
                      </Button>
                    </motion.div>
                  </AnimatedField>

                  <AnimatedField delay={0.44}>
                    <p className="text-center text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <Link href="/signup" className="text-primary hover:underline font-medium">
                        Sign Up
                      </Link>
                    </p>
                  </AnimatedField>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <LocationPermissionModal isOpen={showLocationModal} onComplete={handleLocationComplete} />
    </>
  );
}