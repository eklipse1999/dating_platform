'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Heart, Loader2, AlertCircle, CheckCircle, Church, ArrowRight, Shield, Sparkles, User, Lock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApp } from '@/lib/app-context';
import { isOver18 } from '@/lib/types';

// Animated floating orbs for right panel
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { size: 280, x: '5%',  y: '10%', delay: 0,   dur: 9  },
        { size: 180, x: '55%', y: '55%', delay: 1.2, dur: 11 },
        { size: 120, x: '25%', y: '70%', delay: 0.6, dur: 8  },
        { size: 90,  x: '75%', y: '10%', delay: 2,   dur: 10 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10 blur-2xl"
          style={{ width: o.size, height: o.size, left: o.x, top: o.y }}
          animate={{ y: [0, -28, 0], x: [0, 12, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Staggered field reveal
function AnimatedField({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

// Focused input underline
function FocusLine({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full origin-left"
        />
      )}
    </AnimatePresence>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useApp();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', gender: '' as 'male' | 'female' | '',
    dobDay: '', dobMonth: '', dobYear: '',
    churchName: '', churchBranch: '', ageConfirmed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isHuman, setIsHuman] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const update = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Full name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Please enter a valid email';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!formData.phone.trim()) e.phone = 'Phone number is required';
    if (!formData.gender) e.gender = 'Please select your gender';
    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) e.dob = 'Date of birth is required';
    else {
      const dob = new Date(parseInt(formData.dobYear), parseInt(formData.dobMonth) - 1, parseInt(formData.dobDay));
      if (!isOver18(dob)) e.dob = 'You must be 18 years or older to join';
    }
    if (!formData.ageConfirmed) e.ageConfirmed = 'You must confirm you are 18 or older';
    if (!isHuman) { setCaptchaError('Please verify that you are not a robot'); e.captcha = 'required'; }
    else setCaptchaError('');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fix the errors in the form'); return; }
    setIsLoading(true);
    try {
      const dob = new Date(parseInt(formData.dobYear), parseInt(formData.dobMonth) - 1, parseInt(formData.dobDay));
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

      await signup!({
        name: formData.name, email: formData.email, password: formData.password,
        phone: formData.phone, gender: formData.gender as 'male' | 'female',
        dob, churchName: formData.churchName, churchBranch: formData.churchBranch,
      });

      setIsSuccess(true);
      toast.success('Account created! Welcome to Committed 🎉');
      setTimeout(() => router.push('/dashboard'), 1400);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Something went wrong.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 82 }, (_, i) => currentYear - 18 - i);

  const selectClass = `h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-colors w-full`;

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left: Form ── */}
      <div className="flex-1 flex items-start justify-center p-8 py-12 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-secondary/3 pointer-events-none" />

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6"
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1, repeat: 3 }}>
                  <Heart className="w-12 h-12 text-secondary fill-secondary" />
                </motion.div>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-2xl font-bold text-foreground font-serif mb-2">
                You're in!
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-muted-foreground">
                Taking you to your dashboard…
              </motion.p>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
                className="mt-6 h-1 w-48 bg-secondary rounded-full origin-left"
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="relative z-10 w-full max-w-md"
            >
              {/* Logo */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
                <Link href="/" className="inline-flex items-center gap-2 mb-7 group">
                  <motion.div whileHover={{ scale: 1.1, rotate: 10 }}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-secondary-foreground shadow-md shadow-secondary/20"
                  >
                    <Heart className="w-5 h-5" />
                  </motion.div>
                  <span className="text-xl font-bold text-foreground font-serif">Committed</span>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h1 className="text-3xl font-bold text-foreground mb-1 font-serif">Create Account</h1>
                <p className="text-muted-foreground mb-7">Join our faith-based community today</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Personal Info section ── */}
                <AnimatedField delay={0.14}>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    <User className="w-3.5 h-3.5" />
                    Personal Info
                  </div>
                </AnimatedField>

                {/* Name */}
                <AnimatedField delay={0.18}>
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative mt-1">
                    <Input id="name" type="text" value={formData.name} onChange={update('name')}
                      onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                      placeholder="Enter your full name"
                      className={`transition-all duration-200 ${errors.name ? 'border-destructive' : focusedField === 'name' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                    />
                    <FocusLine show={focusedField === 'name'} />
                  </div>
                  <AnimatePresence>{errors.name && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">{errors.name}</motion.p>}</AnimatePresence>
                </AnimatedField>

                {/* Email */}
                <AnimatedField delay={0.22}>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative mt-1">
                    <Input id="email" type="email" value={formData.email} onChange={update('email')}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                      placeholder="Enter your email"
                      className={`transition-all duration-200 ${errors.email ? 'border-destructive' : focusedField === 'email' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                    />
                    <FocusLine show={focusedField === 'email'} />
                  </div>
                  <AnimatePresence>{errors.email && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">{errors.email}</motion.p>}</AnimatePresence>
                </AnimatedField>

                {/* Password */}
                <AnimatedField delay={0.26}>
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative mt-1">
                    <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={update('password')}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                      placeholder="Create a password (min 8 chars)"
                      className={`pr-10 transition-all duration-200 ${errors.password ? 'border-destructive' : focusedField === 'password' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                    />
                    <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <AnimatePresence mode="wait">
                        {showPassword
                          ? <motion.div key="off" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><EyeOff className="w-4 h-4" /></motion.div>
                          : <motion.div key="on" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Eye className="w-4 h-4" /></motion.div>
                        }
                      </AnimatePresence>
                    </motion.button>
                    <FocusLine show={focusedField === 'password'} />
                  </div>
                  <AnimatePresence>{errors.password && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">{errors.password}</motion.p>}</AnimatePresence>
                </AnimatedField>

                {/* Confirm Password */}
                <AnimatedField delay={0.30}>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={update('confirmPassword')}
                      onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                      placeholder="Confirm your password"
                      className={`transition-all duration-200 ${errors.confirmPassword ? 'border-destructive' : focusedField === 'confirmPassword' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                    />
                    <AnimatePresence>
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-4 h-4 text-secondary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <FocusLine show={focusedField === 'confirmPassword'} />
                  </div>
                  <AnimatePresence>{errors.confirmPassword && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">{errors.confirmPassword}</motion.p>}</AnimatePresence>
                </AnimatedField>

                {/* ── Contact & Identity section ── */}
                <AnimatedField delay={0.34}>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2 mb-3 border-t border-border">
                    <Phone className="w-3.5 h-3.5" />
                    Contact & Identity
                  </div>
                </AnimatedField>

                {/* Phone */}
                <AnimatedField delay={0.37}>
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative mt-1">
                    <Input id="phone" type="tel" value={formData.phone} onChange={update('phone')}
                      onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                      placeholder="+1 234 567 8900"
                      className={`transition-all duration-200 ${errors.phone ? 'border-destructive' : focusedField === 'phone' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                    />
                    <FocusLine show={focusedField === 'phone'} />
                  </div>
                  <AnimatePresence>{errors.phone && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">{errors.phone}</motion.p>}</AnimatePresence>
                </AnimatedField>

                {/* Gender */}
                <AnimatedField delay={0.40}>
                  <Label className="text-sm font-medium">Gender</Label>
                  <div className="flex gap-3 mt-2">
                    {(['male', 'female'] as const).map(g => (
                      <motion.label
                        key={g}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 capitalize text-sm font-medium ${
                          formData.gender === g
                            ? 'border-secondary bg-secondary/10 text-secondary'
                            : 'border-border hover:border-secondary/40 text-muted-foreground'
                        }`}
                      >
                        <input type="radio" name="gender" value={g} checked={formData.gender === g}
                          onChange={() => setFormData(p => ({ ...p, gender: g }))} className="sr-only" />
                        {g === 'male' ? '👨' : '👩'} {g.charAt(0).toUpperCase() + g.slice(1)}
                      </motion.label>
                    ))}
                  </div>
                  <AnimatePresence>{errors.gender && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">{errors.gender}</motion.p>}</AnimatePresence>
                </AnimatedField>

                {/* Date of Birth */}
                <AnimatedField delay={0.43}>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <select value={formData.dobDay} onChange={update('dobDay')} className={selectClass}>
                      <option value="">Day</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={formData.dobMonth} onChange={update('dobMonth')} className={selectClass}>
                      <option value="">Month</option>
                      {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={formData.dobYear} onChange={update('dobYear')} className={selectClass}>
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <AnimatePresence>
                    {errors.dob && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 mt-1.5 text-destructive">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <p className="text-sm">{errors.dob}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AnimatedField>

                {/* ── Church Info ── */}
                <AnimatedField delay={0.47}>
                  <motion.div
                    className="pt-3 border-t border-border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.47 }}
                  >
                    <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                      <Church className="w-4 h-4 text-primary" />
                      Church Information <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Input value={formData.churchName} onChange={update('churchName')}
                          onFocus={() => setFocusedField('church')} onBlur={() => setFocusedField(null)}
                          placeholder="Church Name"
                          className={`transition-all duration-200 ${focusedField === 'church' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                        />
                      </div>
                      <div className="relative">
                        <Input value={formData.churchBranch} onChange={update('churchBranch')}
                          onFocus={() => setFocusedField('branch')} onBlur={() => setFocusedField(null)}
                          placeholder="Branch / Location"
                          className={`transition-all duration-200 ${focusedField === 'branch' ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Helps connect you with members from your faith community.</p>
                  </motion.div>
                </AnimatedField>

                {/* ── Agreement & Captcha ── */}
                <AnimatedField delay={0.50}>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2 mb-3 border-t border-border">
                    <Lock className="w-3.5 h-3.5" />
                    Confirmation
                  </div>
                </AnimatedField>

                {/* Age confirm */}
                <AnimatedField delay={0.53}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border transition-colors hover:bg-muted/50"
                  >
                    <Checkbox id="ageConfirmed" checked={formData.ageConfirmed}
                      onCheckedChange={(c) => setFormData(p => ({ ...p, ageConfirmed: c as boolean }))}
                    />
                    <label htmlFor="ageConfirmed" className="text-sm leading-relaxed cursor-pointer text-muted-foreground">
                      I confirm I am 18+ and agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </label>
                  </motion.div>
                  <AnimatePresence>{errors.ageConfirmed && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">{errors.ageConfirmed}</motion.p>}</AnimatePresence>
                </AnimatedField>

                {/* Captcha */}
                <AnimatedField delay={0.56}>
                  <motion.div
                    whileHover={{ borderColor: 'hsl(var(--secondary)/0.5)' }}
                    className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl border border-border transition-colors"
                  >
                    <Checkbox id="captcha" checked={isHuman}
                      onCheckedChange={(c) => { setIsHuman(c as boolean); if (c) setCaptchaError(''); }}
                    />
                    <label htmlFor="captcha" className="text-sm cursor-pointer">
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
                  <AnimatePresence>{captchaError && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-destructive mt-1">{captchaError}</motion.p>}</AnimatePresence>
                </AnimatedField>

                {/* Submit */}
                <AnimatedField delay={0.60}>
                  <motion.div whileHover={{ scale: isLoading ? 1 : 1.01 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full relative bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-base font-medium rounded-xl overflow-hidden shadow-lg shadow-secondary/20"
                      disabled={isLoading || !isHuman}
                    >
                      <motion.span className="absolute inset-0 bg-white/10" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.4 }} />
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                        ) : (
                          <>
                            Create Account
                            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                              <ArrowRight className="w-4 h-4" />
                            </motion.span>
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </AnimatedField>

                <AnimatedField delay={0.64}>
                  <p className="text-center text-sm text-muted-foreground pb-4">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">Log In</Link>
                  </p>
                </AnimatedField>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right decorative panel ── */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary via-primary/90 to-accent items-center justify-center p-12 overflow-hidden">
        <FloatingOrbs />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 text-center text-primary-foreground max-w-md">
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 150 }}
            className="relative w-28 h-28 mx-auto mb-10"
          >
            <motion.div className="absolute inset-0 rounded-full bg-white/20" animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }} />
            <div className="absolute inset-0 rounded-full bg-white/10 flex items-center justify-center">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <CheckCircle className="w-14 h-14" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl font-bold mb-5 font-serif"
          >
            Join Our Community
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-primary-foreground/80 leading-relaxed text-lg mb-10"
          >
            Create your profile and start connecting with faith-based singles who share your values and beliefs.
          </motion.p>

          {/* Floating feature pills */}
          {[
            { icon: '🛡️', text: 'Safe & Verified', delay: 0.6 },
            { icon: '🌍', text: '30+ Countries', delay: 0.72 },
            { icon: '💌', text: 'Meaningful Connections', delay: 0.84 },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: item.delay }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mr-2 mb-2"
            >
              <span>{item.icon}</span>
              {item.text}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}