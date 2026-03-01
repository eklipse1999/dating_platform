'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LeftSidebar } from './left-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, Search, User, Settings, LogOut, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-context';
import { TIER_RANGES } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
  showLeftSidebar?: boolean;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function DashboardLayout({ children, showRightSidebar = true, showLeftSidebar = true, onSearch, searchQuery = '' }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <span className="font-bold text-lg">Committed</span>
        <ThemeToggle />
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div className={`
        lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <LeftSidebar mobileMode="drawer" onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Layout Container */}
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* Desktop Left Sidebar */}
        {showLeftSidebar && (
          <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-20 xl:w-64 bg-card border-r border-border z-30">
            <LeftSidebar mobileMode="desktop" />
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 min-w-0 min-h-screen ${showLeftSidebar ? 'lg:ml-20 xl:ml-64' : ''} ${showRightSidebar ? 'xl:mr-80' : ''}`}>
          {/* Desktop Header */}
          <header className="hidden lg:flex sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-lg border-b border-border items-center px-6 gap-4">
            {/* Search bar — left-aligned in content area */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, denomination, location..."
                  value={onSearch ? searchQuery : undefined}
                  onChange={onSearch ? (e) => onSearch(e.target.value) : undefined}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                {onSearch && searchQuery && (
                  <button onClick={() => onSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {/* Right actions pinned to the right */}
            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <UserProfileDropdown />
            </div>
          </header>

          {/* Page Content — pt-20 clears mobile fixed header, pb-20 clears mobile bottom nav */}
          <div className="w-full min-w-0 px-4 sm:px-6 lg:px-8 py-4 pt-20 lg:pt-6 pb-20 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-40 pb-safe">
        <LeftSidebar mobileMode="bottom" />
      </nav>
    </div>
  );
}

// User Profile Dropdown Component - Desktop Only
function UserProfileDropdown() {
  const { currentUser, logout, isAdmin } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!currentUser) return null;

  const tierInfo = TIER_RANGES[currentUser.tier];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
          <span className="text-lg">{currentUser.avatar}</span>
        </div>
        <div className="hidden xl:flex flex-col items-start">
          <span className="text-sm font-medium text-foreground">{currentUser.name || currentUser.first_name || currentUser.user_name || "User"}</span>
          <span className="text-xs text-muted-foreground">{currentUser.points.toLocaleString()} pts</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-border">
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors -m-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{currentUser.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-muted-foreground truncate">{currentUser.name || currentUser.first_name || currentUser.user_name || "User"}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{tierInfo.icon}</span>
                        <span className="text-sm text-muted-foreground">{currentUser.tier}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Points</span>
                    <span className="font-semibold text-muted-foreground">{currentUser.points.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <User className="w-4 h-4" />
                    <span className="font-medium">My Profile</span>
                  </button>
                </Link>
                <Link href="/settings" onClick={() => setIsOpen(false)}>
                  <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Settings</span>
                  </button>
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gold hover:bg-gold/10 transition-colors">
                      <Crown className="w-4 h-4" />
                      <span className="font-medium">Admin Panel</span>
                    </button>
                  </Link>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-2 border-t border-border">
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}