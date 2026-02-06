'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Users, Heart, Search, Filter,
  Plus, ChevronRight, Tag, Bookmark, Share2, Video,
  Coffee, Utensils, Music, BookOpen, Building2, Sparkles,
  Star, Award, Globe, Flower
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/app-context';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  city: string;
  category: string;
  host: string;
  hostAvatar: string;
  attendees: number;
  maxAttendees: number;
  isVirtual: boolean;
  isFree: boolean;
  price?: number;
  image: string;
  tags: string[];
  isSponsored: boolean;
  distance?: string;
}

const categories = [
  { id: 'all', name: 'All Events', icon: Calendar },
  { id: 'worship', name: 'Worship', icon: Music },
  { id: 'fellowship', name: 'Fellowship', icon: Coffee },
  { id: 'study', name: 'Bible Study', icon: BookOpen },
  { id: 'social', name: 'Social', icon: Users },
  { id: 'dating', name: 'Dating Events', icon: Heart },
  { id: 'outdoor', name: 'Outdoor', icon: Flower },
  { id: 'workshop', name: 'Workshop', icon: Building2 },
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Sunday Worship Service',
    description: 'Join us for an inspiring worship service with contemporary music, heartfelt praise, and uplifting sermon.',
    date: new Date(Date.now() + 2 * 86400000),
    time: '10:00 AM',
    location: 'RCCG Redemption House',
    city: 'Lagos',
    category: 'worship',
    host: 'Pastor John',
    hostAvatar: '👨‍',
    attendees: 150,
    maxAttendees: 500,
    isVirtual: false,
    isFree: true,
    image: '/images/img1.jpg',
    tags: ['Worship', 'Praise', 'Fellowship'],
    isSponsored: false,
    distance: '2.5 km',
  },
  {
    id: '2',
    title: 'Young Singles Mixer',
    description: 'A relaxed evening for young singles to connect, network, and build meaningful relationships in a fun atmosphere.',
    date: new Date(Date.now() + 5 * 86400000),
    time: '6:00 PM',
    location: 'The Garden Cafe',
    city: 'Lagos',
    category: 'dating',
    host: 'Sarah M.',
    hostAvatar: '👩',
    attendees: 35,
    maxAttendees: 50,
    isVirtual: false,
    isFree: false,
    price: 1500,
    image: '/images/img15.jpg',
    tags: ['Dating', 'Social', 'Networking'],
    isSponsored: true,
    distance: '5.2 km',
  },
  {
    id: '3',
    title: 'Online Bible Study: Romans',
    description: 'Deep dive into the book of Romans with fellow believers. Interactive session with discussion questions.',
    date: new Date(Date.now() + 1 * 86400000),
    time: '7:00 PM',
    location: 'Zoom Meeting',
    city: 'Online',
    category: 'study',
    host: 'Dr. James',
    hostAvatar: '👨‍',
    attendees: 28,
    maxAttendees: 100,
    isVirtual: true,
    isFree: true,
    image: '/images/img59.jpg',
    tags: ['Bible Study', 'Online', 'Romans'],
    isSponsored: false,
  },
  {
    id: '4',
    title: 'Couples Retreat Registration',
    description: 'A weekend getaway for couples to strengthen their marriage through workshops, counseling, and quality time.',
    date: new Date(Date.now() + 14 * 86400000),
    time: '4:00 PM',
    location: 'Lagos Continental Hotel',
    city: 'Lagos',
    category: 'social',
    host: 'Marriage Prep Team',
    hostAvatar: '👫',
    attendees: 12,
    maxAttendees: 30,
    isVirtual: false,
    isFree: false,
    price: 25000,
    image: '/images/img72.jpg',
    tags: ['Couples', 'Retreat', 'Marriage'],
    isSponsored: true,
    distance: '12.8 km',
  },
  {
    id: '5',
    title: 'Praise & Worship Night',
    description: 'An evening of uninterrupted worship, prayer, and encountering God\'s presence through music.',
    date: new Date(Date.now() + 7 * 86400000),
    time: '8:00 PM',
    location: 'Winners Chapel',
    city: 'Abuja',
    category: 'worship',
    host: 'Worship Team',
    hostAvatar: '🎵',
    attendees: 200,
    maxAttendees: 1000,
    isVirtual: false,
    isFree: true,
    image: '/images/img82.jpg',
    tags: ['Worship', 'Prayer', 'Music'],
    isSponsored: false,
    distance: '25.0 km',
  },
  {
    id: '6',
    title: 'Speed Dating Christian Edition',
    description: 'Meet like-minded singles in a fun, relaxed speed dating event designed specifically for Christians.',
    date: new Date(Date.now() + 10 * 86400000),
    time: '5:00 PM',
    location: 'The Palazzo Hotel',
    city: 'Lagos',
    category: 'dating',
    host: 'Committed Events',
    hostAvatar: '💕',
    attendees: 24,
    maxAttendees: 40,
    isVirtual: false,
    isFree: false,
    price: 3000,
    image: '/images/img97.jpg',
    tags: ['Dating', 'Singles', 'Speed Dating'],
    isSponsored: true,
    distance: '8.3 km',
  },
];

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [filterDate, setFilterDate] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || event.category === activeCategory;
    
    let matchesDate = true;
    if (filterDate === 'today') {
      matchesDate = event.date.toDateString() === new Date().toDateString();
    } else if (filterDate === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      matchesDate = event.date >= new Date() && event.date <= weekFromNow;
    }
    
    let matchesType = true;
    if (filterType === 'virtual') matchesType = event.isVirtual;
    if (filterType === 'in-person') matchesType = !event.isVirtual;
    if (filterType === 'free') matchesType = event.isFree;
    
    return matchesSearch && matchesCategory && matchesDate && matchesType;
  });

  const toggleSaveEvent = (eventId: string) => {
    setSavedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const formatEventDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="w-screen max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-accent font-serif mb-2">
                Discover Events
              </h1>
              <p className="text-muted-foreground">
                Find worship services, social gatherings, and dating events near you.
              </p>
            </div>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events, locations, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-primary-foreground' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 bg-card rounded-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-accent">Filter Events</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                Close
              </Button>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Date</label>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">Any Date</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="free">Free Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => c.id !== 'all').map(cat => (
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
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-accent">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </h2>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-border">
                  {/* Event Image */}
                  <div className="relative h-40 bg-gradient-to-br from-primary/10 to-secondary/10">
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      {event.category === 'worship' ? '🎵' : 
                       event.category === 'dating' ? '💕' : 
                       event.category === 'study' ? '📖' : 
                       event.category === 'social' ? '👥' : '📅'}
                    </div>
                    {event.isSponsored && (
                      <Badge className="absolute top-3 left-3 bg-secondary">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Sponsored
                      </Badge>
                    )}
                    {event.isVirtual && (
                      <Badge className="absolute top-3 right-3 bg-blue-500">
                        <Video className="w-3 h-3 mr-1" />
                        Virtual
                      </Badge>
                    )}
                    <button
                      onClick={() => toggleSaveEvent(event.id)}
                      className="absolute top-3 right-20 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <Bookmark className={`w-4 h-4 ${savedEvents.includes(event.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Date Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-secondary border-secondary">
                        {formatEventDate(event.date)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-bold text-accent mb-2 line-clamp-1">{event.title}</h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {event.description}
                    </p>
                    
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                      {event.distance && (
                        <span className="text-xs">• {event.distance}</span>
                      )}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {event.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                          <span className="text-lg">{event.hostAvatar}</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Hosted by</p>
                          <p className="text-sm font-medium text-accent">{event.host}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {event.isFree ? (
                          <span className="text-sm font-semibold text-green-500">Free</span>
                        ) : (
                          <span className="text-sm font-semibold text-accent">
                            ₦{event.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Attendees */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees}/{event.maxAttendees} attending</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                          <Heart className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setFilterDate('all');
                setFilterType('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Featured Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold text-accent font-serif mb-6">
            <Sparkles className="w-5 h-5 inline mr-2 text-secondary" />
            Featured Events
          </h2>
          
          <div className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-border">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 text-center lg:text-left">
                <Badge className="mb-3">Featured Event</Badge>
                <h3 className="text-2xl font-bold text-accent mb-2">
                  Christian Singles Conference 2024
                </h3>
                <p className="text-muted-foreground mb-4">
                  The largest gathering of Christian singles in Nigeria. Network, worship, 
                  and connect with thousands of like-minded believers.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    March 15-17, 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Eko Convention Center, Lagos
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    2,500+ attendees
                  </span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <Button className="bg-secondary hover:bg-secondary/90">
                    Register Now
                  </Button>
                  <Button variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                  <span className="text-8xl">🎪</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}