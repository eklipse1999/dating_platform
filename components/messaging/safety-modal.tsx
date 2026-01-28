'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysRemaining: number;
}

export function SafetyModal({ isOpen, onClose, daysRemaining }: SafetyModalProps) {
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
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
                <Clock className="w-10 h-10 text-secondary" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-accent mb-3 font-serif">
                Safety First!
              </h2>

              {/* Message */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                For your protection, in-person date scheduling is available after 3 weeks of membership. 
                Keep getting to know each other online first!
              </p>

              {/* Time Remaining */}
              <div className="p-4 bg-muted/50 rounded-xl mb-6">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-accent">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Time remaining: {daysRemaining} days</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  After this period, you can schedule in-person dates
                </p>
              </div>

              {/* Why we do this */}
              <div className="text-left text-sm text-muted-foreground mb-6 p-4 bg-primary/5 rounded-xl">
                <h4 className="font-medium text-accent mb-2">Why this safety period?</h4>
                <ul className="space-y-1.5">
                  <li>Helps build genuine connections</li>
                  <li>Protects against rushed decisions</li>
                  <li>Ensures a safe community for everyone</li>
                </ul>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12"
              >
                Got It
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
