'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2, Coins, Calendar, CheckCircle, Church, Shield, BadgeCheck, AlertCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TierBadge } from '@/components/tier-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/app-context';
import { calculateAccountAgeDays, TIER_RANGES } from '@/lib/types';
import Link from 'next/link';

export default function MyProfilePage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    denomination: '',
    faithJourney: '',
    interests: '',
    churchName: '',
    churchBranch: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (currentUser) {
      setFormData({
        name: currentUser.name,
        bio: currentUser.bio,
        denomination: currentUser.denomination || '',
        faithJourney: currentUser.faithJourney || '',
        interests: currentUser.interests?.join(', ') || '',
        churchName: currentUser.church?.name || '',
        churchBranch: currentUser.church?.branch || '',
      });
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const accountAge = calculateAccountAgeDays(currentUser.accountCreatedAt);
  const tierInfo = TIER_RANGES[currentUser.tier];
  const nextTier = currentUser.tier === 'Diamond' ? null : 
    Object.entries(TIER_RANGES).find(([, range]) => range.min > currentUser.points)?.[0];
  const pointsToNext = nextTier ? TIER_RANGES[nextTier as keyof typeof TIER_RANGES].min - currentUser.points : 0;
  const progressPercentage = nextTier 
    ? ((currentUser.points - tierInfo.min) / (TIER_RANGES[nextTier as keyof typeof TIER_RANGES].min - tierInfo.min)) * 100 
    : 100;

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Profile updated successfully!');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="text-3xl font-bold text-accent font-serif">My Profile</h1>

          {/* Stats Card */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                    <span className="text-5xl">{currentUser.avatar}</span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div>
                  <h2 className="text-xl font-semibold text-accent">{currentUser.name}</h2>
                  <p className="text-muted-foreground">{currentUser.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <TierBadge tier={currentUser.tier} />
                    {currentUser.isVerified && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Points Progress */}
              <div className="w-full lg:w-auto lg:min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Points</span>
                  <span className="font-semibold text-accent">{currentUser.points.toLocaleString()}</span>
                </div>
                {nextTier && (
                  <>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{pointsToNext} points to {nextTier}</p>
                  </>
                )}
                <Link href="/upgrade">
                  <Button size="sm" className="mt-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <Coins className="w-4 h-4 mr-1" />
                    Buy Points
                  </Button>
                </Link>
              </div>
            </div>

            {/* Account Age */}
            <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Member for {accountAge} days</span>
              {!currentUser.isVerified && (
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {21 - accountAge > 0 ? `${21 - accountAge} days until verified` : 'Verification pending'}
                </span>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="p-6 bg-card rounded-2xl border border-border space-y-6">
            <h3 className="text-lg font-semibold text-accent">Edit Profile</h3>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="denomination">Denomination</Label>
                <Input
                  id="denomination"
                  value={formData.denomination}
                  onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                  placeholder="e.g., Baptist, Catholic, etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="faithJourney">Faith Journey</Label>
              <Textarea
                id="faithJourney"
                value={formData.faithJourney}
                onChange={(e) => setFormData({ ...formData, faithJourney: e.target.value })}
                placeholder="Share your faith journey..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="e.g., Hiking, Music, Reading"
              />
            </div>

            {/* Church Information */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-md font-semibold text-accent mb-4 flex items-center gap-2">
                <Church className="w-4 h-4 text-primary" />
                Church Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input
                    id="churchName"
                    value={formData.churchName}
                    onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                    placeholder="e.g., Hillsong Church"
                  />
                </div>
                <div>
                  <Label htmlFor="churchBranch">Branch/Location</Label>
                  <Input
                    id="churchBranch"
                    value={formData.churchBranch}
                    onChange={(e) => setFormData({ ...formData, churchBranch: e.target.value })}
                    placeholder="e.g., NYC Campus"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* ID Verification Section */}
          <div className="p-6 bg-card rounded-2xl border border-border space-y-6">
            <h3 className="text-lg font-semibold text-accent flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-primary" />
              ID Verification
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-accent">Verification Status</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.idVerification?.status === 'verified' 
                    ? 'Your ID has been verified'
                    : currentUser.idVerification?.status === 'submitted'
                    ? 'Your ID is pending review'
                    : currentUser.idVerification?.status === 'rejected'
                    ? 'Your ID verification was rejected'
                    : 'Submit your ID for verification'}
                </p>
              </div>
              {currentUser.idVerification?.status === 'verified' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Verified</span>
                </div>
              ) : currentUser.idVerification?.status === 'submitted' ? (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Pending</span>
                </div>
              ) : currentUser.idVerification?.status === 'rejected' ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Rejected</span>
                </div>
              ) : (
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload ID
                </Button>
              )}
            </div>

            {currentUser.idVerification?.status === 'rejected' && currentUser.idVerification.rejectionReason && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-600">
                  <strong>Reason:</strong> {currentUser.idVerification.rejectionReason}
                </p>
                <Button variant="outline" className="mt-3 gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10">
                  <Upload className="w-4 h-4" />
                  Resubmit ID
                </Button>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Accepted documents:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Passport</li>
                <li>Driver&apos;s License</li>
                <li>National ID Card</li>
              </ul>
            </div>
          </div>

          {/* Security Verification Section */}
          <div className="p-6 bg-card rounded-2xl border border-border space-y-6">
            <h3 className="text-lg font-semibold text-accent flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium text-accent">Email Verification</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
                {currentUser.securityVerification?.emailVerified ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Verified</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm">Verify Email</Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium text-accent">Phone Verification</p>
                  <p className="text-sm text-muted-foreground">{currentUser.phone}</p>
                </div>
                {currentUser.securityVerification?.phoneVerified ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Verified</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm">Verify Phone</Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium text-accent">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                {currentUser.securityVerification?.twoFactorEnabled ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Enabled</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium text-accent">Security Questions</p>
                  <p className="text-sm text-muted-foreground">For account recovery</p>
                </div>
                {currentUser.securityVerification?.securityQuestionsSet ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Set</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm">Set Questions</Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
