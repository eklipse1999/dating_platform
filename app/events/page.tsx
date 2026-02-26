'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Heart, Search, Filter,
  Plus, Bookmark, Share2, Video, Coffee, Music,
  BookOpen, Building2, Sparkles, Flower, Loader2, X, CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/app-context';
import { eventsService } from '@/lib/api/services/events.service';
import { toast } from 'sonner';

interface UIEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  location: string;
  city?: string;
  category?: string;
  host?: string;
  hostAvatar?: string;
  attendees?: number;
  maxAttendees?: number;
  isVirtual?: boolean;
  isFree?: boolean;
  price?: number;
  tags?: string[];
  isSponsored?: boolean;
  distance?: string;
}

const categories = [
  { id: 'all', name: 'All', icon: Calendar },
  { id: 'worship', name: 'Worship', icon: Music },
  { id: 'fellowship', name: 'Fellowship', icon: Coffee },
  { id: 'study', name: 'Bible Study', icon: BookOpen },
  { id: 'social', name: 'Social', icon: Users },
  { id: 'dating', name: 'Dating', icon: Heart },
  { id: 'outdoor', name: 'Outdoor', icon: Flower },
  { id: 'workshop', name: 'Workshop', icon: Building2 },
];

const MOCK_EVENTS: UIEvent[] = [
  { id: '1', title: 'Sunday Worship Service', description: 'Join us for an inspiring worship service with contemporary music, heartfelt praise, and an uplifting sermon.', date: new Date(Date.now() + 2 * 86400000), time: '10:00 AM', location: 'RCCG Redemption House', city: 'Lagos', category: 'worship', host: 'Pastor John', hostAvatar: '👨‍💼', attendees: 150, maxAttendees: 500, isVirtual: false, isFree: true, tags: ['Worship', 'Praise', 'Fellowship'], isSponsored: false, distance: '2.5 km' },
  { id: '2', title: 'Young Singles Mixer', description: 'A relaxed evening for young singles to connect, network, and build meaningful relationships in a fun atmosphere.', date: new Date(Date.now() + 5 * 86400000), time: '6:00 PM', location: 'The Garden Cafe', city: 'Lagos', category: 'dating', host: 'Sarah M.', hostAvatar: '👩', attendees: 35, maxAttendees: 50, isVirtual: false, isFree: false, price: 1500, tags: ['Dating', 'Social', 'Networking'], isSponsored: true, distance: '5.2 km' },
  { id: '3', title: 'Online Bible Study: Romans', description: 'Deep dive into the book of Romans with fellow believers. Interactive session with discussion questions.', date: new Date(Date.now() + 1 * 86400000), time: '7:00 PM', location: 'Zoom Meeting', city: 'Online', category: 'study', host: 'Dr. James', hostAvatar: '📖', attendees: 28, maxAttendees: 100, isVirtual: true, isFree: true, tags: ['Bible Study', 'Online', 'Romans'], isSponsored: false },
  { id: '4', title: 'Couples Retreat Registration', description: 'A weekend getaway for couples to strengthen their marriage through workshops, counseling, and quality time.', date: new Date(Date.now() + 14 * 86400000), time: '4:00 PM', location: 'Lagos Continental Hotel', city: 'Lagos', category: 'social', host: 'Marriage Prep Team', hostAvatar: '👫', attendees: 12, maxAttendees: 30, isVirtual: false, isFree: false, price: 25000, tags: ['Couples', 'Retreat', 'Marriage'], isSponsored: true, distance: '12.8 km' },
  { id: '5', title: 'Praise & Worship Night', description: 'An evening of uninterrupted worship, prayer, and encountering God\'s presence through music.', date: new Date(Date.now() + 7 * 86400000), time: '8:00 PM', location: 'Winners Chapel', city: 'Abuja', category: 'worship', host: 'Worship Team', hostAvatar: '🎵', attendees: 200, maxAttendees: 1000, isVirtual: false, isFree: true, tags: ['Worship', 'Prayer', 'Music'], isSponsored: false, distance: '25.0 km' },
  { id: '6', title: 'Speed Dating Christian Edition', description: 'Meet like-minded singles in a fun, relaxed speed dating event designed specifically for Christians.', date: new Date(Date.now() + 10 * 86400000), time: '5:00 PM', location: 'The Palazzo Hotel', city: 'Lagos', category: 'dating', host: 'Committed Events', hostAvatar: '💕', attendees: 24, maxAttendees: 40, isVirtual: false, isFree: false, price: 3000, tags: ['Dating', 'Singles', 'Speed Dating'], isSponsored: true, distance: '8.3 km' },
];

const CATEGORY_EMOJI: Record<string, string> = { worship: '🎵', dating: '💕', study: '📖', social: '👥', fellowship: '☕', outdoor: '🌿', workshop: '🏢' };

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, isAdmin } = useApp();
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());
  const [filterDate, setFilterDate] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', maxAttendees: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { if (isAdmin) router.push('/admin'); }, [isAdmin, router]);
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await eventsService.getEvents();
        if (data?.length > 0) {
          setEvents(data.map((e: any) => ({ ...e, date: new Date(e.date), isFree: !e.price || e.price === 0, tags: e.tags || [], category: e.category || 'social' })));
        } else {
          setEvents(MOCK_EVENTS);
        }
      } catch {
        setEvents(MOCK_EVENTS);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (!isAuthenticated || !currentUser) return null;

  const filtered = events.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchQ = e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || (e.tags || []).some(t => t.toLowerCase().includes(q));
    const matchCat = activeCategory === 'all' || e.category === activeCategory;
    const today = new Date(); const week = new Date(); week.setDate(week.getDate() + 7);
    const matchDate = filterDate === 'today' ? new Date(e.date).toDateString() === today.toDateString()
      : filterDate === 'week' ? e.date >= today && e.date <= week : true;
    const matchType = filterType === 'virtual' ? !!e.isVirtual : filterType === 'in-person' ? !e.isVirtual : filterType === 'free' ? !!e.isFree : true;
    return matchQ && matchCat && matchDate && matchType;
  });

  const formatDate = (date: Date) => {
    const today = new Date(); const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
    if (new Date(date).toDateString() === today.toDateString()) return 'Today';
    if (new Date(date).toDateString() === tmr.toDateString()) return 'Tomorrow';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleJoin = async (e: UIEvent) => {
    const joined = joinedEvents.has(e.id);
    try { joined ? await eventsService.leaveEvent(e.id) : await eventsService.joinEvent(e.id); } catch {}
    setJoinedEvents(prev => { const n = new Set(prev); joined ? n.delete(e.id) : n.add(e.id); return n; });
    toast[joined ? 'info' : 'success'](joined ? `Left "${e.title}"` : `Joined "${e.title}"! 🎉`);
  };

  const handleCreate = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) { toast.error('Title, date and location are required'); return; }
    setIsCreating(true);
    try {
      const created = await eventsService.createEvent({ title: newEvent.title, description: newEvent.description, date: new Date(newEvent.date), location: newEvent.location, maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined });
      setEvents(prev => [{ ...created, date: new Date(created.date), isFree: true, tags: [], category: 'social', attendees: 0 } as UIEvent, ...prev]);
      toast.success('Event created!');
      setShowCreateModal(false);
      setNewEvent({ title: '', description: '', date: '', location: '', maxAttendees: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally { setIsCreating(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif mb-1">Discover Events</h1>
            <p className="text-muted-foreground text-sm">Find worship services, social gatherings, and dating events near you.</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0">
            <Plus className="w-4 h-4 mr-2" />Create Event
          </Button>
        </motion.div>

        {/* Search + Filter toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events, locations, topics…" className="pl-10 h-11 bg-card" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-primary text-primary-foreground border-primary' : ''}>
            <Filter className="w-4 h-4 mr-2" />Filters
          </Button>
        </motion.div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <div className="p-5 bg-card rounded-2xl border border-border grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Date', value: filterDate, set: setFilterDate, opts: [['all', 'Any Date'], ['today', 'Today'], ['week', 'This Week']] },
                  { label: 'Type', value: filterType, set: setFilterType, opts: [['all', 'All Types'], ['in-person', 'In-Person'], ['virtual', 'Virtual'], ['free', 'Free Only']] },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">{f.label}</label>
                    <select value={f.value} onChange={e => f.set(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                      {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={() => { setFilterDate('all'); setFilterType('all'); setSearchQuery(''); setActiveCategory('all'); }}>Clear all</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map(cat => (
            <motion.button key={cat.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border hover:bg-muted'}`}>
              <cat.icon className="w-3.5 h-3.5" />{cat.name}
            </motion.button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-5">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                {/* Banner */}
                <div className="relative h-36 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="text-6xl opacity-50">{CATEGORY_EMOJI[event.category || ''] || '📅'}</span>
                  {event.isSponsored && <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs"><Sparkles className="w-3 h-3 mr-1" />Sponsored</Badge>}
                  {event.isVirtual && <Badge className="absolute top-3 right-12 bg-blue-500 text-white text-xs"><Video className="w-3 h-3 mr-1" />Virtual</Badge>}
                  <button onClick={() => setSavedEvents(prev => { const n = new Set(prev); n.has(event.id) ? n.delete(event.id) : n.add(event.id); return n; })}
                    className="absolute top-3 right-3 p-1.5 bg-white/80 dark:bg-black/40 rounded-full hover:scale-110 transition-transform">
                    <Bookmark className={`w-4 h-4 ${savedEvents.has(event.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-secondary border-secondary text-xs">{formatDate(event.date)}</Badge>
                    {event.time && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                    {event.distance && <span className="shrink-0">• {event.distance}</span>}
                  </div>
                  {(event.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(event.tags || []).slice(0, 3).map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      {event.hostAvatar && <span className="text-lg">{event.hostAvatar}</span>}
                      {event.host && <span className="text-xs text-muted-foreground">{event.host}</span>}
                    </div>
                    <span className={`text-sm font-semibold ${event.isFree ? 'text-green-500' : 'text-foreground'}`}>
                      {event.isFree ? 'Free' : `₦${(event.price || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {event.attendees != null && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />{event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attending
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info('Share link copied!')}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleJoin(event)}
                        className={joinedEvents.has(event.id) ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'}>
                        {joinedEvents.has(event.id) ? <><CheckCircle className="w-3.5 h-3.5 mr-1" />Joined</> : <><Heart className="w-3.5 h-3.5 mr-1" />Join</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Calendar className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="font-semibold text-foreground mb-2">No events found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('all'); setFilterDate('all'); setFilterType('all'); }}>Clear filters</Button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-foreground">Create New Event</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title *</label>
                  <Input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Event title" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} placeholder="Tell people about your event…" rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date & Time *</label>
                    <Input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Max Attendees</label>
                    <Input type="number" min="1" value={newEvent.maxAttendees} onChange={e => setNewEvent(p => ({ ...p, maxAttendees: e.target.value }))} placeholder="e.g. 50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Location *</label>
                  <Input value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Lagos, Nigeria or Zoom link" />
                </div>
                <Button onClick={handleCreate} disabled={isCreating} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-11">
                  {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</> : 'Create Event'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}