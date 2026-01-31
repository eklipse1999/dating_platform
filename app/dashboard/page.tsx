'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Lock, Coins, X, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/app-context';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, getFilteredUsers, canMessage, isInTrial, trialDaysRemaining, trialExpired } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 50,
    tier: 'all',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const users = getFilteredUsers({
    ageRange: [filters.ageMin, filters.ageMax],
    tier: filters.tier === 'all' ? undefined : filters.tier,
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.location.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFreeUser = currentUser.points === 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-accent font-serif mb-2">
            Welcome back, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Discover meaningful connections with people who share your faith.
          </p>
        </motion.div>

        {/* Trial Banner */}
        {isInTrial && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-2xl border border-secondary/30"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">Free Trial Active!</h3>
                  <p className="text-sm text-muted-foreground">
                    You have <strong>{trialDaysRemaining} days</strong> left in your free trial. Enjoy unlimited messaging!
                  </p>
                </div>
              </div>
              <Link href="/upgrade">
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Free User Banner (when trial is expired) */}
        {!isInTrial && currentUser.points === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-accent">Upgrade to unlock messaging</h3>
                  <p className="text-sm text-muted-foreground">You are viewing 15 local profiles. Upgrade to see more and message!</p>
                </div>
              </div>
              <Link href="/upgrade">
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Coins className="w-4 h-4 mr-2" />
                  Get Points
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="p-4 bg-card rounded-2xl border border-border text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl mx-auto mb-2">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-accent">12</div>
            <div className="text-xs text-muted-foreground">New Likes</div>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-xl mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-accent">89%</div>
            <div className="text-xs text-muted-foreground">Profile Score</div>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gold/20 rounded-xl mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <div className="text-2xl font-bold text-accent">5</div>
            <div className="text-xs text-muted-foreground">Matches</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 bg-card rounded-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-accent">Filter Profiles</h3>
              <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <Label className="mb-2 block">Age Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={18}
                    max={99}
                    value={filters.ageMin}
                    onChange={(e) => setFilters({ ...filters, ageMin: parseInt(e.target.value) || 18 })}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    min={18}
                    max={99}
                    value={filters.ageMax}
                    onChange={(e) => setFilters({ ...filters, ageMax: parseInt(e.target.value) || 99 })}
                    className="w-20"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Tier</Label>
                <select
                  value={filters.tier}
                  onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isFreeUser}
                >
                  <option value="all">All Tiers</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
                {isFreeUser && (
                  <p className="text-xs text-muted-foreground mt-1">Upgrade to filter by tier</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-accent">
            {isFreeUser ? 'Local Matches' : 'Discover Matches'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredUsers.length} profile{filteredUsers.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Profiles Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {filteredUsers.map((user, index) => (
              <ProfileCard key={user.id} user={user} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2">No profiles found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {isFreeUser && filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-block p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border">
              <h3 className="text-xl font-semibold text-accent mb-2">Want to see more?</h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to view unlimited profiles and start messaging
              </p>
              <Link href="/upgrade">
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Coins className="w-4 h-4 mr-2" />
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
