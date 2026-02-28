'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, MessageCircle, User, Settings, Heart, 
  Crown, Coins, Bell, Search, LogOut,
  Shield, Calendar, Bookmark, X
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { TIER_RANGES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/tier-badge';

type MobileMode = 'desktop' | 'drawer' | 'bottom';

interface LeftSidebarProps {
  mobileMode?: MobileMode;
  onClose?: () => void;
}

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

const bottomNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/discover', icon: Search, label: 'Discover' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function LeftSidebar({ mobileMode = 'desktop', onClose }: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isAdmin, isInTrial } = useApp();

  const handleLogout = async () => {
    await logout();
    router.push('./login');
  };

  if (!currentUser) return null;

  const tierInfo = TIER_RANGES[currentUser.tier];

  // Desktop Sidebar
  if (mobileMode === 'desktop') {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-0.9 px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative w-30 h-15">
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


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)", borderColor: "rgba(139, 92, 246, 0.5)" }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium hidden xl:block">{item.label}</span>
                    {item.label === 'Messages' && (
                      <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full hidden xl:block">
                        3
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="my-4 border-t border-border hidden xl:block" />

          <div className="space-y-1 hidden xl:block">
            {secondaryNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)", borderColor: "rgba(139, 92, 246, 0.5)" }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent ${
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

          {isAdmin && (
            <>
              <div className="my-4 border-t border-border hidden xl:block" />
              <Link href="/admin">
                <motion.div
                  whileHover={{ x: 4, boxShadow: "0 0 20px rgba(234, 179, 8, 0.3)", borderColor: "rgba(234, 179, 8, 0.5)" }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent ${
                    pathname === '/admin'
                      ? 'bg-gold/20 text-gold'
                      : 'text-gold hover:bg-gold/10'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  <span className="font-medium hidden xl:block">Admin Panel</span>
                </motion.div>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border space-y-3 hidden xl:block">
          {currentUser.points === 0 && !isInTrial && (
            <Link href="/upgrade">
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Coins className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Mobile Bottom Navigation
  if (mobileMode === 'bottom') {
    return (
      <nav className="flex items-center justify-around h-full px-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Mobile Drawer Sidebar
  return (
    <div className="flex flex-col h-full">
      {/* Header with Close Button */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
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
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <Link href="/profile" className="block" onClick={onClose}>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">{currentUser.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-muted-foreground truncate">{currentUser.name}</h3>
              <TierBadge tier={currentUser.tier} size="sm" />
            </div>
          </div>
        </Link>
        
        <div className="mt-3 p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Points</span>
            <span className="font-semibold text-muted-foreground">{currentUser.points.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{tierInfo.icon}</span>
            <span className="text-sm font-medium text-muted-foreground">{currentUser.tier}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <motion.div
                  whileHover={{ x: 4, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)", borderColor: "rgba(139, 92, 246, 0.5)" }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent ${
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
              <Link key={item.href} href={item.href} onClick={onClose}>
                <motion.div
                  whileHover={{ x: 4, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)", borderColor: "rgba(139, 92, 246, 0.5)" }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent ${
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

        {isAdmin && (
          <>
            <div className="my-4 border-t border-border" />
            <Link href="/admin" onClick={onClose}>
              <motion.div
                whileHover={{ x: 4, boxShadow: "0 0 20px rgba(234, 179, 8, 0.3)", borderColor: "rgba(234, 179, 8, 0.5)" }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent ${
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
        {currentUser.points === 0 && !isInTrial && (
          <Link href="/upgrade" onClick={onClose}>
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Coins className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}