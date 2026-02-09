'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bookmark, Heart, MessageCircle, MapPin, Clock, Trash2, Share2 } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/app-context';
import Link from 'next/link';

interface SavedItem {
  id: string;
  type: 'profile' | 'event' | 'article';
  user?: {
    id: string;
    name: string;
    age: number;
    avatar: string;
    location: string;
    bio: string;
  };
  title?: string;
  description?: string;
  savedAt: Date;
}

export default function SavedPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useApp();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'profiles' | 'events'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Generate mock saved items
    const mockSavedItems: SavedItem[] = [
      {
        id: '1',
        type: 'profile',
        user: {
          id: 'user-1',
          name: 'Sarah',
          age: 28,
          avatar: '😊',
          location: 'New York',
          bio: 'Passionate about faith and family...',
        },
        savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        type: 'profile',
        user: {
          id: 'user-2',
          name: 'Michael',
          age: 32,
          avatar: '🙂',
          location: 'Los Angeles',
          bio: 'Software engineer with a heart for missions...',
        },
        savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        type: 'event',
        title: 'Christian Singles Meetup',
        description: 'Join us for an evening of fellowship and networking...',
        savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '4',
        type: 'profile',
        user: {
          id: 'user-3',
          name: 'Emily',
          age: 26,
          avatar: '🌸',
          location: 'Chicago',
          bio: 'Church worship leader seeking a partner...',
        },
        savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: '5',
        type: 'profile',
        user: {
          id: 'user-4',
          name: 'David',
          age: 30,
          avatar: '😎',
          location: 'Houston',
          bio: 'Medical professional who loves travel...',
        },
        savedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];
    setSavedItems(mockSavedItems);
  }, []);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const filteredItems = savedItems.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'profiles') return item.type === 'profile';
    if (activeTab === 'events') return item.type === 'event';
    return true;
  });

  const removeItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-muted-foreground font-serif">Saved</h1>
            <span className="text-muted-foreground">{savedItems.length} items</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'profiles', label: 'Profiles' },
              { id: 'events', label: 'Events' },
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
          </div>

          {/* Saved Items */}
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all"
                >
                  {item.type === 'profile' && item.user ? (
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">{item.user.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/profile/${item.user.id}`}>
                              <h3 className="font-semibold text-muted-foreground hover:text-primary transition-colors">
                                {item.user.name}, {item.user.age}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.user.location}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {item.user.bio}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Link href={`/messages?user=${item.user.id}`}>
                            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </Link>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(item.savedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : item.type === 'event' && item.title ? (
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Bookmark className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-muted-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(item.savedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No saved items</h3>
              <p className="text-muted-foreground">
                {activeTab === 'all' 
                  ? 'Save profiles and events to see them here' 
                  : `No ${activeTab} saved yet`}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
