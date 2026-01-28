'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, MessageCircle, MapPin, Lock, Flag, 
  CheckCircle, Calendar, Cross, BookOpen, Sparkles 
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TierBadge } from '@/components/tier-badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-context';
import { calculateAccountAgeDays } from '@/lib/types';

export default function ProfileViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, getUserById, toggleFollow, isFollowing, canMessage, currentUser } = useApp();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const user = getUserById(id);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-accent mb-2">Profile not found</h1>
          <p className="text-muted-foreground mb-6">This profile may have been removed or doesn&apos;t exist.</p>
          <Link href="/dashboard">
            <Button>Back to Browse</Button>
          </Link>
        </main>
      </div>
    );
  }

  const following = isFollowing(user.id);
  const accountAge = calculateAccountAgeDays(user.accountCreatedAt);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Photo & Quick Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24"
            >
              {/* Avatar */}
              <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-9xl">{user.avatar}</span>
                
                {/* Badges */}
                <div className="absolute top-4 right-4">
                  <TierBadge tier={user.tier} />
                </div>
                
                {user.isVerified && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant={following ? 'default' : 'outline'}
                  className={`w-full ${following ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' : ''}`}
                  onClick={() => toggleFollow(user.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${following ? 'fill-current' : ''}`} />
                  {following ? 'Following' : 'Follow'}
                </Button>
                
                {canMessage || currentUser?.isAdmin ? (
                  <Link href={`/messages?user=${user.id}`} className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                ) : (
                  <Link href="/upgrade" className="block">
                    <Button variant="outline" className="w-full text-muted-foreground bg-transparent">
                      <Lock className="w-4 h-4 mr-2" />
                      Upgrade to Message
                    </Button>
                  </Link>
                )}

                <Button variant="ghost" className="w-full text-muted-foreground">
                  <Flag className="w-4 h-4 mr-2" />
                  Report Profile
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-accent font-serif mb-2">
                {user.name}, {user.age}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location.city}, {user.location.country}</span>
                </div>
                {user.distance && (
                  <span className="text-sm">{user.distance} away</span>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member for {accountAge} days</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="p-6 bg-card rounded-2xl border border-border">
              <h2 className="text-lg font-semibold text-accent mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                About Me
              </h2>
              <p className="text-foreground leading-relaxed">{user.bio}</p>
            </div>

            {/* Faith Journey */}
            {user.faithJourney && (
              <div className="p-6 bg-card rounded-2xl border border-border">
                <h2 className="text-lg font-semibold text-accent mb-3 flex items-center gap-2">
                  <Cross className="w-5 h-5 text-primary" />
                  Faith Journey
                </h2>
                <p className="text-foreground leading-relaxed">{user.faithJourney}</p>
                {user.denomination && (
                  <div className="mt-4 inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {user.denomination}
                  </div>
                )}
              </div>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="p-6 bg-card rounded-2xl border border-border">
                <h2 className="text-lg font-semibold text-accent mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 bg-muted text-foreground rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Values */}
            {user.values && user.values.length > 0 && (
              <div className="p-6 bg-card rounded-2xl border border-border">
                <h2 className="text-lg font-semibold text-accent mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Values
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.values.map((value) => (
                    <span
                      key={value}
                      className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
