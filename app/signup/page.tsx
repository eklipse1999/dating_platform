'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Heart, Loader2, AlertCircle, CheckCircle,
  Church, ArrowRight, Shield, Sparkles, User, Lock, Phone, AtSign, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApp } from '@/lib/app-context';
import { isOver18 } from '@/lib/types';

/* ─── Floating orbs (right panel) ─────────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { size: 340, x: '-8%',  y: '5%',  delay: 0,   dur: 11 },
        { size: 220, x: '50%',  y: '45%', delay: 1.4, dur: 13 },
        { size: 160, x: '20%',  y: '68%', delay: 0.7, dur: 9  },
        { size: 110, x: '72%',  y: '8%',  delay: 2.2, dur: 12 },
        { size: 80,  x: '85%',  y: '75%', delay: 1,   dur: 8  },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.size, height: o.size, left: o.x, top: o.y,
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)',
            filter: 'blur(32px)',
          }}
          animate={{ y: [0, -32, 0], x: [0, 14, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Staggered field entry ────────────────────────────────────────────── */
function Field({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section divider ──────────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, label, delay }: { icon: React.ElementType; label: string; delay: number }) {
  return (
    <Field delay={delay}>
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/60">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        <div className="flex-1 h-px bg-border/60" />
      </div>
    </Field>
  );
}

/* ─── Styled input wrapper ─────────────────────────────────────────────── */
function InputRow({
  id, label, error, focused, delay, children,
}: {
  id: string; label: string; error?: string; focused?: boolean; delay: number; children: React.ReactNode;
}) {
  return (
    <Field delay={delay}>
      <div className="space-y-1.5">
        <Label
          htmlFor={id}
          className={`text-xs font-semibold tracking-wide uppercase transition-colors duration-200 ${focused ? 'text-foreground' : 'text-muted-foreground/70'}`}
        >
          {label}
        </Label>
        <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
          error
            ? 'ring-2 ring-destructive/40 shadow-[0_0_16px_-4px_rgba(239,68,68,0.3)]'
            : focused
            ? 'ring-2 ring-primary/30 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]'
            : 'ring-1 ring-border hover:ring-border/80'
        }`}>
          {children}
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1.5 text-destructive"
            >
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <p className="text-[11px]">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Field>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function SignupPage() {
  const router = useRouter();
  const { signup } = useApp();

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', user_name: '',
    email: '', password: '', confirmPassword: '',
    phone: '', gender: '' as 'male' | 'female' | '',
    dobDay: '', dobMonth: '', dobYear: '',
    churchName: '', churchBranch: '',
    ageConfirmed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [isSuccess, setIsSuccess]   = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [isHuman, setIsHuman]       = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [focused, setFocused]       = useState<string | null>(null);

  const set = (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormData(p => ({ ...p, [key]: e.target.value }));

  const fo = (k: string) => () => setFocused(k);
  const bl = () => setFocused(null);

  /* validation */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.first_name.trim()) e.first_name = 'First name is required';
    if (!formData.last_name.trim())  e.last_name  = 'Last name is required';
    if (!formData.user_name.trim())  e.user_name  = 'Username is required';
    else if (formData.user_name.length < 3) e.user_name = 'At least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.user_name)) e.user_name = 'Letters, numbers & underscores only';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email address';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 8) e.password = 'Minimum 8 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!formData.phone.trim()) e.phone = 'Phone number is required';
    if (!formData.gender) e.gender = 'Please select your gender';
    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) e.dob = 'Date of birth is required';
    else {
      const dob = new Date(+formData.dobYear, +formData.dobMonth - 1, +formData.dobDay);
      if (!isOver18(dob)) e.dob = 'You must be 18 or older to join';
    }
    if (!formData.ageConfirmed) e.ageConfirmed = 'Please confirm your age';
    if (!isHuman) { setCaptchaError('Please verify you are not a robot'); e.captcha = 'required'; }
    else setCaptchaError('');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors above'); return; }
    setIsLoading(true);
    try {
      const dob = new Date(+formData.dobYear, +formData.dobMonth - 1, +formData.dobDay);
      await signup!({
        user_name: formData.user_name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender as 'male' | 'female',
        dob,
        churchName: formData.churchName,
        churchBranch: formData.churchBranch,
      });
      setIsSuccess(true);
      toast.success('Account created! Welcome to Committed 🎉');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const days   = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years  = Array.from({ length: 82 }, (_, i) => new Date().getFullYear() - 18 - i);

  /* Password strength */
  const pwStrength = !formData.password ? 0
    : formData.password.length < 8  ? 1
    : formData.password.length < 12 ? 2
    : formData.password.length < 16 ? 3 : 4;
  const pwColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  /* ─── Success ─── */
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center px-6">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Heart className="w-10 h-10 text-primary fill-primary" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-3xl font-bold text-foreground font-serif mb-2">Welcome Home</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-muted-foreground text-sm">Taking you to your dashboard…</motion.p>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.4, delay: 0.5 }}
            className="mt-6 h-0.5 w-40 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto origin-left" />
        </motion.div>
      </div>
    );
  }

  const inputBase = 'w-full bg-background/60 px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/40';
  const selectBase = 'w-full bg-background/60 px-4 py-3 text-sm focus:outline-none appearance-none cursor-pointer';

  return (
    <div className="min-h-screen flex">

      {/* ════════ LEFT — FORM ════════ */}
      <div className="flex-1 flex flex-col bg-background relative overflow-hidden">

        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '28px 28px' }} />

        {/* Soft top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative flex-1 flex items-start justify-center p-8 py-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >

            {/* Logo */}
            <Field delay={0}>
              <Link href="/" className="inline-flex items-center gap-3 mb-9 group">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                  <div className="absolute inset-0 rounded-xl border border-primary/20 flex items-center justify-center">
                    <Heart className="w-4.5 h-4.5 text-primary" />
                  </div>
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground font-serif block leading-none">Committed</span>
                  <span className="text-[10px] text-muted-foreground/50 tracking-widest uppercase">Faith-Based Dating</span>
                </div>
              </Link>
            </Field>

            {/* Heading */}
            <Field delay={0.05}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground font-serif leading-tight mb-1.5">
                  Create your account
                </h1>
                <p className="text-muted-foreground text-sm">
                  Join thousands of believers finding meaningful connections.
                </p>
              </div>
            </Field>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── PERSONAL INFO ── */}
              <SectionHeader icon={User} label="Personal Info" delay={0.08} />

              {/* First + Last name */}
              <Field delay={0.11}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name" className={`text-xs font-semibold tracking-wide uppercase transition-colors ${focused === 'first_name' ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                      First Name
                    </Label>
                    <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                      errors.first_name ? 'ring-2 ring-destructive/40' : focused === 'first_name' ? 'ring-2 ring-primary/30 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]' : 'ring-1 ring-border hover:ring-border/80'
                    }`}>
                      <input id="first_name" type="text" value={formData.first_name} onChange={set('first_name')}
                        onFocus={fo('first_name')} onBlur={bl} placeholder="Grace"
                        className={inputBase} />
                    </div>
                    <AnimatePresence>
                      {errors.first_name && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="text-[11px] text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.first_name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name" className={`text-xs font-semibold tracking-wide uppercase transition-colors ${focused === 'last_name' ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                      Last Name
                    </Label>
                    <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                      errors.last_name ? 'ring-2 ring-destructive/40' : focused === 'last_name' ? 'ring-2 ring-primary/30 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]' : 'ring-1 ring-border hover:ring-border/80'
                    }`}>
                      <input id="last_name" type="text" value={formData.last_name} onChange={set('last_name')}
                        onFocus={fo('last_name')} onBlur={bl} placeholder="Walker"
                        className={inputBase} />
                    </div>
                    <AnimatePresence>
                      {errors.last_name && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="text-[11px] text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.last_name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Field>

              {/* Username */}
              <InputRow id="user_name" label="Username" error={errors.user_name} focused={focused === 'user_name'} delay={0.14}>
                <div className="flex items-center">
                  <AtSign className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${focused === 'user_name' ? 'text-primary' : 'text-muted-foreground/30'}`} />
                  <input id="user_name" type="text" value={formData.user_name} onChange={set('user_name')}
                    onFocus={fo('user_name')} onBlur={bl} placeholder="grace_walker"
                    className={`${inputBase} pl-10`} />
                  <AnimatePresence>
                    {formData.user_name.length >= 3 && !errors.user_name && /^[a-zA-Z0-9_]+$/.test(formData.user_name) && (
                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        className="absolute right-3.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </InputRow>

              {/* ── ACCOUNT SECURITY ── */}
              <SectionHeader icon={Lock} label="Account Security" delay={0.17} />

              {/* Email */}
              <InputRow id="email" label="Email" error={errors.email} focused={focused === 'email'} delay={0.20}>
                <div className="flex items-center">
                  <Mail className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${focused === 'email' ? 'text-primary' : 'text-muted-foreground/30'}`} />
                  <input id="email" type="email" value={formData.email} onChange={set('email')}
                    onFocus={fo('email')} onBlur={bl} placeholder="grace@example.com"
                    className={`${inputBase} pl-10`} />
                </div>
              </InputRow>

              {/* Password */}
              <InputRow id="password" label="Password" error={errors.password} focused={focused === 'password'} delay={0.23}>
                <div className="flex items-center">
                  <Lock className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${focused === 'password' ? 'text-primary' : 'text-muted-foreground/30'}`} />
                  <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                    onChange={set('password')} onFocus={fo('password')} onBlur={bl}
                    placeholder="Min. 8 characters"
                    className={`${inputBase} pl-10 pr-11`} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    <AnimatePresence mode="wait">
                      {showPassword
                        ? <motion.div key="off" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><EyeOff className="w-4 h-4" /></motion.div>
                        : <motion.div key="on"  initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Eye className="w-4 h-4" /></motion.div>
                      }
                    </AnimatePresence>
                  </button>
                </div>
              </InputRow>

              {/* Password strength bar */}
              <AnimatePresence>
                {formData.password.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-0.5">
                    <div className="flex gap-1 flex-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= pwStrength ? pwColors[pwStrength] : 'bg-border'}`} />
                      ))}
                    </div>
                    <span className={`text-[11px] font-medium transition-colors ${pwStrength <= 1 ? 'text-red-400' : pwStrength === 2 ? 'text-orange-400' : pwStrength === 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {pwLabels[pwStrength]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm Password */}
              <InputRow id="confirmPassword" label="Confirm Password" error={errors.confirmPassword} focused={focused === 'confirmPassword'} delay={0.26}>
                <div className="flex items-center">
                  <Lock className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${focused === 'confirmPassword' ? 'text-primary' : 'text-muted-foreground/30'}`} />
                  <input id="confirmPassword" type="password" value={formData.confirmPassword}
                    onChange={set('confirmPassword')} onFocus={fo('confirmPassword')} onBlur={bl}
                    placeholder="Repeat your password"
                    className={`${inputBase} pl-10 pr-11`} />
                  <AnimatePresence>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-3.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </InputRow>

              {/* ── CONTACT & IDENTITY ── */}
              <SectionHeader icon={Phone} label="Contact & Identity" delay={0.29} />

              {/* Phone */}
              <InputRow id="phone" label="Phone Number" error={errors.phone} focused={focused === 'phone'} delay={0.32}>
                <div className="flex items-center">
                  <Phone className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${focused === 'phone' ? 'text-primary' : 'text-muted-foreground/30'}`} />
                  <input id="phone" type="tel" value={formData.phone} onChange={set('phone')}
                    onFocus={fo('phone')} onBlur={bl} placeholder="+1 234 567 8900"
                    className={`${inputBase} pl-10`} />
                </div>
              </InputRow>

              {/* Gender */}
              <Field delay={0.35}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground/70">Gender</Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['male', 'female'] as const).map(g => (
                      <motion.button
                        key={g} type="button"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setFormData(p => ({ ...p, gender: g }))}
                        className={`relative py-3 rounded-xl border text-sm font-semibold transition-all duration-300 overflow-hidden ${
                          formData.gender === g
                            ? 'border-primary/50 text-primary bg-primary/8 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.4)]'
                            : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground bg-background/60'
                        }`}
                      >
                        {formData.gender === g && (
                          <motion.div layoutId="genderPill" className="absolute inset-0 bg-primary/6" />
                        )}
                        <span className="relative">{g === 'male' ? '♂  Male' : '♀  Female'}</span>
                      </motion.button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {errors.gender && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.gender}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              {/* Date of Birth */}
              <Field delay={0.38}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground/70">Date of Birth</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'dobDay'   as const, ph: 'Day',   opts: days.map(d => ({ v: String(d), l: String(d) })) },
                      { key: 'dobMonth' as const, ph: 'Month', opts: months.map((m, i) => ({ v: String(i + 1), l: m })) },
                      { key: 'dobYear'  as const, ph: 'Year',  opts: years.map(y => ({ v: String(y), l: String(y) })) },
                    ].map(({ key, ph, opts }) => (
                      <div key={key} className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                        errors.dob ? 'ring-2 ring-destructive/40' : focused === key ? 'ring-2 ring-primary/30 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]' : 'ring-1 ring-border hover:ring-border/80'
                      }`}>
                        <select value={formData[key]} onChange={set(key)} onFocus={fo(key)} onBlur={bl}
                          className={selectBase} style={{ colorScheme: 'light dark' }}>
                          <option value="">{ph}</option>
                          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <AnimatePresence>
                    {errors.dob && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.dob}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              {/* ── CHURCH INFO ── */}
              <SectionHeader icon={Church} label="Church Info · Optional" delay={0.41} />

              <Field delay={0.44}>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`relative rounded-lg overflow-hidden transition-all duration-300 ${focused === 'church' ? 'ring-2 ring-primary/30' : 'ring-1 ring-border/60'}`}>
                      <input value={formData.churchName} onChange={set('churchName')}
                        onFocus={fo('church')} onBlur={bl} placeholder="Church name"
                        className={inputBase} />
                    </div>
                    <div className={`relative rounded-lg overflow-hidden transition-all duration-300 ${focused === 'branch' ? 'ring-2 ring-primary/30' : 'ring-1 ring-border/60'}`}>
                      <input value={formData.churchBranch} onChange={set('churchBranch')}
                        onFocus={fo('branch')} onBlur={bl} placeholder="Branch / location"
                        className={inputBase} />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                    Helps us connect you with members from your local faith community.
                  </p>
                </div>
              </Field>

              {/* ── CONFIRMATION ── */}
              <SectionHeader icon={Lock} label="Confirmation" delay={0.47} />

              {/* Age confirm */}
              <Field delay={0.50}>
                <motion.label
                  htmlFor="ageConfirmed"
                  whileHover={{ scale: 1.005 }}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                    formData.ageConfirmed ? 'border-primary/30 bg-primary/5' : errors.ageConfirmed ? 'border-destructive/40 bg-destructive/5' : 'border-border hover:border-primary/20'
                  }`}
                >
                  <Checkbox id="ageConfirmed" checked={formData.ageConfirmed}
                    onCheckedChange={c => setFormData(p => ({ ...p, ageConfirmed: c as boolean }))}
                    className="mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    I confirm I am 18+ and agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>{' '}and{' '}
                    <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                  </span>
                </motion.label>
                <AnimatePresence>
                  {errors.ageConfirmed && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-destructive flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3 h-3" />{errors.ageConfirmed}
                    </motion.p>
                  )}
                </AnimatePresence>
              </Field>

              {/* Captcha */}
              <Field delay={0.53}>
                <motion.label
                  htmlFor="captcha"
                  whileHover={{ scale: 1.005 }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                    isHuman ? 'border-emerald-500/30 bg-emerald-500/5' : captchaError ? 'border-destructive/40 bg-destructive/5' : 'border-border hover:border-primary/20 bg-muted/20'
                  }`}
                >
                  <Checkbox id="captcha" checked={isHuman}
                    onCheckedChange={c => { setIsHuman(c as boolean); if (c) setCaptchaError(''); }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">I'm not a robot</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">reCAPTCHA verification</p>
                  </div>
                  <AnimatePresence>
                    {isHuman ? (
                      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                        <Shield className="w-5 h-5 text-emerald-500" />
                      </motion.div>
                    ) : (
                      <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="" className="w-7 h-7 opacity-30" />
                    )}
                  </AnimatePresence>
                </motion.label>
                <AnimatePresence>
                  {captchaError && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-destructive flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3 h-3" />{captchaError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </Field>

              {/* ── SUBMIT ── */}
              <Field delay={0.56}>
                <motion.div whileHover={{ scale: isLoading ? 1 : 1.01 }} whileTap={{ scale: isLoading ? 1 : 0.98 }} className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full h-12 rounded-xl font-semibold text-sm overflow-hidden bg-primary text-primary-foreground disabled:opacity-60 transition-opacity"
                  >
                    {/* Shimmer */}
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: isLoading ? '-100%' : ['- 100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</>
                      ) : (
                        <>Create Account <ArrowRight className="w-4 h-4" /></>
                      )}
                    </span>
                  </button>
                </motion.div>
              </Field>

              <Field delay={0.59}>
                <p className="text-center text-sm text-muted-foreground pb-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
                </p>
              </Field>

            </form>
          </motion.div>
        </div>
      </div>

      {/* ════════ RIGHT — PANEL ════════ */}
      <div className="hidden lg:flex w-[45%] relative bg-gradient-to-br from-primary via-primary to-primary/80 items-center justify-center p-14 overflow-hidden">
        <FloatingOrbs />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />

        {/* Inner vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.25)_100%)]" />

        <div className="relative z-10 text-center text-primary-foreground max-w-sm">

          {/* Animated icon cluster */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, type: 'spring', stiffness: 130 }}
            className="relative w-32 h-32 mx-auto mb-12"
          >
            {/* Pulsing rings */}
            {[1, 1.4, 1.8].map((scale, i) => (
              <motion.div key={i}
                className="absolute inset-0 rounded-full border border-white/20"
                animate={{ scale: [scale, scale * 1.08, scale], opacity: [0.4, 0.15, 0.4] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.6 }}
              />
            ))}
            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <Heart className="w-14 h-14 fill-white/80 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl font-bold mb-5 font-serif leading-tight"
          >
            Join Our<br />Community
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-primary-foreground/70 leading-relaxed text-base mb-12"
          >
            Create your profile and start connecting with faith-based singles who share your values and beliefs.
          </motion.p>

          {/* Stat row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 mb-10 p-4 rounded-2xl bg-white/8 border border-white/12 backdrop-blur-sm"
          >
            {[
              { val: '50K+', label: 'Members' },
              { val: '1.2K', label: 'Couples' },
              { val: '30+', label: 'Countries' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold font-serif">{s.val}</div>
                <div className="text-[11px] text-primary-foreground/50 mt-0.5 tracking-wide">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: '🛡️', text: 'Safe & Verified' },
              { icon: '✝️', text: 'Faith-First' },
              { icon: '💌', text: 'Meaningful Connections' },
              { icon: '🔒', text: '256-bit Encrypted' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                className="inline-flex items-center gap-1.5 bg-white/12 backdrop-blur-sm border border-white/15 rounded-full px-3.5 py-1.5 text-xs font-medium"
              >
                <span>{item.icon}</span> {item.text}
              </motion.div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}