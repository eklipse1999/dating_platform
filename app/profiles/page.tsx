'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Grid3X3, List, X, 
  UserPlus, UserCheck, MessageCircle, Filter, Sparkles,
  MapPin, Clock, Award, Star, Heart, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { MOCK_USERS, MOCK_CURRENT_USER } from '@/lib/mock-data';
import { User, Tier } from '@/lib/types';

// Filter options
const AGE_OPTIONS = [
  { value: 'all', label: 'All Ages' },
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
  { value: '46+', label: '46+' },
];

const TIER_OPTIONS: { value: Tier | 'all'; label: string }[] = [
  { value: 'all', label: 'All Tiers' },
  { value: 'Bronze', label: 'Bronze' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Platinum', label: 'Platinum' },
  { value: 'Diamond', label: 'Diamond' },
];

const DENOMINATIONS = [
  'All Denominations',
  'Baptist',
  'Catholic', 
  'Methodist',
  'Presbyterian',
  'Non-denominational',
  'Pentecostal',
  'Lutheran',
  'Anglican',
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'nearest', label: 'Nearest First' },
  { value: 'name', label: 'Name (A-Z)' },
];

type ViewMode = 'grid' | 'list';
type FilterState = {
  search: string;
  ageRange: string;
  tier: Tier | 'all';
  denomination: string;
  sortBy: string;
  showVerified: boolean;
  showOnline: boolean;
};

export default function ProfilesPage() {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    ageRange: 'all',
    tier: 'all',
    denomination: 'All Denominations',
    sortBy: 'recent',
    showVerified: false,
    showOnline: false,
  });

  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...MOCK_USERS];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.bio?.toLowerCase().includes(searchLower) ||
        user.career?.toLowerCase().includes(searchLower) ||
        user.denomination?.toLowerCase().includes(searchLower) ||
        user.interests?.some(i => i.toLowerCase().includes(searchLower))
      );
    }

    // Age filter
    if (filters.ageRange !== 'all') {
      const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
      result = result.filter(user => {
        if (filters.ageRange === '46+') return user.age >= 46;
        return user.age >= minAge && user.age <= maxAge;
      });
    }

    // Tier filter
    if (filters.tier !== 'all') {
      result = result.filter(user => user.tier === filters.tier);
    }

    // Denomination filter
    if (filters.denomination !== 'All Denominations') {
      result = result.filter(user => user.denomination === filters.denomination);
    }

    // Verified filter
    if (filters.showVerified) {
      result = result.filter(user => user.isVerified);
    }

    // Online filter
    if (filters.showOnline) {
      result = result.filter(user => user.lastActive === 'now');
    }

    // Sorting
    switch (filters.sortBy) {
      case 'popular':
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'nearest':
        result.sort((a, b) => {
          const distA = parseFloat(a.distance?.replace(' km', '') || '999');
          const distB = parseFloat(b.distance?.replace(' km', '') || '999');
          return distA - distB;
        });
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
      default:
        result.sort((a, b) => 
          new Date(b.accountCreatedAt).getTime() - new Date(a.accountCreatedAt).getTime()
        );
    }

    return result;
  }, [filters]);

  // Handle profile click
  const handleProfileClick = (user: User) => {
    setSelectedProfile(user);
    setShowDetailsModal(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      ageRange: 'all',
      tier: 'all',
      denomination: 'All Denominations',
      sortBy: 'recent',
      showVerified: false,
      showOnline: false,
    });
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.ageRange !== 'all') count++;
    if (filters.tier !== 'all') count++;
    if (filters.denomination !== 'All Denominations') count++;
    if (filters.showVerified) count++;
    if (filters.showOnline) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Browse Profiles
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Find your perfect match from our community of faithful singles. 
              Use filters to find someone who shares your values and interests.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, bio, interests..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 h-12 bg-card border-border focus:border-primary focus:ring-primary"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-3">
              {/* Quick Filters Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Age Range */}
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Age Range
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup 
                    value={filters.ageRange} 
                    onValueChange={(v) => setFilters({ ...filters, ageRange: v })}
                  >
                    {AGE_OPTIONS.map(opt => (
                      <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Tier */}
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Membership Tier
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup 
                    value={filters.tier} 
                    onValueChange={(v) => setFilters({ ...filters, tier: v as Tier | 'all' })}
                  >
                    {TIER_OPTIONS.map(opt => (
                      <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Checkboxes */}
                  <DropdownMenuCheckboxItem
                    checked={filters.showVerified}
                    onCheckedChange={(v) => setFilters({ ...filters, showVerified: !!v })}
                  >
                    Verified Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.showOnline}
                    onCheckedChange={(v) => setFilters({ ...filters, showOnline: !!v })}
                  >
                    Online Now
                  </DropdownMenuCheckboxItem>
                  
                  {activeFiltersCount > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearFilters} className="text-destructive">
                        Clear All Filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Sort</span>
                    <ChevronDown className="w-3 h-3 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup 
                    value={filters.sortBy} 
                    onValueChange={(v) => setFilters({ ...filters, sortBy: v })}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode Toggle */}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Refresh Button */}
              <Button 
                variant="outline" 
                className="h-12"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-6 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Advanced Filters</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Denomination */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Denomination</label>
                    <select
                      value={filters.denomination}
                      onChange={(e) => setFilters({ ...filters, denomination: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {DENOMINATIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Age Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Age Range</label>
                    <select
                      value={filters.ageRange}
                      onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {AGE_OPTIONS.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tier */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tier</label>
                    <select
                      value={filters.tier}
                      onChange={(e) => setFilters({ ...filters, tier: e.target.value as Tier | 'all' })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {TIER_OPTIONS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {SORT_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showVerified}
                      onChange={(e) => setFilters({ ...filters, showVerified: e.target.checked })}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm text-foreground">Verified Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showOnline}
                      onChange={(e) => setFilters({ ...filters, showOnline: e.target.checked })}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm text-foreground">Online Now</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Advanced Filters */}
          <div className="mt-4">
            <Button 
              variant="link" 
              className="p-0 h-auto text-muted-foreground"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Advanced Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-5 h-5" />
                  Loading profiles...
                </span>
              ) : (
                `${filteredUsers.length} Profile${filteredUsers.length !== 1 ? 's' : ''} Found`
              )}
            </h2>
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <button onClick={() => setFilters({ ...filters, search: '' })}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner className="w-12 h-12 mb-4" />
            <p className="text-muted-foreground">Finding your perfect matches...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredUsers.length === 0 && (
          <Empty className="min-h-[400px]">
            <EmptyMedia variant="icon">
              <Search className="w-10 h-10" />
            </EmptyMedia>
            <EmptyTitle>No profiles found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your filters or search criteria to find more matches.
            </EmptyDescription>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
          </Empty>
        )}

        {/* Grid View */}
        {!isLoading && filteredUsers.length > 0 && viewMode === 'grid' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => handleProfileClick(user)}
                >
                  <ProfileCard user={user} index={index} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* List View */}
        {!isLoading && filteredUsers.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-6 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => handleProfileClick(user)}
              >
                {/* Avatar */}
                <div className="relative w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">{user.avatar}</span>
                  {user.lastActive === 'now' && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {user.name}, {user.age}
                    </h3>
                    {user.isVerified && (
                      <Award className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {user.tier}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {user.bio}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.location.city}, {user.location.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {user.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {user.likes} likes
                    </span>
                    {user.denomination && (
                      <Badge variant="secondary" className="text-xs">
                        {user.denomination}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-24">
                    View
                  </Button>
                  <Button size="sm" className="w-24 bg-secondary hover:bg-secondary/90">
                    <Heart className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Profile Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedProfile.name}, {selectedProfile.age}
                  {selectedProfile.isVerified && (
                    <Award className="w-5 h-5 text-green-500" />
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedProfile.denomination} • {selectedProfile.career}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Avatar */}
                <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-6xl">{selectedProfile.avatar}</span>
                  <div 
                    className="absolute bottom-0 right-0 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: selectedProfile.tier === 'Bronze' ? '#CD7F32' :
                        selectedProfile.tier === 'Silver' ? '#C0C0C0' :
                        selectedProfile.tier === 'Gold' ? '#FFD700' :
                        selectedProfile.tier === 'Platinum' ? '#E5E4E2' : '#B9F2FF',
                      color: '#000'
                    }}
                  >
                    {selectedProfile.tier}
                  </div>
                </div>

                {/* Bio */}
                <div className="text-center">
                  <p className="text-muted-foreground">{selectedProfile.bio}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                    <p className="font-medium">{selectedProfile.location.city}, {selectedProfile.location.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Distance</p>
                    <p className="font-medium">{selectedProfile.distance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Church</p>
                    <p className="font-medium">{selectedProfile.church?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Branch</p>
                    <p className="font-medium">{selectedProfile.church?.branch}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide"></p>
                    <p className="font-medium">{selectedProfile.likes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Active</p>
                    <p className="font-medium">{selectedProfile.lastActive}</p>
                  </div>
                </div>

                {/* Interests */}
                {selectedProfile.interests && selectedProfile.interests.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.interests.map(interest => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
