'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/app-context';
import { LocationPermissionModal } from '@/components/location-permission-modal';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [captchaError, setCaptchaError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!isHuman) {
      setCaptchaError('Please verify that you are not a robot');
      newErrors.captcha = 'required';
    } else {
      setCaptchaError('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      setShowLocationModal(true);
    } catch {
      toast.error('Invalid email or password');
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
      <div className="min-h-screen flex">
        {/* Left side - Decorative */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary via-secondary/90 to-accent items-center justify-center p-12">
          <div className="text-center text-secondary-foreground max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-24 h-24 rounded-full bg-secondary-foreground/10 flex items-center justify-center mx-auto mb-8">
                <MapPin className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold mb-4 font-serif">Welcome Back</h2>
              <p className="text-secondary-foreground/80 leading-relaxed">
                Continue your journey to find meaningful, faith-based connections. Your matches are waiting!
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-secondary-foreground">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-accent font-serif">Committed</span>
            </Link>

            <h1 className="text-3xl font-bold text-accent mb-2 font-serif">Log In</h1>
            <p className="text-muted-foreground mb-8">Welcome back to our community</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              {/* CAPTCHA - I am not a robot */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Checkbox
                  id="captcha"
                  checked={isHuman}
                  onCheckedChange={(checked) => setIsHuman(checked as boolean)}
                />
                <label htmlFor="captcha" className="text-sm leading-relaxed cursor-pointer">
                  <span className="font-medium">I'm not a robot</span>
                  <div className="flex items-center gap-2 mt-1">
                    <img 
                      src="https://www.gstatic.com/recaptcha/api2/logo_48.png" 
                      alt="reCAPTCHA" 
                      className="w-6 h-6"
                    />
                    <span className="text-xs text-muted-foreground">
                      reCAPTCHA verification
                    </span>
                  </div>
                </label>
              </div>
              {captchaError && (
                <p className="text-sm text-destructive mt-1">{captchaError}</p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12"
                disabled={isLoading || !isHuman}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </form>

            {/* Demo hint */}
            <div className="mt-8 p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Demo:</strong> Use any email and password to log in.<br />
                Admin: <span className="font-mono text-xs">admin@committed.com</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <LocationPermissionModal 
        isOpen={showLocationModal} 
        onComplete={handleLocationComplete}
      />
    </>
  );
}
