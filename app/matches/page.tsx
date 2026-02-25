'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, MapPin, Clock, CheckCircle, Filter, Search, X } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/app-context';
import Link from 'next/link';

export default function MatchesPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, getFilteredUsers, isAdmin } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'online' | 'popular'>('new');
  const [users, setUsers] = useState<any[]>([]);

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      getFilteredUsers({
        ageRange: [18, 50],
        tier: undefined,
      }).then(setUsers);
    }
  }, [isAuthenticated, router, getFilteredUsers]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  // Simulate matches - users with following status
  interface Match {
    id: string;
    name: string;
    age: number;
    avatar: string;
    bio?: string;
    location: {
      city?: string;
      country?: string;
    };
    tier: string;
    isFollowing: boolean;
    isOnline: boolean;
    matchedAt: Date;
  }

  interface UserWithMatchStatus extends Match {
    isFollowing: boolean;
    isOnline: boolean;
    matchedAt: Date;
  }

  const matches: UserWithMatchStatus[] = users.slice(0, 12).map(user => ({
    ...user,
    isFollowing: true,
    isOnline: Math.random() > 0.5,
    matchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  }));

  const filteredMatches = matches.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout showRightSidebar={false}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-muted-foreground font-serif mb-2">
            Your Matches 💕
          </h1>
          <p className="text-muted-foreground">
            People you've connected with and matched with
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {[
            { id: 'new', label: 'New' },
            { id: 'online', label: 'Online Now' },
            { id: 'popular', label: 'Popular' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card"
          />
        </motion.div>

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                {/* Avatar with online indicator */}
                <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="text-6xl">{user.avatar}</span>
                  {user.isOnline && (
                    <div className="absolute bottom-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link href={`/profile/${user.id}`}>
                        <h3 className="font-semibold text-muted-foreground hover:text-primary transition-colors">
                          {user.name}, {user.age}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{user.location.country || user.location.city || 'Unknown'}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.tier}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {user.bio}
                  </p>

                  {/* Match info */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Matched {Math.floor((Date.now() - user.matchedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Pass
                    </Button>
                    <Link href={`/messages?user=${user.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-4">Start exploring to find your perfect match!</p>
            <Link href="/discover">
              <Button>Discover People</Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
