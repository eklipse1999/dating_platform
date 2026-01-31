'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Filter, Sparkles, Heart, 
  MapPin, Clock, Users, Bookmark, Share2, Grid,
  List, TrendingUp, Award, Star
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from '@/components/tier-badge';
import { useApp } from '@/lib/app-context';
import Link from 'next/link';

const categories = [
  { id: 'all', name: 'All', icon: Grid },
  { id: 'recent', name: 'Recent', icon: Clock },
  { id: 'popular', name: 'Popular', icon: TrendingUp },
  { id: 'verified', name: 'Verified', icon: Award },
  { id: 'premium', name: 'Premium', icon: Star },
  { id: 'nearby', name: 'Nearby', icon: MapPin },
];

const locations = [
  'All Locations',
  'Within 10 km',
  'Within 25 km',
  'Within 50 km',
  'Within 100 km',
];

const interests = [
  'Christian Dating', 'Church Events', 'Bible Study', 'Worship',
  'Youth Group', 'Mission Work', 'Fellowship', 'Prayer Groups',
  'Marriage Prep', 'Single Parents', 'Over 40s', 'Over 50s',
];

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, getFilteredUsers, canMessage, isInTrial, trialDaysRemaining } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
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

  // Get users based on active category
  const getCategoryUsers = () => {
    let users = getFilteredUsers({
      ageRange: [filters.ageMin, filters.ageMax],
      tier: filters.tier === 'all' ? undefined : filters.tier,
    });

    // Apply category filters
    switch (activeCategory) {
      case 'recent':
        users = users.filter(u => u.joinDate).sort((a, b) => ((b.joinDate as Date).getTime() - (a.joinDate as Date).getTime())).slice(0, 20);
        break;
      case 'popular':
        users = users.sort((a, b) => ((b.likes ?? 0) - (a.likes ?? 0))).slice(0, 20);
        break;
      case 'verified':
        users = users.filter(u => u.idVerification?.status === 'verified').slice(0, 20);
        break;
      case 'premium':
        users = users.filter(u => ['Gold', 'Platinum', 'Diamond'].includes(u.tier)).slice(0, 20);
        break;
      default:
        users = users.slice(0, 20);
    }

    return users;
  };

  const users = getCategoryUsers();
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.interests?.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <DashboardLayout showRightSidebar={false}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-accent font-serif mb-2">
            Discover Matches
          </h1>
          <p className="text-muted-foreground">
            Find meaningful connections with people who share your faith and values.
          </p>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, interest, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-primary-foreground' : ''}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
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
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                Close
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Age Range</label>
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
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Tier</label>
                <select
                  value={filters.tier}
                  onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Tiers</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Sort By</label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Interests Filter */}
        {selectedInterests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {selectedInterests.map(interest => (
              <Badge
                key={interest}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleInterest(interest)}
              >
                {interest} ×
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setSelectedInterests([])}>
              Clear all
            </Button>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-accent">
            {filteredUsers.length} match{filteredUsers.length !== 1 ? 'es' : ''} found
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            Updated just now
          </div>
        </div>

        {/* Profiles Grid/List */}
        {filteredUsers.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => (
                <ProfileCard key={user.id} user={user} index={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">{user.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-accent truncate">{user.name}</h3>
                      <Badge variant="outline" className="text-xs">{user.tier}</Badge>
                      {user.idVerification?.status === 'verified' && (
                        <Award className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {user.bio || 'No bio yet'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {user.location.city}, {user.location.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {user.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Active {user.lastActive}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/profile/${user.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setFilters({ ageMin: 18, ageMax: 50, tier: 'all' });
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredUsers.length >= 20 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="px-8">
              Load More Profiles
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
