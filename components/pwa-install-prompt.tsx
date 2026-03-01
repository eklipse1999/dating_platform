'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Heart, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (don't show for 7 days after dismiss)
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS instructions after a short delay
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    // Android / Desktop — listen for the native prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed', new Date().toISOString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* App icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shrink-0 shadow-lg">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-foreground text-base">Install Committed</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add to your home screen for the best experience
                    </p>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Features */}
                <div className="flex gap-3 mt-2">
                  {['Works offline', 'Faster', 'No app store'].map((f) => (
                    <span key={f} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {isIOS ? (
              // iOS instructions — Safari doesn't support the install prompt
              <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Install on iPhone / iPad</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> → <strong>Add</strong>
                </p>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-1 text-muted-foreground"
                >
                  Not now
                </Button>
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Install
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}