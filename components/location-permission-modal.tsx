'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-context';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

// Format coordinates correctly with N/S and E/W — e.g. 52.13°N, 5.29°E
const formatCoords = (lat: number, lng: number): string => {
  if (lat === 0 && lng === 0) return 'Coordinates unavailable';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
};

export function LocationPermissionModal({ isOpen, onComplete }: LocationPermissionModalProps) {
  const { requestLocation, userLocation } = useApp();
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted'>('idle');

  const handleRequestLocation = async () => {
    setStatus('requesting');
    // requestLocation() always succeeds now (IP → GPS → timezone fallback)
    // It never returns false, so there is no "denied" state to handle
    await requestLocation();
    setStatus('granted');
    setTimeout(() => onComplete(), 1500);
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
            {/* Close button — always lets user proceed */}
            <button
              onClick={() => onComplete()}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="p-8">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                {status === 'requesting' ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : status === 'granted' ? (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                ) : (
                  <MapPin className="w-10 h-10 text-primary" />
                )}
              </div>

              {/* Idle — prompt user */}
              {status === 'idle' && (
                <>
                  <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3 font-serif">
                    Enable Location
                  </h2>
                  <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                    Committed uses your location to show nearby matches and connect you with people in your area.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={handleRequestLocation}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Detect My Location
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onComplete()}
                      className="w-full h-12 bg-transparent"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </>
              )}

              {/* Requesting — show spinner */}
              {status === 'requesting' && (
                <>
                  <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3 font-serif">
                    Detecting Location
                  </h2>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Finding your location — this only takes a moment...
                  </p>
                </>
              )}

              {/* Granted — show result */}
              {status === 'granted' && (
                <>
                  <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3 font-serif">
                    Location Enabled!
                  </h2>
                  <p className="text-muted-foreground text-center mb-4 leading-relaxed">
                    Your location has been detected:
                  </p>
                  <div className="bg-muted/50 rounded-xl p-4 text-center mb-6">
                    <div className="text-2xl font-bold text-primary">
                      {userLocation?.city && userLocation.city !== ''
                        ? `${userLocation.city}, ${userLocation.country}`
                        : userLocation?.country && userLocation.country !== 'Unknown'
                        ? userLocation.country
                        : 'Location Set'}
                    </div>
                    {userLocation && (userLocation.lat !== 0 || userLocation.lng !== 0) && (
                      <div className="text-sm text-muted-foreground mt-2">
                        {formatCoords(userLocation.lat, userLocation.lng)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Redirecting to dashboard...
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}