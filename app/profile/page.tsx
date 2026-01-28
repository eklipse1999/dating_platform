'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2, Coins, Calendar, CheckCircle } from 'lucide-react';
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
        </motion.div>
      </main>
    </div>
  );
}
