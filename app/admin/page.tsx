"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/lib/app-context";
import type { Message, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  MessageSquare,
  AlertTriangle,
  DollarSign,
  Shield,
  Search,
  Ban,
  CheckCircle,
  Eye,
  ArrowLeft,
  TrendingUp,
  Activity,
  Settings,
  FileText,
  BarChart3,
  Heart,
  Bell,
  Lock,
  RefreshCw,
  ChevronRight,
  Zap,
  Globe,
  Server,
  Database,
  Cpu,
  Check,
  X,
  Plus,
  UserPlus,
  UserMinus,
  BadgeCheck,
  Clock,
  FileCheck,
  XCircle
} from "lucide-react";
import Image from "next/image";
import { TierBadge } from "@/components/tier-badge";
import { toast } from "sonner";

// Mock flagged messages
const mockFlaggedMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "user-1",
    receiverId: "user-2",
    content: "Hey, I need some money for emergency...",
    timestamp: new Date(),
  },
  {
    id: "msg-2",
    senderId: "user-3",
    receiverId: "user-4",
    content: "This is inappropriate content...",
    timestamp: new Date(),
  }
];

export default function AdminDashboard() {
  const router = useRouter();
  const { currentUser,  isAdmin , getFilteredUsers, logout, isLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flaggedMessages] = useState<Message[]>(mockFlaggedMessages);
  const [users , setUsers] = useState<User[]>([]);

  // Redirect non-admins to login
  useEffect(() => {
    // Don't redirect while still loading authentication state
    if (isLoading) return;

    // Check localStorage directly as a reliable fallback —
    // avoids redirect if context state hasn't fully rehydrated yet
    const cachedType = typeof window !== 'undefined' ? localStorage.getItem('user_type') : null;
    if (cachedType === 'ADMIN') return; // definitely an admin, stay put

    if (!currentUser) {
      router.push('/login');
    } else if (currentUser && !isAdmin) {
      router.push('/login');
    }
    // If currentUser exists AND isAdmin, stay on this page
  }, [currentUser, isAdmin, router, isLoading]);

  async function loadUsersForAdmin(){
    try{
      const response = await getFilteredUsers();
      console.log(response)
      setUsers(response)
      return response;
    }catch(err){
      return [];
    }
  }

  useEffect(()=>{
    loadUsersForAdmin()  
    console.log(users);
  },[])

  const filteredUsers = users?.filter(
    (user: User) =>
      user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    verifiedUsers: users.filter((u: User) => u.isVerified).length,
    diamondUsers: users.filter((u: User) => u.tier === "Diamond").length,
    flaggedMessages: flaggedMessages.length,
    revenue: users.reduce((acc: number, u: User) => {
      if (u.tier === "Diamond") return acc + 49.99;
      if (u.tier === "Platinum") return acc + 29.99;
      if (u.tier === "Gold") return acc + 19.99;
      if (u.tier === "Silver") return acc + 9.99;
      return acc;
    }, 0),
    matches: Math.floor((users.length ?? 0) * 2.5),
    messages: Math.floor((users.length ?? 0) * 15)
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.loading("Refreshing data...");
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data refreshed successfully");
    }, 1500);
  };

  const handleBanUser = (userName: string) => {
    toast.success(`User ${userName} has been banned`);
  };

  const handleApproveContent = () => {
    toast.success("Content approved successfully");
  };

  const handleRejectContent = () => {
    toast.success("Content rejected");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">
                  Admin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <Zap className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
            { label: "Verified Users", value: stats.verifiedUsers, icon: Activity, color: "text-green-500" },
            { label: "Diamond Users", value: stats.diamondUsers, icon: TrendingUp, color: "text-blue-500" },
            { label: "Flagged Messages", value: stats.flaggedMessages, icon: AlertTriangle, color: "text-secondary" },
            { label: "Monthly Revenue", value: `$${stats.revenue?.toFixed(2)}`, icon: DollarSign, color: "text-green-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "New user registered", user: "Grace M.", time: "2 minutes ago", icon: UserPlus },
                      { action: "Premium upgrade", user: "David K.", time: "15 minutes ago", icon: DollarSign },
                      { action: "Profile reported", user: "Anonymous", time: "1 hour ago", icon: AlertTriangle },
                      { action: "Message flagged", user: "System", time: "2 hours ago", icon: MessageSquare },
                      { action: "New match created", user: "Sarah & Michael", time: "3 hours ago", icon: Heart },
                      { action: "User banned", user: "Spam Bot", time: "4 hours ago", icon: UserMinus },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <activity.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {activity.action}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.user}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-6">
                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Server Status", status: "Online", ok: true, icon: Server },
                        { name: "Database", status: "Healthy", ok: true, icon: Database },
                        { name: "API Response", status: "45ms", ok: true, icon: Zap },
                        { name: "Storage", status: "68% used", ok: true, icon: Cpu },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <span>{item.name}</span>
                          </div>
                          <Badge variant={item.ok ? "default" : "destructive"} className={item.ok ? "bg-green-500/10 text-green-600" : ""}>
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* User Tier Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { tier: "Bronze", count: users?.filter((u: User) => u.tier === "Bronze").length, color: "bg-amber-700" },
                        { tier: "Silver", count: users?.filter((u: User) => u.tier === "Silver").length, color: "bg-gray-400" },
                        { tier: "Gold", count: users?.filter((u: User) => u.tier === "Gold").length, color: "bg-yellow-500" },
                        { tier: "Platinum", count: users?.filter((u: User) => u.tier === "Platinum").length, color: "bg-gray-300" },
                        { tier: "Diamond", count: users?.filter((u: User) => u.tier === "Diamond").length, color: "bg-blue-400" },
                      ].map((tier) => (
                        <div key={tier.tier}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-foreground">{tier.tier}</span>
                            <span className="text-sm text-muted-foreground">{tier.count}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className={`${tier.color} h-2 rounded-full`}
                                style={{ width: `${users.length > 0 ? ((tier?.count ?? 0) / users.length) * 100 : 0}%` }}
                              />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all registered users</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user: User) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {user?.user_name}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.age} years old
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <TierBadge tier={user.tier} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isVerified ? "default" : "secondary"}
                            className={user.isVerified ? "bg-green-500/10 text-green-600" : ""}
                          >
                            {user.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.accountCreatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/profile/${user.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-secondary"
                              onClick={() => handleBanUser(user.name ?? 'Unknown User')}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ID Verification Queue */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                        ID Verification Queue
                      </CardTitle>
                      <CardDescription>Review and approve user ID submissions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {users?.filter(u => u.idVerification?.status === 'submitted').length} Pending
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.filter(u => u.idVerification?.status === 'submitted' || u.idVerification?.status === 'pending').slice(0, 10).map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg">{user.avatar}</span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.idVerification?.documentType ? (
                              <Badge variant="outline">
                                {user.idVerification.documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">Not submitted</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.idVerification?.submittedAt 
                              ? new Date(user.idVerification.submittedAt).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.idVerification?.status === 'submitted' ? 'default' : 'secondary'}
                              className={user.idVerification?.status === 'submitted' ? 'bg-yellow-500/10 text-yellow-600' : ''}
                            >
                              {user.idVerification?.status === 'submitted' ? 'Pending Review' : 'Not Submitted'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/profile/${user.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {user.idVerification?.status === 'submitted' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600"
                                    onClick={() => toast.success(`ID verified for ${user.name || 'Unknown User'}`)}
                                  >
                                    <FileCheck className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600"
                                    onClick={() => toast.error(`ID rejected for ${user.name || 'Unknown User'}`)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Verification Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Verification Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Verified Users', count: users?.filter(u => u.idVerification?.status === 'verified').length, color: 'bg-green-500', icon: CheckCircle },
                      { label: 'Pending Review', count: users?.filter(u => u.idVerification?.status === 'submitted').length, color: 'bg-yellow-500', icon: Clock },
                      { label: 'Not Submitted', count: users?.filter(u => u.idVerification?.status === 'pending').length, color: 'bg-gray-400', icon: AlertTriangle },
                      { label: 'Rejected', count: users?.filter(u => u.idVerification?.status === 'rejected').length, color: 'bg-red-500', icon: XCircle },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-foreground flex items-center gap-2">
                            <stat.icon className="w-4 h-4" />
                            {stat.label}
                          </span>
                          <span className="text-sm text-muted-foreground">{stat.count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                              className={`${stat.color} h-2 rounded-full`}
                              style={{ width: `${users.length > 0 ? ((stat.count || 0) / users.length) * 100 : 0}%` }}
                            />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Email Verified</span>
                      <span className="font-medium">{users?.filter(u => u.securityVerification?.emailVerified).length} / {users?.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Phone Verified</span>
                      <span className="font-medium">{users?.filter(u => u.securityVerification?.phoneVerified).length} / {users?.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">2FA Enabled</span>
                      <span className="font-medium">{users?.filter(u => u.securityVerification?.twoFactorEnabled).length} / {users?.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Security Questions Set</span>
                      <span className="font-medium">{users?.filter(u => u.securityVerification?.securityQuestionsSet).length} / {users?.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Testimonials */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-secondary" />
                      Pending Testimonials
                    </CardTitle>
                    <Button size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Sarah & John", text: "We met on Committed and got married last month!", date: "2 days ago", status: "pending" },
                      { name: "Michael R.", text: "Found my soulmate through this amazing platform.", date: "1 week ago", status: "pending" },
                      { name: "Emily T.", text: "Grateful for this faith-based community.", date: "2 weeks ago", status: "approved" },
                    ].map((testimonial, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                              <Heart className="w-4 h-4 text-secondary" />
                            </div>
                            <span className="font-medium">{testimonial.name}</span>
                          </div>
                          <Badge variant={testimonial.status === "approved" ? "default" : "outline"}>
                            {testimonial.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">"{testimonial.text}"</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{testimonial.date}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleApproveContent}>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleRejectContent}>
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Blog Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Blog Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: "Dating in Your 30s", status: "Published", date: "Jan 15, 2025" },
                      { title: "Faith-First Dating", status: "Published", date: "Jan 10, 2025" },
                      { title: "Tips for First Dates", status: "Draft", date: "Jan 5, 2025" },
                    ].map((post, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{post.title}</p>
                          <p className="text-xs text-muted-foreground">{post.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={post.status === "Published" ? "default" : "secondary"}>
                            {post.status}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="flagged">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-secondary" />
                  Flagged Messages & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flaggedMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      All Clean!
                    </h3>
                    <p className="text-muted-foreground">
                      No flagged content at this time.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flaggedMessages.map((msg) => {
                        const sender = users?.find((u) => u.id === msg.senderId);
                        const recipient = users?.find((u) => u.id === msg.receiverId);
                        return (
                          <TableRow key={msg.id}>
                            <TableCell>
                              <Badge variant="outline">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Message
                              </Badge>
                            </TableCell>
                            <TableCell className="text-foreground">
                              {sender?.name || "Unknown"}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {recipient?.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-secondary/10 text-secondary">
                                Policy Violation
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(msg.timestamp).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  Review
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600"
                                  onClick={handleApproveContent}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={handleRejectContent}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg border border-dashed border-border">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">User growth chart</p>
                      <p className="text-sm text-muted-foreground">Last 12 months</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg border border-dashed border-border">
                    <div className="text-center">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Revenue chart</p>
                      <p className="text-sm text-muted-foreground">Monthly breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{stats.matches}</p>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{stats.messages}</p>
                    <p className="text-sm text-muted-foreground">Messages Sent</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">92%</p>
                    <p className="text-sm text-muted-foreground">User Satisfaction</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Temporarily disable site access</p>
                    </div>
                    <Button variant="outline" size="sm">Off</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New User Registration</p>
                      <p className="text-sm text-muted-foreground">Allow new signups</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">Require email verification</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New User Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified for new registrations</p>
                    </div>
                    <Button variant="outline" size="sm">On</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Report Notifications</p>
                      <p className="text-sm text-muted-foreground">Get notified for flagged content</p>
                    </div>
                    <Button variant="outline" size="sm">On</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Summary</p>
                      <p className="text-sm text-muted-foreground">Receive weekly analytics email</p>
                    </div>
                    <Button variant="outline" size="sm">On</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Site Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4" />
                      <span className="font-medium">Site Status</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">Database</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-4 w-4" />
                      <span className="font-medium">API Status</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Auth</p>
                      <p className="text-sm text-muted-foreground">Required for admin access</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IP Whitelist</p>
                      <p className="text-sm text-muted-foreground">Restrict admin access</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                    </div>
                    <Button variant="outline" size="sm">30 min</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}