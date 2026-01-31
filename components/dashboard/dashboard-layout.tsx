'use client';

import { ReactNode } from 'react';
import { LeftSidebar } from './left-sidebar';
import { RightSidebar } from './right-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function DashboardLayout({ children, showRightSidebar = true }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Left Sidebar - Fixed */}
      <LeftSidebar />

      {/* Main Content Area */}
      <main className={`ml-64 ${showRightSidebar ? 'mr-80' : ''} min-h-screen`}>
        {/* Top Bar for mobile theme toggle */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4 flex justify-end lg:hidden">
          <ThemeToggle />
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Fixed */}
      {showRightSidebar && <RightSidebar />}
    </div>
  );
}
