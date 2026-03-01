'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, MapPin, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-context';
import { User, TIER_RANGES } from '@/lib/types';

interface ProfileCardProps {
  user: User;
  index?: number;
}

// Safe fallback when backend returns null/undefined/lowercase tier
const DEFAULT_TIER_INFO = { icon: '🥉', color: '#CD7F32', min: 0, max: 500 };

export function ProfileCard({ user, index = 0 }: ProfileCardProps) {
  const { currentUser, toggleFollow, isFollowing, canMessage } = useApp();
  // Normalize tier casing — backend may return 'bronze' or null
  const rawTier = user.tier ?? 'Bronze';
  const normalizedTier = (rawTier.charAt(0).toUpperCase() + rawTier.slice(1).toLowerCase()) as keyof typeof TIER_RANGES;
  const tierInfo = TIER_RANGES[normalizedTier] ?? DEFAULT_TIER_INFO;
  const following = isFollowing(user.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:-translate-y-1"
    >
      {/* Avatar */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <span className="text-7xl">{user.avatar}</span>
        
        {/* Tier Badge */}
        <div 
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${tierInfo.color}20`, color: tierInfo.color }}
        >
          <span>{tierInfo.icon}</span>
          <span>{user.tier}</span>
        </div>

        {/* Verified Badge */}
        {user.isVerified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <Link href={`/profile/${user.id}`}>
              <h3 className="font-semibold text-muted-foreground hover:text-primary transition-colors">
{user.name || user.first_name || user.user_name || "User"}{user.age ? `, ${user.age}` : ""}
              </h3>
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{user.location?.city || user.location?.country || "Unknown"}</span>
              {user.distance && (
                <>
                  <span className="mx-1">•</span>
                  <span>{user.distance}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {user.bio}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={following ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 ${following ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]'}`}
            onClick={() => toggleFollow(user.id)}
          >
            <Heart className={`w-4 h-4 mr-1.5 ${following ? 'fill-current' : ''}`} />
            {following ? 'Following' : 'Follow'}
          </Button>
          
          {canMessage(user.id) || currentUser?.isAdmin ? (
            <Link href={`/messages?user=${user.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full bg-transparent hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Message
              </Button>
            </Link>
          ) : (
            <Link href="/upgrade" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-muted-foreground bg-transparent hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Lock className="w-4 h-4 mr-1.5" />
                Locked
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}