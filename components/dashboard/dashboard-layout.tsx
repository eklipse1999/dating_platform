'use client';

import { ReactNode, useState } from 'react';
import { LeftSidebar } from './left-sidebar';
import { RightSidebar } from './right-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
  showLeftSidebar?: boolean;
}

export function DashboardLayout({ children, showRightSidebar = true, showLeftSidebar = true }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
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
      <div className="flex min-h-screen">
        {/* Desktop Left Sidebar */}
        {showLeftSidebar && (
          <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-20 xl:w-64 bg-card border-r border-border z-30">
            <LeftSidebar mobileMode="desktop" />
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 min-h-screen ${showLeftSidebar ? 'lg:ml-20 xl:ml-64' : ''}`}>
          {/* Desktop Header */}
          <header className="hidden lg:flex sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-lg border-b border-border items-center justify-between px-6">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for people, posts, jobs..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-6 pt-20 lg:pt-6 pb-20 lg:pb-6">
            {children}
          </div>
        </main>

        {/* Desktop Right Sidebar */}
        {showRightSidebar && (
          <aside className="hidden xl:flex flex-col fixed right-0 top-0 h-screen w-80 bg-card border-l border-border z-30 p-6 overflow-y-auto">
            <RightSidebar />
          </aside>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-40 pb-safe">
        <LeftSidebar mobileMode="bottom" />
      </nav>
    </div>
  );
}
