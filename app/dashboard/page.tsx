'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Lock, Coins, X, Sparkles, TrendingUp, Heart, Loader2, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/app-context';
import Link from 'next/link';
import { User } from '@/lib/types';

// ── Client-side search across all meaningful user fields ──────────────────────
function matchesQuery(user: User, q: string): boolean {
  if (!q.trim()) return true;
  const query = q.toLowerCase();
  return !![
    user.name,
    user.first_name,
    user.last_name,
    user.user_name,
    user.bio,
    user.career,
    user.denomination,
    user.church?.name,
    user.church?.branch,
    user.location?.city,
    user.location?.country,
    user.looking_for,
    ...(user.interests || []),
  ].some(val => val?.toLowerCase().includes(query));
}

function applyFilters(users: User[], filters: Filters): User[] {
  return users.filter(u => {
    if (u.age && (u.age < filters.ageMin || u.age > filters.ageMax)) return false;
    if (filters.gender !== 'all' && u.gender && u.gender.toLowerCase() !== filters.gender) return false;
    if (filters.denomination !== 'all' && u.denomination &&
        !u.denomination.toLowerCase().includes(filters.denomination.toLowerCase())) return false;
    if (filters.tier !== 'all' && u.tier !== filters.tier) return false;
    return true;
  });
}

interface Filters {
  ageMin: number;
  ageMax: number;
  gender: string;
  denomination: string;
  tier: string;
}

const DEFAULT_FILTERS: Filters = { ageMin: 18, ageMax: 60, gender: 'all', denomination: 'all', tier: 'all' };

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, getFilteredUsers, isInTrial, trialDaysRemaining, isAdmin, isLoading: authLoading } = useApp();

  const [allUsers, setAllUsers]     = useState<User[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]       = useState<Filters>(DEFAULT_FILTERS);

  const debouncedQuery = useDebounce(searchQuery, 250);

  // Expose search setter so the header search bar can drive the same state
  // via a global ref that dashboard-layout reads
  const searchRef = useRef<((q: string) => void) | null>(null);
  searchRef.current = setSearchQuery;

  useEffect(() => {
    if (isAdmin) router.push('/admin');
  }, [isAdmin, router]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  // ── Fetch all users ONCE on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    setIsLoading(true);
    getFilteredUsers().then(result => {
      setAllUsers(result || []);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated || !currentUser) return null;

  // ── Client-side search + filter (instant, no API call) ────────────────────
  const filteredUsers = applyFilters(
    allUsers.filter(u => matchesQuery(u, debouncedQuery)),
    filters
  );

  const isFreeUser      = currentUser.tier === 'Free';
  const hasActiveSearch = debouncedQuery.trim().length > 0;
  const filtersActive   = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  const clearSearch = () => { setSearchQuery(''); setFilters(DEFAULT_FILTERS); };

  return (
    <DashboardLayout showRightSidebar={false} onSearch={setSearchQuery} searchQuery={searchQuery}>
      <div className="max-w-5xl mx-auto w-full">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-foreground font-serif mb-1">
            Welcome back, {currentUser.name || currentUser.user_name || currentUser.first_name || 'Friend'}! 👋
          </h1>
          <p className="text-muted-foreground text-sm">Discover meaningful connections with people who share your faith.</p>
        </motion.div>

        {/* Trial Banner */}
        {(isInTrial || isFreeUser) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-2xl border border-secondary/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-xl"><Sparkles className="w-5 h-5 text-secondary" /></div>
                <div>
                  <h3 className="font-semibold text-secondary">Free Trial Active!</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>{trialDaysRemaining > 0 ? trialDaysRemaining : 14} days</strong> remaining. Enjoy unlimited messaging!
                  </p>
                </div>
              </div>
              <Link href="/upgrade">
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 shrink-0">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Free User Banner */}
        {!isInTrial && isFreeUser && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl"><Lock className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">Upgrade to unlock messaging</h3>
                  <p className="text-sm text-muted-foreground">Viewing local profiles. Upgrade to see more and start messaging!</p>
                </div>
              </div>
              <Link href="/upgrade">
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0">
                  <Coins className="w-4 h-4 mr-2" /> Get Points
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="p-4 bg-card rounded-2xl border border-border text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl mx-auto mb-2">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-xs text-muted-foreground">New Likes</div>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-xl mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-foreground">89%</div>
            <div className="text-xs text-muted-foreground">Profile Score</div>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gold/20 rounded-xl mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? '—' : allUsers.length}
            </div>
            <div className="text-xs text-muted-foreground">Profiles</div>
          </div>
        </motion.div>

        {/* Search bar + Filters toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, denomination, career, location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 bg-card"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}
            className={`h-11 shrink-0 ${filtersActive ? 'border-primary text-primary' : ''}`}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters {filtersActive && <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px]">ON</span>}
          </Button>
        </motion.div>

        {/* Active search/filter tags */}
        <AnimatePresence>
          {(hasActiveSearch || filtersActive) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-muted-foreground">Active:</span>
              {hasActiveSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                  "{debouncedQuery}" <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.gender !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs capitalize">
                  {filters.gender} <button onClick={() => setFilters(f => ({...f, gender:'all'}))}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.denomination !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs">
                  {filters.denomination} <button onClick={() => setFilters(f => ({...f, denomination:'all'}))}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.tier !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs">
                  {filters.tier} Tier <button onClick={() => setFilters(f => ({...f, tier:'all'}))}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearSearch} className="text-xs text-muted-foreground hover:text-destructive underline ml-1">
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
              <div className="p-5 bg-card rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Filter Profiles</h3>
                  <div className="flex items-center gap-2">
                    {filtersActive && (
                      <button onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="text-xs text-muted-foreground hover:text-destructive underline">Reset</button>
                    )}
                    <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-muted rounded-md transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Age range */}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Age Range</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={18} max={99} value={filters.ageMin}
                        onChange={e => setFilters(f => ({...f, ageMin: parseInt(e.target.value)||18}))}
                        className="w-20 h-9 text-sm" />
                      <span className="text-muted-foreground text-sm">–</span>
                      <Input type="number" min={18} max={99} value={filters.ageMax}
                        onChange={e => setFilters(f => ({...f, ageMax: parseInt(e.target.value)||99}))}
                        className="w-20 h-9 text-sm" />
                    </div>
                  </div>
                  {/* Gender */}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Gender</Label>
                    <select value={filters.gender} onChange={e => setFilters(f => ({...f, gender: e.target.value}))}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="all">All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  {/* Denomination */}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Denomination</Label>
                    <select value={filters.denomination} onChange={e => setFilters(f => ({...f, denomination: e.target.value}))}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="all">All</option>
                      <option value="Catholic">Catholic</option>
                      <option value="Protestant">Protestant</option>
                      <option value="Baptist">Baptist</option>
                      <option value="Pentecostal">Pentecostal</option>
                      <option value="Methodist">Methodist</option>
                      <option value="Anglican">Anglican</option>
                      <option value="Orthodox">Orthodox</option>
                      <option value="Seventh-day Adventist">Adventist</option>
                      <option value="Non-denominational">Non-denom</option>
                    </select>
                  </div>
                  {/* Tier */}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Tier</Label>
                    <select value={filters.tier} onChange={e => setFilters(f => ({...f, tier: e.target.value}))}
                      disabled={isFreeUser}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                      <option value="all">All Tiers</option>
                      <option value="Bronze">🥉 Bronze</option>
                      <option value="Silver">🥈 Silver</option>
                      <option value="Gold">🥇 Gold</option>
                      <option value="Diamond">💎 Diamond</option>
                      <option value="Platinum">👑 Platinum</option>
                    </select>
                    {isFreeUser && <p className="text-[11px] text-muted-foreground mt-1">Upgrade to filter by tier</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            {hasActiveSearch ? `Results for "${debouncedQuery}"` : isFreeUser ? 'Local Matches' : 'Discover Matches'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</span>
            ) : (
              `${filteredUsers.length} profile${filteredUsers.length !== 1 ? 's' : ''} found`
            )}
          </span>
        </div>

        {/* Profiles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {filteredUsers.map((user, index) => (
              <ProfileCard key={user.id} user={user} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No profiles found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {hasActiveSearch
                ? `No one matched "${debouncedQuery}". Try a different name, denomination, or location.`
                : 'Try adjusting your filters.'}
            </p>
            {(hasActiveSearch || filtersActive) && (
              <Button variant="outline" onClick={clearSearch} className="mt-1">
                <X className="w-4 h-4 mr-2" /> Clear search
              </Button>
            )}
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {isFreeUser && filteredUsers.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-10 text-center">
            <div className="inline-block p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-2">Want to see more?</h3>
              <p className="text-muted-foreground text-sm mb-4">Upgrade to view unlimited profiles and start messaging.</p>
              <Link href="/upgrade">
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Coins className="w-4 h-4 mr-2" /> View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}