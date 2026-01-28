'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Lock, Calendar, CheckCircle, Shield, ArrowLeft, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SafetyModal } from '@/components/messaging/safety-modal';
import { TierBadge } from '@/components/tier-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/app-context';
import { containsDateKeywords, calculateAccountAgeDays, User } from '@/lib/types';
import Link from 'next/link';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, currentUser, users, canMessage, canScheduleDates, accountAgeDays, isAdmin } = useApp();
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Record<string, Array<{ id: string; text: string; sent: boolean; time: string }>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Get user from URL params
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      setSelectedUserId(userId);
      setShowMobileChat(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const daysRemaining = Math.max(0, 21 - accountAgeDays);
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  // Filter conversations (mock - show some users)
  const conversations = users.slice(0, 10).filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUserId) return;
    
    // Check for date keywords if user is in safety period and not admin
    if (!canScheduleDates && !isAdmin && containsDateKeywords(messageInput)) {
      setShowSafetyModal(true);
      return;
    }

    // Add message to conversation
    const newMessage = {
      id: `msg-${Date.now()}`,
      text: messageInput,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] || []), newMessage],
    }));

    setMessageInput('');
    toast.success('Message sent!');
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowMobileChat(true);
  };

  // If user can't message, show upgrade prompt
  if (!canMessage && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-accent mb-4 font-serif">Unlock Messaging</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Upgrade to a premium plan to start messaging other members and make real connections.
          </p>
          <Link href="/upgrade">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Get Points to Unlock
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto">
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Conversation List - Hidden on mobile when chat is open */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold text-accent mb-3">Messages</h2>
              
              {/* Safety Period Banner */}
              {!canScheduleDates && !isAdmin && (
                <div className="mb-3 p-3 bg-secondary/10 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span className="text-accent font-medium">Safety Period Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Date scheduling unlocked in {daysRemaining} days
                  </p>
                </div>
              )}

              {/* Verified Badge */}
              {canScheduleDates && (
                <div className="mb-3 p-3 bg-green-500/10 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Verified Member (21+ days)</span>
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((user) => (
                  <ConversationItem
                    key={user.id}
                    user={user}
                    isSelected={selectedUserId === user.id}
                    lastMessage={messages[user.id]?.[messages[user.id].length - 1]?.text}
                    onClick={() => handleSelectUser(user.id)}
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

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-2 hover:bg-muted rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Link href={`/profile/${selectedUser.id}`} className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">{selectedUser.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-accent truncate">{selectedUser.name}</h3>
                      <div className="flex items-center gap-2">
                        <TierBadge tier={selectedUser.tier} size="sm" />
                        {selectedUser.isVerified && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  {/* Schedule Date Button */}
                  {(canScheduleDates || isAdmin) && (
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Date
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {!canScheduleDates && !isAdmin && (
                    <div className="text-center py-2">
                      <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                        Date scheduling unlocked in {daysRemaining} days
                      </span>
                    </div>
                  )}
                  
                  {messages[selectedUserId]?.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          message.sent
                            ? 'bg-secondary text-secondary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sent ? 'text-secondary-foreground/70' : 'text-muted-foreground'}`}>
                          {message.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {(!messages[selectedUserId] || messages[selectedUserId].length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-3"
                  >
                    <Input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    >
                      <Send className="w-4 h-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-accent mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <SafetyModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        daysRemaining={daysRemaining}
      />
    </div>
  );
}

function ConversationItem({
  user,
  isSelected,
  lastMessage,
  onClick,
}: {
  user: User;
  isSelected: boolean;
  lastMessage?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${
        isSelected ? 'bg-muted' : ''
      }`}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">{user.avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-accent truncate">{user.name}</h4>
          <TierBadge tier={user.tier} size="sm" showLabel={false} />
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {lastMessage || 'Start a conversation'}
        </p>
      </div>
    </button>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background"><DashboardHeader /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
