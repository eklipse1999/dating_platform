'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createEnrollment, verifyEnrollment, deleteEnrollment, hasFaceIdEnrollment } from '@/lib/facetec';

interface FaceIdEnrollmentProps {
  userId: string;
  onEnrollmentComplete?: (success: boolean) => void;
  onVerificationComplete?: (success: boolean) => void;
  mode?: 'enrollment' | 'verification';
}

export function FaceIdEnrollment({ 
  userId, 
  onEnrollmentComplete, 
  onVerificationComplete,
  mode = 'enrollment' 
}: FaceIdEnrollmentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(hasFaceIdEnrollment(userId));
  const [currentMode, setCurrentMode] = useState<'enrollment' | 'verification'>(mode);
  const [showCamera, setShowCamera] = useState(false);

  const handleEnrollment = async () => {
    setIsProcessing(true);
    setShowCamera(true);

    try {
      // Simulate camera scan delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await createEnrollment(userId);
      
      if (result.success) {
        setIsEnrolled(true);
        toast.success('Face ID enrolled successfully!');
        onEnrollmentComplete?.(true);
      } else {
        toast.error(result.error || 'Failed to enroll Face ID');
        onEnrollmentComplete?.(false);
      }
    } catch (error) {
      toast.error('An error occurred during enrollment');
      onEnrollmentComplete?.(false);
    } finally {
      setIsProcessing(false);
      setShowCamera(false);
    }
  };

  const handleVerification = async () => {
    setIsProcessing(true);
    setShowCamera(true);

    try {
      // Simulate camera scan delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await verifyEnrollment(userId);
      
      if (result.success) {
        toast.success('Face ID verified successfully!');
        onVerificationComplete?.(true);
      } else {
        toast.error(result.error || 'Face verification failed');
        onVerificationComplete?.(false);
      }
    } catch (error) {
      toast.error('An error occurred during verification');
      onVerificationComplete?.(false);
    } finally {
      setIsProcessing(false);
      setShowCamera(false);
    }
  };

  const handleDeleteEnrollment = async () => {
    if (!confirm('Are you sure you want to disable Face ID? You will need to set it up again to log in with Face ID.')) {
      return;
    }

    setIsProcessing(true);

    try {
      await deleteEnrollment(userId);
      setIsEnrolled(false);
      toast.success('Face ID disabled successfully');
    } catch (error) {
      toast.error('Failed to disable Face ID');
    } finally {
      setIsProcessing(false);
    }
  };

  if (currentMode === 'verification' && !isEnrolled) {
    return (
      <div className="p-6 bg-card rounded-2xl border border-border text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Face ID Enrolled</h3>
        <p className="text-muted-foreground mb-4">
          You need to set up Face ID in your security settings before you can use it for login.
        </p>
        <Button onClick={() => setCurrentMode('enrollment')} variant="outline">
          Set Up Face ID
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card rounded-2xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              {currentMode === 'enrollment' ? 'Set Up Face ID' : 'Verify Face ID'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentMode === 'enrollment' 
                ? 'Enable biometric authentication for faster logins'
                : 'Confirm your identity with Face ID'}
            </p>
          </div>
        </div>
        
        {isEnrolled && currentMode === 'enrollment' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Enrolled</span>
          </div>
        )}
      </div>

      {/* Camera Simulation View */}
      {showCamera && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-6 aspect-video bg-black rounded-xl overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {isProcessing ? (
              <div className="text-center text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <Loader2 className="w-16 h-16" />
                </motion.div>
                <p className="text-lg font-medium">
                  {currentMode === 'enrollment' ? 'Scanning your face...' : 'Verifying...'}
                </p>
                <p className="text-sm text-white/70 mt-2">
                  Position your face within the frame
                </p>
              </div>
            ) : (
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Camera Ready</p>
              </div>
            )}
          </div>
          
          {/* Face frame overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-2 border-white/50 rounded-3xl">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
              <div className="absolute top-4 right-1/2 -translate-x-1/2 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
              <div className="absolute bottom-4 right-1/2 -translate-x-1/2 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {!showCamera && (
        <div className="space-y-4">
          {currentMode === 'enrollment' ? (
            <>
              {!isEnrolled ? (
                <Button
                  onClick={handleEnrollment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up Face ID...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Set Up Face ID
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={handleVerification}
                    disabled={isProcessing}
                    className="w-full"
                    variant="outline"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Test Face ID
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleDeleteEnrollment}
                    disabled={isProcessing}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-destructive"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Disable Face ID
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Button
              onClick={handleVerification}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Verify with Face ID
                </>
              )}
            </Button>
          )}

          {currentMode === 'verification' && isEnrolled && (
            <p className="text-xs text-muted-foreground text-center">
              Powered by FaceTec® biometric technology
            </p>
          )}
        </div>
      )}
    </div>
  );
}
