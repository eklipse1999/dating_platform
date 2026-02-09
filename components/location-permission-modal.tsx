'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-context';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function LocationPermissionModal({ isOpen, onComplete }: LocationPermissionModalProps) {
  const { requestLocation, locationPermissionStatus, userLocation } = useApp();
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const handleRequestLocation = async () => {
    setStatus('requesting');
    const granted = await requestLocation();
    setStatus(granted ? 'granted' : 'denied');
    
    if (granted) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-accent/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="p-8">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                {status === 'requesting' || locationPermissionStatus === 'requesting' ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : status === 'granted' ? (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                ) : status === 'denied' ? (
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                ) : (
                  <MapPin className="w-10 h-10 text-primary" />
                )}
              </div>

              {/* Content */}
              {status === 'idle' && (
                <>
                  <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3 font-serif">
                    Enable Location
                  </h2>
                  <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                    Committed needs your location to show nearby matches and help you connect with people in your area.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={handleRequestLocation}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Allow Location Access
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSkip}
                      className="w-full h-12 bg-transparent"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </>
              )}

              {(status === 'requesting' || locationPermissionStatus === 'requesting') && (
                <>
                  <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3 font-serif">
                    Getting Your Location
                  </h2>
                  <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                    Please allow location access when prompted by your browser...
                  </p>
                </>
              )}

              {status === 'granted' && userLocation && (
                <>
                  <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3 font-serif">
                    Location Enabled!
                  </h2>
                  <p className="text-muted-foreground text-center mb-4 leading-relaxed">
                    We detected your location:
                  </p>
                  <div className="bg-muted/50 rounded-xl p-4 text-center mb-6">
                    <div className="text-lg font-semibold text-muted-foreground">
                      {userLocation.city}, {userLocation.country}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Redirecting to dashboard...
                  </p>
                </>
              )}

              {status === 'denied' && (
                <>
                  <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3 font-serif">
                    Location Access Required
                  </h2>
                  <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                    We need your location to show nearby matches. Please enable location access in your browser settings and try again.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setStatus('idle')}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12"
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSkip}
                      className="w-full h-12 bg-transparent"
                    >
                      Continue Without Location
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
