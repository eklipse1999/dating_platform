'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, UserPlus, Bell, Star, 
  Settings, Check, CheckCheck, Clock, Filter, Trash2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/app-context';

interface Notification {
  id: string;
  type: 'like' | 'message' | 'match' | 'visit' | 'verification';
  title: string;
  message: string;
  time: string;
  read: boolean;
  user?: {
    name: string;
    avatar: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Generate mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'like',
        title: 'New Like',
        message: 'Sarah Williams liked your profile',
        time: '2 minutes ago',
        read: false,
        user: { name: 'Sarah', avatar: '😊' },
      },
      {
        id: '2',
        type: 'message',
        title: 'New Message',
        message: 'Michael: Hey! I noticed we share similar interests...',
        time: '15 minutes ago',
        read: false,
        user: { name: 'Michael', avatar: '🙂' },
      },
      {
        id: '3',
        type: 'match',
        title: 'New Match!',
        message: 'You and Emily are now matched!',
        time: '1 hour ago',
        read: false,
        user: { name: 'Emily', avatar: '🌸' },
      },
      {
        id: '4',
        type: 'visit',
        title: 'Profile View',
        message: 'David viewed your profile',
        time: '2 hours ago',
        read: true,
        user: { name: 'David', avatar: '😎' },
      },
      {
        id: '5',
        type: 'verification',
        title: 'Verification Approved',
        message: 'Your ID verification has been approved',
        time: '1 day ago',
        read: true,
      },
      {
        id: '6',
        type: 'like',
        title: 'New Like',
        message: 'Jessica liked your profile',
        time: '2 days ago',
        read: true,
        user: { name: 'Jessica', avatar: '💜' },
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.read
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-primary" />;
      case 'match': return <UserPlus className="w-5 h-5 text-secondary" />;
      case 'visit': return <Bell className="w-5 h-5 text-muted-foreground" />;
      case 'verification': return <Star className="w-5 h-5 text-gold" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout showRightSidebar={false}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-muted-foreground font-serif mb-2">
              Notifications 🔔
            </h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            Unread ({unreadCount})
          </button>
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete ({selectedIds.size})
            </Button>
          )}
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className={`relative p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all ${
                    !notification.read ? 'border-l-4 border-l-secondary' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Selection checkbox */}
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification.id)}
                        onChange={() => toggleSelect(notification.id)}
                        className="w-5 h-5 rounded border-border cursor-pointer"
                      />
                    </div>

                    {/* Icon or Avatar */}
                    <div className="flex-shrink-0">
                      {notification.user ? (
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                          <span className="text-2xl">{notification.user.avatar}</span>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          {getIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-medium ${!notification.read ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-8"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-secondary rounded-full" />
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' 
                    ? 'All your notifications have been read' 
                    : 'When you get notifications, they will appear here'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
