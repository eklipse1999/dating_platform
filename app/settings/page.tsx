'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Shield, Bell, CreditCard, Ban, Save, Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/lib/app-context';

type TabType = 'account' | 'privacy' | 'notifications' | 'payments' | 'safety';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, logout, isAdmin } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, router]);

  // Form states
  const [accountData, setAccountData] = useState({
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showDistance: true,
    allowMessagesFrom: 'everyone',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailMessages: true,
    emailMatches: true,
    emailNews: false,
    pushMessages: true,
    pushMatches: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (currentUser) {
      setAccountData(prev => ({
        ...prev,
        email: currentUser.email,
        phone: currentUser.phone,
      }));
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully!');
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'payments', label: 'Payment History', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'safety', label: 'Blocked Users', icon: <Ban className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="text-3xl font-bold text-muted-foreground font-serif">Settings</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Tabs */}
            <div className="lg:w-56 flex-shrink-0">
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="p-6 bg-card rounded-2xl border border-border">
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-muted-foreground">Account Settings</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={accountData.email}
                          onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={accountData.phone}
                          onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border space-y-4">
                      <h3 className="font-medium text-muted-foreground">Change Password</h3>
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={accountData.currentPassword}
                          onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={accountData.newPassword}
                          onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="w-full sm:w-auto"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </Button>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-muted-foreground">Privacy Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-muted-foreground">Profile Visibility</h4>
                          <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                        </div>
                        <Switch
                          checked={privacySettings.profileVisible}
                          onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, profileVisible: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-muted-foreground">Show Distance</h4>
                          <p className="text-sm text-muted-foreground">Display your distance from other users</p>
                        </div>
                        <Switch
                          checked={privacySettings.showDistance}
                          onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showDistance: checked })}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-2">Who can message you</h4>
                        <select
                          value={privacySettings.allowMessagesFrom}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessagesFrom: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="followers">Only people I follow</option>
                          <option value="nobody">Nobody</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-muted-foreground">Notification Preferences</h2>
                    
                    <div>
                      <h3 className="font-medium text-muted-foreground mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">New messages</span>
                          <Switch
                            checked={notificationSettings.emailMessages}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailMessages: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">New matches</span>
                          <Switch
                            checked={notificationSettings.emailMatches}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailMatches: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">News and updates</span>
                          <Switch
                            checked={notificationSettings.emailNews}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNews: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="font-medium text-muted-foreground mb-4">Push Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">New messages</span>
                          <Switch
                            checked={notificationSettings.pushMessages}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushMessages: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">New matches</span>
                          <Switch
                            checked={notificationSettings.pushMatches}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushMatches: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment History Tab */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-muted-foreground">Payment History</h2>
                    
                    <div className="text-center py-12 text-muted-foreground">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No payment history yet</p>
                      <p className="text-sm">Your past purchases will appear here</p>
                    </div>
                  </div>
                )}

                {/* Blocked Users Tab */}
                {activeTab === 'safety' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-muted-foreground">Blocked Users</h2>
                    
                    <div className="text-center py-12 text-muted-foreground">
                      <Ban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No blocked users</p>
                      <p className="text-sm">Users you block will appear here</p>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                {(activeTab === 'account' || activeTab === 'privacy' || activeTab === 'notifications') && (
                  <div className="pt-6 mt-6 border-t border-border">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
