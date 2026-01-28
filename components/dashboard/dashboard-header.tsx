'use client';

import Link from 'next/link';
import { Heart, MessageCircle, User, Settings, LogOut, Coins, Menu, X, Shield, Crown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-context';
import { TIER_RANGES } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

export function DashboardHeader() {
  const router = useRouter();
  const { currentUser, logout, isAdmin } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!currentUser) return null;

  const tierInfo = TIER_RANGES[currentUser.tier];
  const nextTier = currentUser.tier === 'Diamond' ? null : 
    Object.entries(TIER_RANGES).find(([, range]) => range.min > currentUser.points)?.[0];
  const pointsToNext = nextTier ? TIER_RANGES[nextTier as keyof typeof TIER_RANGES].min - currentUser.points : 0;
  const progressPercentage = nextTier 
    ? ((currentUser.points - tierInfo.min) / (TIER_RANGES[nextTier as keyof typeof TIER_RANGES].min - tierInfo.min)) * 100 
    : 100;

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary text-secondary-foreground">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-accent font-serif hidden sm:inline">Committed</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Heart className="w-4 h-4" />
              <span>Browse</span>
            </Link>
            <Link href="/messages" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>Messages</span>
            </Link>
            <Link href="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            {isAdmin && (
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors">
                <Crown className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Points & Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Points Display */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-gold" />
                <span className="font-semibold text-accent">{currentUser.points.toLocaleString()}</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{tierInfo.icon}</span>
                <span className="text-sm font-medium text-accent">{currentUser.tier}</span>
              </div>
            </div>

            {/* Upgrade Button */}
            {currentUser.points === 0 && (
              <Link href="/upgrade">
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Coins className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress Bar (for users with points) */}
        {currentUser.points > 0 && nextTier && (
          <div className="hidden sm:flex items-center gap-3 pb-3 -mt-1">
            <span className="text-xs text-muted-foreground">Progress to {nextTier}:</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-xs">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              />
            </div>
            <span className="text-xs text-muted-foreground">{pointsToNext} pts to go</span>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border"
          >
            <div className="px-4 py-4 space-y-1">
              {/* Mobile Points Display */}
              <div className="flex items-center gap-3 px-3 py-3 bg-muted/50 rounded-xl mb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-gold" />
                  <span className="font-semibold text-accent">{currentUser.points.toLocaleString()} pts</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{tierInfo.icon}</span>
                  <span className="text-sm font-medium text-accent">{currentUser.tier}</span>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>Browse</span>
              </Link>
              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-gold hover:bg-muted rounded-lg transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 text-destructive hover:bg-muted rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
