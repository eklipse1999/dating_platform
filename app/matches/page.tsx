'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MapPin, Clock, Search, X, Users, Loader2, UserX, Star } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/app-context';
import { matchesService } from '@/lib/api/services/matches.service';
import { toast } from 'sonner';
import Link from 'next/link';

interface MatchUser {
  id: string;
  name: string;
  age?: number;
  avatar?: string;
  bio?: string;
  location?: { city?: string; country?: string };
  tier?: string;
  isOnline?: boolean;
  matchedAt?: Date;
}

const TABS = [
  { id: 'all', label: 'All Matches' },
  { id: 'online', label: 'Online Now' },
  { id: 'recent', label: 'Recent' },
] as const;
type TabId = typeof TABS[number]['id'];

export default function MatchesPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, isAdmin } = useApp();
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [likedBack, setLikedBack] = useState<Set<string>>(new Set());

  useEffect(() => { if (isAdmin) router.push('/admin'); }, [isAdmin, router]);
  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // Try mutual matches first, then like matches
        // GET /like/matches requires { liked_id: currentUserId } in body
        let data = await matchesService.getMatches(currentUser?.id);
        if (!data?.length) data = await matchesService.getLikeMatches();
        if (data?.length > 0) {
          setMatches(data.map((m: any) => ({
            id: m.id || m.userId || m.matchedUserId,
            name: m.user?.name || m.name || 'Unknown',
            age: m.user?.age || m.age,
            avatar: m.user?.avatar || m.avatar || '👤',
            bio: m.user?.bio || m.bio,
            location: m.user?.location || m.location,
            tier: m.user?.tier || m.tier || 'Bronze',
            isOnline: m.user?.isOnline ?? Math.random() > 0.5,
            matchedAt: new Date(m.matchedAt || m.createdAt || Date.now()),
          })));
        }
      } catch {
        // Leave empty — show empty state
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  if (!isAuthenticated || !currentUser) return null;

  const filtered = matches
    .filter(m => {
      if (activeTab === 'online') return m.isOnline;
      if (activeTab === 'recent') {
        const threeDays = new Date(Date.now() - 3 * 86400000);
        return m.matchedAt && m.matchedAt > threeDays;
      }
      return true;
    })
    .filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleUnmatch = async (userId: string, name: string) => {
    try {
      await matchesService.unlikeUser(userId);
      setMatches(prev => prev.filter(m => m.id !== userId));
      toast.info(`Unmatched from ${name}`);
    } catch {
      toast.error('Failed to unmatch');
    }
  };

  const handleSuperLike = (userId: string, name: string) => {
    setLikedBack(prev => new Set(prev).add(userId));
    toast.success(`Super liked ${name}! ⭐`);
  };

  const daysAgo = (date?: Date) => {
    if (!date) return '';
    const d = Math.floor((Date.now() - date.getTime()) / 86400000);
    return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`;
  };

  return (
    <DashboardLayout showRightSidebar={false}>
      <div className="w-full px-4 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-foreground font-serif mb-1">Your Matches 💕</h1>
          <p className="text-muted-foreground text-sm">
            {matches.length > 0 ? `${matches.length} people you've connected with` : 'People you match with will appear here'}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border hover:bg-muted'}`}>
              {tab.label}
              {tab.id === 'online' && matches.filter(m => m.isOnline).length > 0 && (
                <span className="ml-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {matches.filter(m => m.isOnline).length}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search your matches…" className="pl-10 h-11 bg-card" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>
          )}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((user, i) => (
                <motion.div key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">

                  {/* Avatar */}
                  <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-7xl">{user.avatar || '👤'}</span>
                    )}
                    {user.isOnline && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />Online
                      </div>
                    )}
                    {/* Superlike button on hover */}
                    <motion.button
                      initial={{ opacity: 0 }} whileHover={{ scale: 1.1 }}
                      className="absolute top-3 right-3 p-1.5 bg-white/80 dark:bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleSuperLike(user.id, user.name)}>
                      <Star className={`w-4 h-4 ${likedBack.has(user.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    </motion.button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link href={`/profile/${user.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                            {user.name}{user.age ? `, ${user.age}` : ''}
                          </h3>
                        </Link>
                        {(user.location?.city || user.location?.country) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {[user.location.city, user.location.country].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                      {user.tier && <Badge variant="outline" className="text-xs shrink-0">{user.tier}</Badge>}
                    </div>

                    {user.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{user.bio}</p>}

                    {user.matchedAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Clock className="w-3 h-3" />Matched {daysAgo(user.matchedAt)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleUnmatch(user.id, user.name)}>
                        <UserX className="w-3.5 h-3.5 mr-1" />Pass
                      </Button>
                      <Link href={`/messages?user=${user.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                          <MessageCircle className="w-3.5 h-3.5 mr-1" />Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {searchQuery ? <Search className="w-9 h-9 text-muted-foreground" /> : <Heart className="w-9 h-9 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No matches found' : activeTab === 'online' ? 'No one online right now' : 'No matches yet'}
            </h3>
            <p className="text-muted-foreground text-sm mb-5">
              {searchQuery ? 'Try a different search term' : 'Start exploring to find your perfect match!'}
            </p>
            {!searchQuery && (
              <Link href="/discover">
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Users className="w-4 h-4 mr-2" />Discover People
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}