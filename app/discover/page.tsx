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
import { usersService } from '@/lib/api/services/users.service';
import { User } from '@/lib/types';
import { toast } from 'sonner';
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
  const { isAuthenticated, currentUser, isAdmin } = useApp();
  
  // State for users from API
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, router]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load users from API when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [activeCategory, filters, isAuthenticated]);

  // Function to load users from API
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      console.log('📥 Loading users from API...');
      
      const filterParams = {
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        tier: filters.tier !== 'all' ? filters.tier : undefined,
        category: activeCategory as 'all' | 'recent' | 'popular' | 'verified' | 'premium' | 'nearby' | undefined,
        limit: 20,
      };

      console.log('Filter params:', filterParams);

      const data = await usersService.discoverUsers(filterParams);
      
      console.log('✅ Users loaded:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      } else {
        console.warn('⚠️ No users returned from API');
        setUsers([]);
        toast.info('No users found. The discover feature may not be available yet.');
      }
    } catch (error: any) {
      console.error('❌ Failed to load users:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Don't show error toast, just log it
      // toast.error('Failed to load users. Please try again.');
      
      // Set empty array instead of keeping old data
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  // Show loading state
  if (!isAuthenticated || !currentUser) {
    return null;
  }
  
  return (
    <DashboardLayout showRightSidebar={false}>
      <div className="w-full px-1 sm:px-1 lg:px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-muted-foreground font-serif mb-3">
            Discover Matches
          </h1>
          <p className="text-base text-muted-foreground">
            Find meaningful connections with people who share your faith and values.
          </p>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, interest, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card text-base"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <List className="w-5 h-5" />
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
            className="mb-8 p-6 bg-card rounded-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-muted-foreground">Filter Profiles</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                Close
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Age Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={18}
                    max={99}
                    value={filters.ageMin}
                    onChange={(e) => setFilters({ ...filters, ageMin: parseInt(e.target.value) || 18 })}
                    className="w-24 h-10"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    min={18}
                    max={99}
                    value={filters.ageMax}
                    onChange={(e) => setFilters({ ...filters, ageMax: parseInt(e.target.value) || 99 })}
                    className="w-24 h-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Location</label>
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
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Tier</label>
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
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Sort By</label>
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
          className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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
            className="flex flex-wrap gap-2 mb-8"
          >
            {selectedInterests.map(interest => (
              <Badge
                key={interest}
                variant="secondary"
                className="cursor-pointer text-sm py-1.5 px-3"
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-muted-foreground">
            {isLoading ? 'Loading...' : `${filteredUsers.length} match${filteredUsers.length !== 1 ? 'es' : ''} found`}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            Updated just now
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Profiles Grid/List */}
        {!isLoading && filteredUsers.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user, index) => (
                <ProfileCard key={user.id} user={user} index={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">{user.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-muted-foreground truncate">{user.name}</h3>
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
                        {user.location?.city}, {user.location?.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {user.likes || 0} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Active {user.lastActive || 'recently'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/profile/${user.id}`}>
                      <Button variant="outline" size="sm" className="w-20">
                        View
                      </Button>
                    </Link>
                    <Button size="sm" className="bg-secondary hover:bg-secondary/90 w-20">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : !isLoading ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-3">No users available yet</h3>
            <p className="text-base text-muted-foreground mb-6">
              The discover feature is being set up by your backend developer.<br/>
              Check back soon or contact support.
            </p>
            <Button
              variant="outline"
              onClick={() => loadUsers()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {/* Load More */}
        {!isLoading && filteredUsers.length >= 20 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-10" onClick={loadUsers}>
              Load More Profiles
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}