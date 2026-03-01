'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, Lock, Calendar, CheckCircle, Shield, ArrowLeft,
  MessageCircle, MoreVertical, Phone, Video, Smile, Paperclip,
  Mic, Image as ImageIcon, Check, CheckCheck, Clock, X,
  Archive, BellOff, Bell, Trash2, Pin, Camera,
  Home, Compass, Heart, Bookmark, Settings, User as UserIcon, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { SafetyModal } from '@/components/messaging/safety-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useApp } from '@/lib/app-context';
import { containsDateKeywords, User } from '@/lib/types';
import { messagesService } from '@/lib/api/services/messages.service';
import { usersService } from '@/lib/api/services/users.service';
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  timestamp: Date;
}

interface Conversation {
  id: string;
  user: User;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  typing: boolean;
  online: boolean;
  lastSeen?: Date;
}

const MessageStatus = ({ status }: { status: Message['status'] }) => {
  if (status === 'sending') return <Clock className="w-3 h-3 text-muted-foreground" />;
  if (status === 'sent') return <Check className="w-3 h-3 text-muted-foreground" />;
  if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
  if (status === 'read') return <CheckCheck className="w-3 h-3 text-blue-500" />;
  return null;
};

function ConversationItem({ conversation, isSelected, onClick, onPin, onMute, onArchive }: {
  conversation: Conversation; isSelected: boolean;
  onClick: () => void; onPin: () => void; onMute: () => void; onArchive: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className={`relative group flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${isSelected ? 'bg-muted' : ''}`} onClick={onClick}>
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center overflow-hidden">
          {typeof conversation.user.avatar === 'string' && conversation.user.avatar.startsWith('http') ? (
            <img src={conversation.user.avatar} alt={conversation.user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{conversation.user.avatar || '👤'}</span>
          )}
        </div>
        {conversation.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h4 className="font-medium text-foreground truncate text-sm">{conversation.user.name}</h4>
            {conversation.isPinned && <Pin className="w-3 h-3 text-muted-foreground" />}
            {conversation.isMuted && <BellOff className="w-3 h-3 text-muted-foreground" />}
          </div>
          <span className={`text-xs ${conversation.unreadCount > 0 ? 'text-secondary font-medium' : 'text-muted-foreground'}`}>
            {conversation.lastMessage?.time || ''}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            {conversation.lastMessage?.sent && (
              conversation.lastMessage.status === 'read'
                ? <CheckCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                : <CheckCheck className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            )}
            {conversation.typing ? <span className="text-green-500 italic">typing…</span>
              : conversation.lastMessage?.text || 'Start a conversation'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-1 shrink-0">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setShowMenu(!showMenu)}>
          <MoreVertical className="w-3.5 h-3.5" />
        </Button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-36 bg-card rounded-xl border border-border shadow-lg py-1 z-50">
            {[
              { icon: Pin, label: conversation.isPinned ? 'Unpin' : 'Pin', action: onPin },
              { icon: conversation.isMuted ? Bell : BellOff, label: conversation.isMuted ? 'Unmute' : 'Mute', action: onMute },
              { icon: Archive, label: 'Archive', action: onArchive },
            ].map(item => (
              <button key={item.label} onClick={() => { item.action(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5" />{item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, currentUser, users = [], canMessage, canScheduleDates, accountAgeDays = 0, isAdmin, isLoading } = useApp();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'archived'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isAdmin) router.push('/admin'); }, [isAdmin, router]);
  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isAuthenticated, isLoading, router]);

  // Click outside to close pickers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputAreaRef.current && !inputAreaRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false); setShowMediaOptions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load conversations from API, fall back to users list
  useEffect(() => {
    const load = async () => {
      setIsLoadingConvs(true);
      try {
        const data = await messagesService.getConversations();
        if (data?.length > 0) {
          const convs: Conversation[] = data.map((c: any) => ({
            id: c.id || `conv-${c.user?.id || Math.random()}`,
            user: c.user || c,
            messages: (c.messages || []).map((m: any) => ({
              id: m.id, text: m.content || m.text, sent: m.senderId === currentUser?.id,
              time: new Date(m.createdAt || m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read' as const, timestamp: new Date(m.createdAt || m.timestamp),
            })),
            lastMessage: c.lastMessage ? {
              id: c.lastMessage.id, text: c.lastMessage.content || c.lastMessage.text,
              sent: c.lastMessage.senderId === currentUser?.id,
              time: new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read' as const, timestamp: new Date(c.lastMessage.createdAt),
            } : undefined,
            unreadCount: c.unreadCount || 0,
            isPinned: false, isMuted: false, isArchived: false, typing: false,
            online: c.user?.isOnline ?? false,
          }));
          setConversations(convs);
        } else if (users.length > 0) {
          // Build from users list
          setConversations(users.slice(0, 15).map((user, i) => ({
            id: `conv-${user.id}`, user,
            messages: i < 5 ? [{ id: `m-${user.id}`, text: 'Hi! I noticed we share similar interests. Would love to connect! 😊', sent: false, time: '10:30 AM', status: 'read' as const, timestamp: new Date(Date.now() - Math.random() * 86400000) }] : [],
            lastMessage: i < 5 ? { id: `m-${user.id}`, text: 'Hi! I noticed we share similar interests. Would love to connect! 😊', sent: false, time: '10:30 AM', status: 'read' as const, timestamp: new Date(Date.now() - Math.random() * 86400000) } : undefined,
            unreadCount: i < 3 ? Math.floor(Math.random() * 3) + 1 : 0,
            isPinned: i < 2, isMuted: false, isArchived: false,
            typing: i === 0, online: Math.random() > 0.5,
            lastSeen: new Date(Date.now() - Math.random() * 3600000),
          })));
        }
      } catch {
        if (users.length > 0) {
          setConversations(users.slice(0, 15).map((user, i) => ({
            id: `conv-${user.id}`, user, messages: [],
            unreadCount: i < 2 ? 1 : 0, isPinned: false, isMuted: false, isArchived: false,
            typing: false, online: Math.random() > 0.5,
          })));
        }
      } finally {
        setIsLoadingConvs(false);
      }
    };
    if (isAuthenticated) load();
  }, [isAuthenticated, users.length]);

  // Handle ?user= param
  useEffect(() => {
    const userId = searchParams.get('user');
    if (!userId || conversations.length === 0) return;
    const existing = conversations.find(c => c.user.id === userId);
    if (existing) { setSelectedConvId(existing.id); return; }
    const user = users.find(u => u.id === userId);
    if (user) {
      const nc: Conversation = { id: `conv-${user.id}`, user, messages: [], unreadCount: 0, isPinned: false, isMuted: false, isArchived: false, typing: false, online: false };
      setConversations(prev => [nc, ...prev]);
      setSelectedConvId(nc.id);
    }
  }, [searchParams, conversations.length, users]);

  // Scroll on new messages
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversations, selectedConvId]);

  // Cleanup recording on unmount
  useEffect(() => () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
  }, []);

  if (!isAuthenticated || !currentUser) return null;

  const daysRemaining = Math.max(0, 21 - accountAgeDays);
  const selectedConv = selectedConvId ? conversations.find(c => c.id === selectedConvId) : null;

  const filteredConvs = conversations
    .filter(c => {
      if (filterType === 'unread') return c.unreadCount > 0;
      if (filterType === 'archived') return c.isArchived;
      return !c.isArchived;
    })
    .filter(c => c.user.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return (b.lastMessage?.timestamp?.getTime() || 0) - (a.lastMessage?.timestamp?.getTime() || 0);
    });

  const sendMessage = async (text: string) => {
    if (!text.trim() || !selectedConvId || !selectedConv) return;
    if (!canScheduleDates && !isAdmin && containsDateKeywords(text)) { setShowSafetyModal(true); return; }

    const msg: Message = { id: `msg-${Date.now()}`, text, sent: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'sending', timestamp: new Date() };
    setConversations(prev => prev.map(c => c.id === selectedConvId ? { ...c, messages: [...c.messages, msg], lastMessage: msg } : c));
    setMessageInput('');
    setIsSending(true);

    try {
      await messagesService.sendMessage(selectedConv.user.id, text);
    } catch {}

    // Simulate status progression
    const updateStatus = (status: Message['status'], delay: number) =>
      setTimeout(() => setConversations(prev => prev.map(c => c.id === selectedConvId
        ? { ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, status } : m) } : c)), delay);
    updateStatus('sent', 500);
    updateStatus('delivered', 1500);
    updateStatus('read', 3000);
    setTimeout(() => setIsSending(false), 500);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => sendMessage(`[${file.type.startsWith('image/') ? '📷' : '📎'} ${file.name}]`));
    if (files.length) toast.success(`${files.length} file(s) sent`);
    setShowMediaOptions(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        sendMessage('🎤 Voice message');
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true); setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch { toast.error('Could not access microphone'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) { mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop()); mediaRecorderRef.current.stop(); }
    setIsRecording(false); setRecordingTime(0);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    toast.info('Voice note cancelled');
  };

  const fmtRecTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const togglePin = (id: string) => setConversations(prev => prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
  const toggleMute = (id: string) => setConversations(prev => prev.map(c => c.id === id ? { ...c, isMuted: !c.isMuted } : c));
  const archiveChat = (id: string) => { setConversations(prev => prev.map(c => c.id === id ? { ...c, isArchived: !c.isArchived } : c)); setSelectedConvId(null); };
  const selectConv = (id: string) => { setSelectedConvId(id); setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)); };

  // Locked messaging screen
  if (!canMessage && !isAdmin) {
    return (
      <DashboardLayout showRightSidebar={false} showLeftSidebar={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4 font-serif">Unlock Messaging</h1>
            <p className="text-muted-foreground mb-8">Upgrade to a premium plan to start messaging other members and make real connections.</p>
            <Link href="/upgrade">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Get Points to Unlock</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const EMOJIS = ['😀','😁','😂','🤣','😊','🙂','🤗','🤩','😍','🥰','😘','😋','😛','😜','🤪','😝','🤑','😇','🙄','😬','😌','😔','😴','🥳','😎','🤓','❤️','💕','💯','🙏','👍','✨'];

  return (
    <DashboardLayout showRightSidebar={false} showLeftSidebar={false}>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full">

        {/* Slim icon nav - desktop only */}
        <div className="hidden lg:flex flex-col items-center py-4 px-2 bg-card border-r border-border w-14 shrink-0">
          <TooltipProvider>
            {[
              { href: '/dashboard', icon: Home, label: 'Dashboard' },
              { href: '/discover', icon: Compass, label: 'Discover' },
              { href: '/matches', icon: Heart, label: 'Matches' },
              { href: '/events', icon: Calendar, label: 'Events' },
              { href: '/messages', icon: MessageCircle, label: 'Messages', active: true },
              { href: '/saved', icon: Bookmark, label: 'Saved' },
              { href: '/notifications', icon: Bell, label: 'Notifications' },
            ].map(item => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href} className={`p-2.5 rounded-xl mb-1 transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}>
                    <item.icon className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
              </Tooltip>
            ))}
            <div className="border-t border-border my-2 w-full" />
            {[
              { href: '/settings', icon: Settings, label: 'Settings' },
              { href: '/profile', icon: UserIcon, label: 'Profile' },
            ].map(item => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href} className="p-2.5 rounded-xl mb-1 hover:bg-muted text-muted-foreground transition-colors">
                    <item.icon className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Conversation list */}
        <div className={`w-full sm:w-80 bg-card border-r border-border flex flex-col shrink-0 ${selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border bg-muted/20">
            <h2 className="text-lg font-bold text-foreground mb-3 lg:hidden">Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search conversations…" className="pl-10 bg-background text-sm h-9" />
            </div>
            <div className="flex gap-1.5 mt-3">
              {(['all', 'unread', 'archived'] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {!canScheduleDates && !isAdmin && (
            <div className="px-4 py-2.5 bg-secondary/10 border-b border-border">
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5 text-secondary" />
                <span className="font-medium text-foreground">Safety Period Active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Date scheduling unlocks in {daysRemaining} days</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoadingConvs ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filteredConvs.length > 0 ? filteredConvs.map(conv => (
              <ConversationItem key={conv.id} conversation={conv} isSelected={selectedConvId === conv.id}
                onClick={() => selectConv(conv.id)} onPin={() => togglePin(conv.id)} onMute={() => toggleMute(conv.id)} onArchive={() => archiveChat(conv.id)} />
            )) : (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No conversations yet</p>
                <Link href="/discover"><Button variant="link" className="text-sm mt-1">Browse profiles</Button></Link>
              </div>
            )}
          </div>
        </div>

        {/* Chat pane */}
        <div className={`flex-1 flex flex-col bg-background ${!selectedConv ? 'hidden lg:flex' : 'flex'}`}>
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div className="p-3 bg-card border-b border-border flex items-center gap-3 shrink-0">
                <button onClick={() => setSelectedConvId(null)} className="lg:hidden p-1.5 hover:bg-muted rounded-lg flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ArrowLeft className="w-4 h-4" />Back
                </button>
                <Link href={`/profile/${selectedConv.user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center overflow-hidden">
                      {typeof selectedConv.user.avatar === 'string' && selectedConv.user.avatar.startsWith('http') ? (
                        <img src={selectedConv.user.avatar} alt={selectedConv.user.name} className="w-full h-full object-cover" />
                      ) : <span className="text-xl">{selectedConv.user.avatar || '👤'}</span>}
                    </div>
                    {selectedConv.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{selectedConv.user.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConv.typing ? <span className="text-green-500">typing…</span>
                        : selectedConv.online ? 'online'
                        : selectedConv.lastSeen ? `last seen ${selectedConv.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'offline'}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9"><Video className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9"><Phone className="w-4 h-4" /></Button>
                  <div className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => setShowChatMenu(!showChatMenu)}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    {showChatMenu && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-xl border border-border shadow-lg py-1.5 z-50">
                        {[
                          { icon: Pin, label: selectedConv.isPinned ? 'Unpin chat' : 'Pin chat', action: () => togglePin(selectedConv.id) },
                          { icon: selectedConv.isMuted ? Bell : BellOff, label: selectedConv.isMuted ? 'Unmute' : 'Mute', action: () => toggleMute(selectedConv.id) },
                          { icon: Archive, label: 'Archive chat', action: () => archiveChat(selectedConv.id) },
                        ].map(item => (
                          <button key={item.label} onClick={() => { item.action(); setShowChatMenu(false); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                            <item.icon className="w-4 h-4" />{item.label}
                          </button>
                        ))}
                        <div className="border-t border-border my-1" />
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive">
                          <Trash2 className="w-4 h-4" />Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {!canScheduleDates && !isAdmin && (
                  <div className="text-center py-1">
                    <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">Date scheduling unlocks in {daysRemaining} days</span>
                  </div>
                )}
                {selectedConv.messages.map((msg, idx) => {
                  const prevMsg = selectedConv.messages[idx - 1];
                  const showDate = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center py-2">
                          <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                            {new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${msg.sent ? 'bg-secondary text-secondary-foreground rounded-br-md' : 'bg-card text-foreground rounded-bl-md border border-border'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sent ? 'text-secondary-foreground/70' : 'text-muted-foreground'}`}>
                            <span className="text-xs">{msg.time}</span>
                            {msg.sent && <MessageStatus status={msg.status} />}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                {selectedConv.messages.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No messages yet — start the conversation!</p>
                  </div>
                )}
                {selectedConv.typing && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border px-4 py-2 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="p-3 bg-card border-t border-border shrink-0" ref={inputAreaRef}>
                <form onSubmit={e => { e.preventDefault(); sendMessage(messageInput); }} className="flex items-center gap-2">
                  {/* Emoji */}
                  <div className="relative">
                    <Button type="button" variant="ghost" size="icon" className={`rounded-full h-9 w-9 shrink-0 ${showEmojiPicker ? 'bg-muted' : ''}`}
                      onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowMediaOptions(false); }}>
                      <Smile className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-xl border border-border shadow-lg w-64">
                        <div className="grid grid-cols-8 gap-0.5">
                          {EMOJIS.map(em => (
                            <button key={em} type="button" onClick={() => { setMessageInput(p => p + em); setShowEmojiPicker(false); }}
                              className="text-lg p-1 hover:bg-muted rounded-lg transition-colors">{em}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attachment */}
                  <div className="relative">
                    <Button type="button" variant="ghost" size="icon" className={`rounded-full h-9 w-9 shrink-0 ${showMediaOptions ? 'bg-muted' : ''}`}
                      onClick={() => { setShowMediaOptions(!showMediaOptions); setShowEmojiPicker(false); }}>
                      <Paperclip className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <input ref={mediaInputRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={handleMediaUpload} className="hidden" />
                    {showMediaOptions && (
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-xl border border-border shadow-lg w-44">
                        {[
                          { icon: ImageIcon, label: 'Photo & Video', color: 'bg-primary/10 text-primary' },
                          { icon: Paperclip, label: 'Document', color: 'bg-secondary/10 text-secondary' },
                          { icon: Camera, label: 'Camera', color: 'bg-green-500/10 text-green-500' },
                        ].map(item => (
                          <button key={item.label} type="button" onClick={() => mediaInputRef.current?.click()}
                            className="flex items-center gap-3 w-full p-2 hover:bg-muted rounded-lg transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}><item.icon className="w-4 h-4" /></div>
                            <span className="text-sm">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Type a message…" className="flex-1 bg-background text-sm h-9" />

                  {messageInput.trim() ? (
                    <Button type="submit" size="icon" disabled={isSending} className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-9 w-9 shrink-0">
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  ) : isRecording ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-medium text-red-500 min-w-[44px]">{fmtRecTime(recordingTime)}</span>
                      <Button type="button" variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-red-100 text-red-600 hover:bg-red-200" onClick={cancelRecording}><Trash2 className="w-4 h-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-green-100 text-green-600 hover:bg-green-200 animate-pulse" onClick={stopRecording}><Send className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <Button type="button" variant="ghost" size="icon" className="rounded-full h-9 w-9 shrink-0" onClick={startRecording}>
                      <Mic className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8 bg-muted/10">
              <div>
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-primary/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Your Messages</h3>
                <p className="text-muted-foreground text-sm max-w-xs">Select a conversation to start chatting with your matches.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <SafetyModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} daysRemaining={daysRemaining} />
    </DashboardLayout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout showRightSidebar={false} showLeftSidebar={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    }>
      <MessagesContent />
    </Suspense>
  );
}