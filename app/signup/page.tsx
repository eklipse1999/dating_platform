'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, Loader2, AlertCircle, CheckCircle, Church } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApp } from '@/lib/app-context';
import { isOver18 } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '' as 'male' | 'female' | '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    churchName: '',
    churchBranch: '',
    ageConfirmed: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isHuman, setIsHuman] = useState(false);
  const [captchaError, setCaptchaError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dob = new Date(
        parseInt(formData.dobYear),
        parseInt(formData.dobMonth) - 1,
        parseInt(formData.dobDay)
      );
      
      if (!isOver18(dob)) {
        newErrors.dob = 'You must be 18 years or older to join Committed';
      }
    }

    if (!formData.ageConfirmed) {
      newErrors.ageConfirmed = 'You must confirm you are 18 years or older';
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
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    
    try {
      const dob = new Date(
        parseInt(formData.dobYear),
        parseInt(formData.dobMonth) - 1,
        parseInt(formData.dobDay)
      );

      await signup!({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender as 'male' | 'female',
        dob,
      });

      toast.success('Account created successfully!');
      router.push('/login');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 82 }, (_, i) => currentYear - 18 - i);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
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
            <span className="text-xl font-bold text-muted-foreground font-serif">Committed</span>
          </Link>

          <h1 className="text-3xl font-bold text-muted-foreground mb-2 font-serif">Create Account</h1>
          <p className="text-muted-foreground mb-8">Join our faith-based community today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>``
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={() => setFormData({ ...formData, gender: 'male' })}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={() => setFormData({ ...formData, gender: 'female' })}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Female</span>
                </label>
              </div>
              {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <Label>Date of Birth</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <select
                  value={formData.dobDay}
                  onChange={(e) => setFormData({ ...formData, dobDay: e.target.value })}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  value={formData.dobMonth}
                  onChange={(e) => setFormData({ ...formData, dobMonth: e.target.value })}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Month</option>
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
                <select
                  value={formData.dobYear}
                  onChange={(e) => setFormData({ ...formData, dobYear: e.target.value })}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              {errors.dob && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{errors.dob}</p>
                </div>
              )}
            </div>

            {/* Church Information */}
            <div className="pt-4 border-t border-border">
              <Label className="flex items-center gap-2 mb-3">
                <Church className="w-4 h-4 text-primary" />
                Church Information (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    value={formData.churchName}
                    onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                    placeholder="Church Name"
                  />
                </div>
                <div>
                  <Input
                    value={formData.churchBranch}
                    onChange={(e) => setFormData({ ...formData, churchBranch: e.target.value })}
                    placeholder="Branch/Location"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Adding your church helps connect you with members from your faith community.
              </p>
            </div>

            {/* Age Confirmation */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="ageConfirmed"
                checked={formData.ageConfirmed}
                onCheckedChange={(checked) => setFormData({ ...formData, ageConfirmed: checked as boolean })}
              />
              <label htmlFor="ageConfirmed" className="text-sm leading-relaxed cursor-pointer">
                I confirm I am 18 years or older and agree to the{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.ageConfirmed && <p className="text-sm text-destructive">{errors.ageConfirmed}</p>}

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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log In
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-accent items-center justify-center p-12">
        <div className="text-center text-primary-foreground max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-24 h-24 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-serif">Join Our Community</h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              Create your profile and start connecting with faith-based singles who share your values and beliefs.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
