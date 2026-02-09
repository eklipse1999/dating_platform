'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Sparkles, ChevronRight, 
  Calendar, MapPin, Heart, MessageCircle, Crown
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { TierBadge } from '@/components/tier-badge';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';

interface SuggestedUserCardProps {
  user: User;
  onFollow: () => void;
  isFollowing: boolean;
}

function SuggestedUserCard({ user, onFollow, isFollowing }: SuggestedUserCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
      <Link href={`/profile/${user.id}`} className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
          <span className="text-lg">{user.avatar}</span>
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.id}`}>
          <h4 className="font-medium text-muted-foreground text-sm truncate hover:text-primary transition-colors">
            {user.name}, {user.age}
          </h4>
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{user.location.city}</span>
        </div>
      </div>
      <Button
        variant={isFollowing ? 'default' : 'outline'}
        size="sm"
        className={`flex-shrink-0 ${isFollowing ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' : ''}`}
        onClick={onFollow}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
}

interface TrendingTopicProps {
  topic: string;
  count: number;
  category: string;
}

function TrendingTopic({ topic, count, category }: TrendingTopicProps) {
  return (
    <div className="p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{category}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <h4 className="font-medium text-muted-foreground text-sm mt-1">{topic}</h4>
      <span className="text-xs text-muted-foreground">{count.toLocaleString()} discussions</span>
    </div>
  );
}

export function RightSidebar() {
  const { users, toggleFollow, isFollowing, currentUser } = useApp();

  if (!currentUser) return null;

  // Get suggested users (different tier or location)
  const suggestedUsers = users
    .filter(u => u.id !== currentUser.id)
    .slice(0, 5);

  // Get premium users
  const premiumUsers = users
    .filter(u => u.tier === 'Diamond' || u.tier === 'Platinum')
    .slice(0, 3);

  const trendingTopics = [
    { topic: 'Faith & Dating', count: 2340, category: 'Trending in Faith' },
    { topic: 'First Date Ideas', count: 1890, category: 'Dating Tips' },
    { topic: 'Long Distance Love', count: 1456, category: 'Relationships' },
  ];

  const upcomingEvents = [
    { title: 'Virtual Singles Mixer', date: 'Feb 14, 2026', attendees: 234 },
    { title: 'Faith & Love Workshop', date: 'Feb 20, 2026', attendees: 156 },
  ];

  return (
    <aside className="fixed right-0 top-0 h-screen w-80 bg-card border-l border-border overflow-y-auto z-40">
      <div className="p-4 space-y-6">
        {/* Suggested Connections */}
        <div className="bg-muted/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Suggested for You
            </h3>
            <Link href="/discover" className="text-xs text-primary hover:underline transition-all hover:shadow-[0_0_10px_rgba(139,92,246,0.3)] px-2 py-1 rounded">
              See all
            </Link>
          </div>
          <div className="space-y-1">
            {suggestedUsers.map((user) => (
              <SuggestedUserCard
                key={user.id}
                user={user}
                onFollow={() => toggleFollow(user.id)}
                isFollowing={isFollowing(user.id)}
              />
            ))}
          </div>
        </div>

        {/* Premium Members */}
        <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-4 border border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-gold" />
              Premium Members
            </h3>
          </div>
          <div className="space-y-3">
            {premiumUsers.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gold/10 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full flex items-center justify-center">
                    <span className="text-sm">{user.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-muted-foreground text-sm truncate">{user.name}</h4>
                    <TierBadge tier={user.tier} size="sm" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="bg-muted/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Trending Topics
            </h3>
          </div>
          <div className="space-y-1">
            {trendingTopics.map((topic) => (
              <TrendingTopic key={topic.topic} {...topic} />
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-muted/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Upcoming Events
            </h3>
            <Link href="/events" className="text-xs text-primary hover:underline transition-all hover:shadow-[0_0_10px_rgba(139,92,246,0.3)] px-2 py-1 rounded">
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.title} className="p-3 bg-card rounded-xl border border-border">
                <h4 className="font-medium text-muted-foreground text-sm">{event.title}</h4>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{event.date}</span>
                  <span>{event.attendees} attending</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Interested
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-muted/30 rounded-2xl p-4">
          <h3 className="font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Your Activity
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-card rounded-xl text-center">
              <div className="text-2xl font-bold text-muted-foreground">12</div>
              <div className="text-xs text-muted-foreground">Profile Views</div>
            </div>
            <div className="p-3 bg-card rounded-xl text-center">
              <div className="text-2xl font-bold text-muted-foreground">5</div>
              <div className="text-xs text-muted-foreground">New Matches</div>
            </div>
            <div className="p-3 bg-card rounded-xl text-center">
              <div className="text-2xl font-bold text-muted-foreground">8</div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </div>
            <div className="p-3 bg-card rounded-xl text-center">
              <div className="text-2xl font-bold text-muted-foreground">3</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <Link href="/about" className="hover:underline">About</Link>
            <span>•</span>
            <Link href="/help" className="hover:underline">Help</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
          <p>© 2026 Committed. All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
}
