'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, MessageCircle, User, Settings, Heart, Users, 
  Crown, Coins, Bell, Search, LogOut, ChevronRight,
  Shield, Calendar, Bookmark, TrendingUp
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { TIER_RANGES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/tier-badge';

const mainNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/discover', icon: Search, label: 'Discover' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];

const secondaryNavItems = [
  { href: '/profile', icon: User, label: 'My Profile' },
  { href: '/saved', icon: Bookmark, label: 'Saved' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function LeftSidebar() {
  const pathname = usePathname();
  const { currentUser, logout, isAdmin, isInTrial, trialDaysRemaining } = useApp();

  if (!currentUser) return null;

  const tierInfo = TIER_RANGES[currentUser.tier];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative w-32 h-10">
            <Image
              src="/images/commited1.png"
              alt="Committed"
              fill
              className="object-contain dark:hidden"
            />
            <Image
              src="/images/commited_white.png"
              alt="Committed"
              fill
              className="object-contain hidden dark:block"
            />
          </div>
        </Link>
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-b border-border">
        <Link href="/profile" className="block">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">{currentUser.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-accent truncate">{currentUser.name}</h3>
              <div className="flex items-center gap-2">
                <TierBadge tier={currentUser.tier} size="sm" />
              </div>
            </div>
          </div>
        </Link>
        
        {/* Points Display */}
        <div className="mt-3 p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Points</span>
            <span className="font-semibold text-accent">{currentUser.points.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{tierInfo.icon}</span>
            <span className="text-sm font-medium text-accent">{currentUser.tier}</span>
          </div>
        </div>

        {/* Trial Banner */}
        {isInTrial && (
          <div className="mt-3 p-3 bg-secondary/10 rounded-xl border border-secondary/20">
            <div className="flex items-center gap-2 text-secondary">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{trialDaysRemaining} days left in trial</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.label === 'Messages' && (
                    <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                      3
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="my-4 border-t border-border" />

        <div className="space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Admin Link */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-border" />
            <Link href="/admin">
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === '/admin'
                    ? 'bg-gold/20 text-gold'
                    : 'text-gold hover:bg-gold/10'
                }`}
              >
                <Crown className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </motion.div>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Upgrade Button */}
        {currentUser.points === 0 && !isInTrial && (
          <Link href="/upgrade">
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Coins className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
