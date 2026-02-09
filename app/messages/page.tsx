'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, Lock, Calendar, CheckCircle, Shield, ArrowLeft,
  MessageCircle, MoreVertical, Phone, Video, Smile, Paperclip,
  Mic, Image as ImageIcon, Check, CheckCheck, Clock, X, Filter,
  Archive, Star, Bell, BellOff, Trash2, Pin, Camera,
  Home, Compass, Heart, Bookmark, Settings, User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { SafetyModal } from '@/components/messaging/safety-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useApp } from '@/lib/app-context';
import { containsDateKeywords, User } from '@/lib/types';
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

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, currentUser, users, canMessage, canScheduleDates, accountAgeDays, isAdmin } = useApp();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
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
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLDivElement>(null);

  // Close emoji picker and media options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageInputRef.current && !messageInputRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
        setShowMediaOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize conversations from users
  useEffect(() => {
    if (users.length > 0 && conversations.length === 0) {
      const initialConversations: Conversation[] = users.slice(0, 15).map((user, index) => ({
        id: `conv-${user.id}`,
        user,
        messages: index < 5 ? [
          {
            id: `msg-${user.id}-1`,
            text: `Hi! I noticed we share similar interests. Would love to connect! 😊`,
            sent: false,
            time: '10:30 AM',
            status: 'read' as const,
            timestamp: new Date(Date.now() - Math.random() * 86400000),
          }
        ] : [],
        lastMessage: index < 5 ? {
          id: `msg-${user.id}-1`,
          text: `Hi! I noticed we share similar interests. Would love to connect! 😊`,
          sent: false,
          time: '10:30 AM',
          status: 'read' as const,
          timestamp: new Date(Date.now() - Math.random() * 86400000),
        } : undefined,
        unreadCount: index < 3 ? Math.floor(Math.random() * 5) + 1 : 0,
        isPinned: index < 2,
        isMuted: false,
        isArchived: false,
        typing: index === 0,
        online: Math.random() > 0.5,
        lastSeen: new Date(Date.now() - Math.random() * 3600000),
      }));
      setConversations(initialConversations);
    }
  }, [users, conversations.length]);

  // Get user from URL params
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      const existingConv = conversations.find(c => c.user.id === userId);
      if (existingConv) {
        setSelectedConversationId(existingConv.id);
      } else {
        const user = users.find(u => u.id === userId);
        if (user) {
          const newConv: Conversation = {
            id: `conv-${user.id}`,
            user,
            messages: [],
            unreadCount: 0,
            isPinned: false,
            isMuted: false,
            isArchived: false,
            typing: false,
            online: Math.random() > 0.5,
          };
          setConversations(prev => [newConv, ...prev]);
          setSelectedConversationId(newConv.id);
        }
      }
    }
  }, [searchParams, users, conversations]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
    
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAuthenticated, router, isRecording]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedConversationId]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const daysRemaining = Math.max(0, 21 - accountAgeDays);
  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId) 
    : null;

  // Filter conversations
  const filteredConversations = conversations
    .filter(conv => {
      if (filterType === 'unread') return conv.unreadCount > 0;
      if (filterType === 'archived') return conv.isArchived;
      return !conv.isArchived;
    })
    .filter(conv =>
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.lastMessage?.timestamp?.getTime() || 0;
      const bTime = b.lastMessage?.timestamp?.getTime() || 0;
      return bTime - aTime;
    });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;
    
    // Check for date keywords if user is in safety period and not admin
    if (!canScheduleDates && !isAdmin && containsDateKeywords(messageInput)) {
      setShowSafetyModal(true);
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text: messageInput,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: newMessage,
        };
      }
      return conv;
    }));

    setMessageInput('');

    // Simulate message status updates
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg
            ),
          };
        }
        return conv;
      }));
    }, 500);

    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
            ),
          };
        }
        return conv;
      }));
    }, 1500);

    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'read' as const } : msg
            ),
          };
        }
        return conv;
      }));
    }, 3000);

    toast.success('Message sent!');
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setMediaFiles(prev => [...prev, ...files]);
      setShowMediaOptions(false);
      
      // Send each media file as a message
      files.forEach(file => {
        const newMessage: Message = {
          id: `msg-${Date.now()}-${file.name}`,
          text: `[${file.type.startsWith('image/') ? '📷' : '📎'} ${file.name}]`,
          sent: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sending',
          timestamp: new Date(),
        };

        if (selectedConversationId) {
          setConversations(prev => prev.map(conv => {
            if (conv.id === selectedConversationId) {
              return {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastMessage: newMessage,
              };
            }
            return conv;
          }));
        }
      });

      toast.success(`${files.length} file(s) sent`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVoiceNote(url);
        
        // Send voice note message
        if (selectedConversationId) {
          const newMessage: Message = {
            id: `msg-${Date.now()}-voice`,
            text: '🎤 Voice message',
            sent: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sending',
            timestamp: new Date(),
          };

          setConversations(prev => prev.map(conv => {
            if (conv.id === selectedConversationId) {
              return {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastMessage: newMessage,
              };
            }
            return conv;
          }));
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      const minutes = Math.floor(recordingTime / 60);
      const seconds = recordingTime % 60;
      toast.success(`Voice note recorded (${minutes}:${seconds.toString().padStart(2, '0')})`);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    toast.info('Voice note cancelled');
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    // Mark as read
    setConversations(prev => prev.map(conv => 
      conv.id === convId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const togglePin = (convId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv
    ));
    toast.success('Chat pinned');
  };

  const toggleMute = (convId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === convId ? { ...conv, isMuted: !conv.isMuted } : conv
    ));
    toast.success('Notifications muted');
  };

  const archiveChat = (convId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === convId ? { ...conv, isArchived: !conv.isArchived } : conv
    ));
    toast.success('Chat archived');
    setSelectedConversationId(null);
  };

  // If user can't message, show upgrade prompt
  if (!canMessage && !isAdmin) {
    return (
      <DashboardLayout showRightSidebar={false} showLeftSidebar={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-mute-foreground mb-4 font-serif">Unlock Messaging</h1>
            <p className="text-muted-foreground mb-8">
              Upgrade to a premium plan to start messaging other members and make real connections.
            </p>
            <Link href="/upgrade">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Get Points to Unlock
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const MessageStatus = ({ status }: { status: Message['status'] }) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout showRightSidebar={false} showLeftSidebar={false}>
      {/* Chat Container */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-screen">
        {/* Left Navigation Icons - Desktop Only */}
        <div className="hidden lg:flex flex-col items-center py-4 px-2 bg-card border-r border-border w-16 shrink-0">
        
          {/* Navigation Icons */}
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard" className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <Home className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/discover" className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <Compass className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Discover</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/matches" className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <Heart className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Matches</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/events" className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Events</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/messages" className="p-3 rounded-lg bg-primary/10 text-primary">
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Messages</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/saved" className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <Bookmark className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Saved</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/notifications" className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="border-t border-border my-2" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings" className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/profile" className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className={`w-full sm:w-135 bg-card border-r border-border flex flex-col ${selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 bg-muted/30 border-b border-border">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="text-xl font-bold text-muted-foreground">Chats</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-3">
              {(['all', 'unread', 'archived'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Safety Period Banner */}
          {!canScheduleDates && !isAdmin && (
            <div className="px-4 py-3 bg-secondary/10 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground font-medium">Safety Period Active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Date scheduling unlocked in {daysRemaining} days
              </p>
            </div>
          )}

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversationId === conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  onPin={() => togglePin(conv.id)}
                  onMute={() => toggleMute(conv.id)}
                  onArchive={() => archiveChat(conv.id)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <Link href="/dashboard">
                  <Button variant="link" className="mt-2">Browse profiles</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - WhatsApp Style */}
        <div className={`flex-1 flex flex-col bg-[url('/images/chat-bg.png')] bg-repeat ${!selectedConversation ? 'hidden lg:flex' : 'flex'}`} style={{ backgroundColor: 'var(--background)' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 bg-card border-b border-border flex items-center gap-3">
                <button
                  onClick={() => { setSelectedConversationId(null); }}
                  className="lg:hidden p-2 hover:bg-muted rounded-lg flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Chats</span>
                </button>
                
                <Link href={`/profile/${selectedConversation.user.id}`} className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">{selectedConversation.user.avatar}</span>
                    </div>
                    {selectedConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-muted-foreground truncate">{selectedConversation.user.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.typing ? (
                        <span className="text-green-500">typing...</span>
                      ) : selectedConversation.online ? (
                        'online'
                      ) : selectedConversation.lastSeen ? (
                        `last seen ${selectedConversation.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      ) : (
                        'offline'
                      )}
                    </p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => setShowChatMenu(!showChatMenu)}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                    
                    {showChatMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl border border-border shadow-lg py-2 z-50">
                        <button 
                          onClick={() => { togglePin(selectedConversation.id); setShowChatMenu(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        >
                          <Pin className="w-4 h-4" />
                          {selectedConversation.isPinned ? 'Unpin chat' : 'Pin chat'}
                        </button>
                        <button 
                          onClick={() => { toggleMute(selectedConversation.id); setShowChatMenu(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        >
                          {selectedConversation.isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                          {selectedConversation.isMuted ? 'Unmute' : 'Mute notifications'}
                        </button>
                        <button 
                          onClick={() => { archiveChat(selectedConversation.id); setShowChatMenu(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          Archive chat
                        </button>
                        <div className="border-t border-border my-1" />
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive">
                          <Trash2 className="w-4 h-4" />
                          Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {!canScheduleDates && !isAdmin && (
                  <div className="text-center py-2">
                    <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                      Date scheduling unlocked in {daysRemaining} days
                    </span>
                  </div>
                )}
                
                {selectedConversation.messages.map((message, index) => {
                  const showDate = index === 0 || 
                    new Date(message.timestamp).toDateString() !== 
                    new Date(selectedConversation.messages[index - 1].timestamp).toDateString();
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center py-2">
                          <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                            {new Date(message.timestamp).toLocaleDateString([], { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                            message.sent
                              ? 'bg-secondary text-secondary-foreground rounded-br-md'
                              : 'bg-card text-foreground rounded-bl-md border border-border'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${message.sent ? 'text-secondary-foreground/70' : 'text-muted-foreground'}`}>
                            <span className="text-xs">{message.time}</span>
                            {message.sent && <MessageStatus status={message.status} />}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                
                {selectedConversation.messages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                
                {selectedConversation.typing && (
                  <div className="flex justify-start">
                    <div className="bg-card text-foreground px-4 py-2 rounded-2xl rounded-bl-md border border-border">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - WhatsApp Style */}
              <div className="p-3 bg-card border-t border-border" ref={messageInputRef}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Emoji Button */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`rounded-full flex-shrink-0 ${showEmojiPicker ? 'bg-muted' : ''}`}
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowMediaOptions(false);
                      }}
                    >
                      <Smile className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-xl border border-border shadow-lg w-72">
                        <div className="grid grid-cols-8 gap-1">
                          {['😀', '😁', '😂', '🤣', '😊', '🙂', '🤗', '🤩',
                            '😍', '🥰', '😘', '😗', '😚', '😋', '😛', '😜',
                            '🤪', '😝', '🤑', '😇', '🤭', '🤫', '🤔', '🤐',
                            '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
                            '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
                            '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
                            '😲', '😳', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleEmojiClick(emoji)}
                              className="text-xl p-1 hover:bg-muted rounded-lg transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Media Button */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`rounded-full flex-shrink-0 ${showMediaOptions ? 'bg-muted' : ''}`}
                      onClick={() => {
                        setShowMediaOptions(!showMediaOptions);
                        setShowEmojiPicker(false);
                      }}
                    >
                      <Paperclip className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    
                    <input
                      type="file"
                      ref={mediaInputRef}
                      onChange={handleMediaUpload}
                      multiple
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                      className="hidden"
                    />
                    
                    {showMediaOptions && (
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-xl border border-border shadow-lg w-48">
                        <button
                          onClick={() => mediaInputRef.current?.click()}
                          className="flex items-center gap-3 w-full p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm">Photo & Video</span>
                        </button>
                        <button
                          onClick={() => mediaInputRef.current?.click()}
                          className="flex items-center gap-3 w-full p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                            <Paperclip className="w-4 h-4 text-secondary" />
                          </div>
                          <span className="text-sm">Document</span>
                        </button>
                        <button
                          onClick={() => mediaInputRef.current?.click()}
                          className="flex items-center gap-3 w-full p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-green-500" />
                          </div>
                          <span className="text-sm">Camera</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <Input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 bg-background"
                  />
                  {messageInput.trim() ? (
                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  ) : isRecording ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-500 min-w-[60px]">
                        {formatRecordingTime(recordingTime)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex-shrink-0"
                        onClick={cancelRecording}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex-shrink-0 animate-pulse"
                        onClick={stopRecording}
                        title="Send"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full flex-shrink-0"
                    onClick={startRecording}
                  >
                    <Mic className="w-5 h-5 text-muted-foreground" />
                  </Button>
                )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8 bg-muted/20">
              <div>
                <div className="w-64 h-64 mx-auto mb-6 opacity-50">
                  <svg viewBox="0 0 303 172" className="w-full h-full text-muted-foreground">
                    <path fill="currentColor" d="M229.565 160.229c32.647-16.024 54.484-49.903 54.484-88.713C284.049 32.028 252.021 0 212.533 0c-29.799 0-55.473 18.214-66.27 44.083-10.796-25.869-36.47-44.083-66.27-44.083C40.506 0 8.478 32.028 8.478 71.516c0 38.81 21.837 72.689 54.484 88.713H8.478c0 6.627 5.373 12 12 12h262.093c6.627 0 12-5.373 12-12h-64.506z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-accent mb-2">Committed Web</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Send and receive messages with your matches. Select a conversation to start chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <SafetyModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        daysRemaining={daysRemaining}
      />
    </DashboardLayout>
  );
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
  onPin,
  onMute,
  onArchive,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onPin: () => void;
  onMute: () => void;
  onArchive: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`relative group flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${
        isSelected ? 'bg-muted' : ''
      }`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
          <span className="text-2xl">{conversation.user.avatar}</span>
        </div>
        {conversation.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-muted-foreground truncate">{conversation.user.name}</h4>
            {conversation.isPinned && <Pin className="w-3 h-3 text-muted-foreground" />}
            {conversation.isMuted && <BellOff className="w-3 h-3 text-muted-foreground" />}
          </div>
          <span className={`text-xs ${conversation.unreadCount > 0 ? 'text-secondary font-medium' : 'text-muted-foreground'}`}>
            {conversation.lastMessage?.time || ''}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
            {conversation.lastMessage?.sent && (
              conversation.lastMessage.status === 'read' ? (
                <CheckCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              ) : (
                <CheckCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )
            )}
            {conversation.typing ? (
              <span className="text-green-500 italic">typing...</span>
            ) : (
              conversation.lastMessage?.text || 'Start a conversation'
            )}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      <div 
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
        
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-card rounded-xl border border-border shadow-lg py-1 z-50">
            <button 
              onClick={() => { onPin(); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
            >
              <Pin className="w-4 h-4" />
              {conversation.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button 
              onClick={() => { onMute(); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
            >
              {conversation.isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              {conversation.isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button 
              onClick={() => { onArchive(); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout showRightSidebar={false} showLeftSidebar={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    }>
      <MessagesContent />
    </Suspense>
  );
}
