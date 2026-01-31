'use client';

import { ReactNode, useState } from 'react';
import { LeftSidebar } from './left-sidebar';
import { RightSidebar } from './right-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function DashboardLayout({ children, showRightSidebar = true }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 lg:hidden flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <span className="font-bold text-lg">Committed</span>
        <ThemeToggle />
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <LeftSidebar 
        isMobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <main className="lg:ml-20 xl:ml-64 min-h-screen pt-16 lg:pt-0">
        {/* Desktop Header (only visible on large screens) */}
        <div className="hidden lg:flex sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4 items-center justify-between">
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search for people, posts, jobs..."
              className="w-full px-4 py-2 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <ThemeToggle />
        </div>
        
        {/* Content */}
        <div className="p-4 lg:p-6 xl:max-w-5xl xl:mx-auto">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Desktop only */}
      {showRightSidebar && <div className="hidden xl:block fixed right-0 top-0 w-80 h-screen border-l border-border p-6 overflow-y-auto">
        <RightSidebar />
      </div>}
    </div>
  );
}
