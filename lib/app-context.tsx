'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';
import { authService } from './api/services/auth.service';
import { usersService } from './api/services/users.service';
import { MOCK_USERS } from './mock-data'; // Temporary fallback

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  getFilteredUsers: (filters?: any) => User[];
  canMessage: (otherUserId: string) => boolean;
  isInTrial: boolean;
  trialDaysRemaining: number;
  trialExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithFaceId?: (email: string) => Promise<void>;
  
  // Additional functions that ProfileCard needs
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => void;
  likeUser: (userId: string) => void;
  isLiked: (userId: string) => boolean;
  saveUser: (userId: string) => void;
  isSaved: (userId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track user interactions
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [savedUsers, setSavedUsers] = useState<Set<string>>(new Set());

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getToken();
      const storedUser = authService.getStoredUser();
      
      if (token && storedUser) {
        // Create a basic user object from stored data
        const user: User = {
          id: storedUser?.id,
          first_name: storedUser?.first_name,
          last_name:storedUser?.last_name,
          name: storedUser?.username,
          email: storedUser.email,
          age: 25, // Default
          gender: 'male', // Default
          phone: '',
          bio: '',
          location: {
            lat: 0,
            lng: 0,
            city: 'Unknown',
            country: 'Unknown',
          },
          points: 50, // Default trial points
          tier: 'Bronze',
          accountCreatedAt: new Date(),
          isVerified: false,
          avatar: '👤',
          photos: [],
          interests: [],
          values: [],
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    
    // Create user from response
    const user: User = {
      id: response.user?.id || 'current-user',
      first_name: response.data?.first_name,
      last_name:response.data?.last_name,
      name: response.user?.username,
      email: email,
      age: 25,
      gender: 'male',
      phone: '',
      bio: '',
      location: {
        lat: 0,
        lng: 0,
        city: 'Unknown',
        country: 'Unknown',
      },
      points: 50,
      tier: 'Silver',
      accountCreatedAt: new Date(),
      isVerified: false,
      avatar: '👤',
      photos: [],
      interests: [],
      values: [],
    };
    
    console.log(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setFollowedUsers(new Set());
    setLikedUsers(new Set());
    setSavedUsers(new Set());
  };

  // For now, return mock users until backend implements user discovery
  const getFilteredUsers = (filters?: any) => {
    // You can later replace this with API call
    return MOCK_USERS.slice(0, 15); // Return first 15 for free users
  };

  const canMessage = (otherUserId: string) => {
    if (!currentUser) return false;
    // For now, allow messaging if user has points
    return currentUser.points > 0;
  };

  // Follow/unfollow functions
  const isFollowing = (userId: string): boolean => {
    return followedUsers.has(userId);
  };

  const toggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Like functions
  const isLiked = (userId: string): boolean => {
    return likedUsers.has(userId);
  };

  const likeUser = (userId: string) => {
    setLikedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
    
    // TODO: Call API to like user
    // await matchesService.likeUser(userId);
  };

  // Save functions
  const isSaved = (userId: string): boolean => {
    return savedUsers.has(userId);
  };

  const saveUser = (userId: string) => {
    setSavedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
    
    // TODO: Call API to save user
    // await matchesService.saveUser(userId);
  };

  const isInTrial = currentUser ? currentUser.points > 0 && currentUser.points <= 500 : false;
  const trialDaysRemaining = 14; // Default
  const trialExpired = false;

  const value: AppContextType = {
    isAuthenticated,
    currentUser,
    getFilteredUsers,
    canMessage,
    isInTrial,
    trialDaysRemaining,
    trialExpired,
    login,
    logout,
    isFollowing,
    toggleFollow,
    likeUser,
    isLiked,
    saveUser,
    isSaved,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}