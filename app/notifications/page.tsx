'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, UserPlus, Bell, Star,
  Check, CheckCheck, Trash2, Settings, Filter
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/app-context';
import { toast } from 'sonner';
import Link from 'next/link';

type NotifType = 'like' | 'message' | 'match' | 'visit' | 'verification' | 'event';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  user?: { name: string; avatar: string };
}

const MOCK: Notification[] = [
  { id: '1', type: 'match', title: 'New Match! 💕', message: 'You and Emily matched! Start a conversation.', time: '2 minutes ago', read: false, actionUrl: '/messages', user: { name: 'Emily', avatar: '🌸' } },
  { id: '2', type: 'like', title: 'New Like', message: 'Sarah liked your profile.', time: '15 minutes ago', read: false, actionUrl: '/discover', user: { name: 'Sarah', avatar: '😊' } },
  { id: '3', type: 'message', title: 'New Message', message: 'Michael: "Hey! I noticed we share similar interests…"', time: '1 hour ago', read: false, actionUrl: '/messages', user: { name: 'Michael', avatar: '🙂' } },
  { id: '4', type: 'visit', title: 'Profile View', message: 'David viewed your profile.', time: '2 hours ago', read: true, user: { name: 'David', avatar: '😎' } },
  { id: '5', type: 'like', title: 'New Like', message: 'Jessica liked your profile.', time: '5 hours ago', read: true, user: { name: 'Jessica', avatar: '💜' } },
  { id: '6', type: 'event', title: 'Event Reminder', message: 'Young Singles Mixer starts in 2 hours.', time: '4 hours ago', read: true, actionUrl: '/events' },
  { id: '7', type: 'verification', title: 'Verification Update', message: 'Your ID document has been received and is under review.', time: '1 day ago', read: true },
  { id: '8', type: 'match', title: 'New Match! 💕', message: 'You and Grace matched! Send her a message.', time: '2 days ago', read: true, actionUrl: '/messages', user: { name: 'Grace', avatar: '🌺' } },
];

const TYPE_CONFIG: Record<NotifType, { icon: React.FC<any>; color: string; bg: string }> = {
  like:         { icon: Heart,        color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950/30' },
  message:      { icon: MessageCircle,color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
  match:        { icon: UserPlus,     color: 'text-secondary',  bg: 'bg-secondary/10' },
  visit:        { icon: Bell,         color: 'text-muted-foreground', bg: 'bg-muted' },
  verification: { icon: Star,         color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  event:        { icon: Bell,         color: 'text-primary',    bg: 'bg-primary/10' },
};

type FilterType = 'all' | 'unread' | 'likes' | 'messages' | 'matches';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, currentUser, isAdmin } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { if (isAdmin) router.push('/admin'); }, [isAdmin, router]);
  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isAuthenticated, isLoading, router]);
  useEffect(() => { setNotifications(MOCK); }, []);

  if (!isAuthenticated || !currentUser) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'likes') return n.type === 'like';
    if (filter === 'messages') return n.type === 'message';
    if (filter === 'matches') return n.type === 'match';
    return true;
  });

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); toast.success('All marked as read'); };
  const remove = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const removeSelected = () => { setNotifications(prev => prev.filter(n => !selected.has(n.id))); setSelected(new Set()); toast.success('Deleted'); };
  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const FILTER_TABS: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { id: 'matches', label: 'Matches' },
    { id: 'likes', label: 'Likes' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <DashboardLayout showRightSidebar={false}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif mb-1">Notifications 🔔</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {selected.size > 0 ? (
              <Button variant="destructive" size="sm" onClick={removeSelected}>
                <Trash2 className="w-4 h-4 mr-1" />Delete ({selected.size})
              </Button>
            ) : unreadCount > 0 ? (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck className="w-4 h-4 mr-1" />Mark all read
              </Button>
            ) : null}
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === tab.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border hover:bg-muted'}`}>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* List */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.length > 0 ? filtered.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type];
              const Icon = cfg.icon;
              return (
                <motion.div key={n.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ delay: i * 0.03 }}
                  className={`relative p-4 bg-card rounded-2xl border transition-all cursor-pointer group ${!n.read ? 'border-l-4 border-l-secondary border-border' : 'border-border hover:border-primary/20'}`}
                  onClick={() => markRead(n.id)}>

                  <div className="flex items-start gap-3">
                    {/* Checkbox on hover/selected */}
                    <div className="flex-shrink-0 mt-0.5">
                      <input type="checkbox" checked={selected.has(n.id)} onChange={() => toggleSelect(n.id)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 rounded border-border cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity checked:opacity-100" />
                    </div>

                    {/* Avatar or icon */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      {n.user ? (
                        <span className="text-2xl">{n.user.avatar}</span>
                      ) : (
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{n.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>

                      <div className="flex items-center gap-2 mt-2">
                        {n.actionUrl && (
                          <Link href={n.actionUrl} onClick={e => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="h-7 text-xs">View</Button>
                          </Link>
                        )}
                        {!n.read && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={e => { e.stopPropagation(); markRead(n.id); }}>
                            <Check className="w-3 h-3 mr-1" />Mark read
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => { e.stopPropagation(); remove(n.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.read && <div className="absolute top-4 right-4 w-2 h-2 bg-secondary rounded-full" />}
                </motion.div>
              );
            }) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Bell className="w-8 h-8 text-muted-foreground" /></div>
                <h3 className="font-semibold text-foreground mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filter !== 'all' ? 'Switch to "All" to see everything' : 'Notifications will appear here when you get activity'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}