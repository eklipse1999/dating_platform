'use client';

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import { User, UserLocation, getTierFromPoints, calculateAccountAgeDays, TRIAL_DAYS, TRIAL_POINTS, getTrialStatus } from './types';
import { MOCK_USERS, MOCK_CURRENT_USER } from './mock-data';

interface AppContextType {
  // Auth state
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User> & { password: string; dob: Date }) => Promise<boolean>;
  logout: () => void;
  
  // Location state
  userLocation: UserLocation | null;
  locationPermissionStatus: 'pending' | 'granted' | 'denied' | 'requesting';
  requestLocation: () => Promise<boolean>;
  
  // Users
  users: User[];
  getFilteredUsers: (filters?: { tier?: string; maxDistance?: number; ageRange?: [number, number] }) => User[];
  getUserById: (id: string) => User | undefined;
  
  // Points & Tier
  addPoints: (amount: number) => void;
  canMessage: boolean;
  canScheduleDates: boolean;
  accountAgeDays: number;
  
  // Trial
  isInTrial: boolean;
  trialDaysRemaining: number;
  trialExpired: boolean;
  activateTrial: () => void;
  
  // Following
  followedUsers: Set<string>;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  
  // Admin
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'requesting'>('pending');
  const [users] = useState<User[]>(MOCK_USERS);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Persist auth state to localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('committed_user');
    const savedAuth = localStorage.getItem('committed_auth');
    if (savedUser && savedAuth === 'true') {
      try {
        // Parse JSON with date reviver to convert date strings back to Date objects
        const user = JSON.parse(savedUser, (key, value) => {
          // Check if value looks like an ISO date string
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return new Date(value);
          }
          return value;
        });
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('committed_user');
        localStorage.removeItem('committed_auth');
      }
    }
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for admin login
    if (email === 'admin@committed.com') {
      const user: User = {
        ...MOCK_CURRENT_USER,
        email,
        isAdmin: true,
        points: 10000,
        tier: 'Diamond',
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('committed_user', JSON.stringify(user));
      localStorage.setItem('committed_auth', 'true');
      return true;
    }
    
    // For demo purposes, give all users a trial
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    
    const user: User = {
      ...MOCK_CURRENT_USER,
      email,
      trialStartDate: now,
      trialEndDate: trialEnd,
      trialUsed: false,
      hasActiveTrial: true,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('committed_user', JSON.stringify(user));
    localStorage.setItem('committed_auth', 'true');
    return true;
  }, []);

  const signup = useCallback(async (userData: Partial<User> & { password: string; dob: Date }): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    
    const newUser: User = {
      ...MOCK_CURRENT_USER,
      ...userData,
      id: `user-${Date.now()}`,
      accountCreatedAt: now,
      points: 0, // Start with 0, trial will grant access
      tier: 'Bronze',
      isVerified: false,
      // Trial fields - user gets trial automatically
      trialStartDate: now,
      trialEndDate: trialEnd,
      trialUsed: false,
      hasActiveTrial: true,
    };
    
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('committed_user', JSON.stringify(newUser));
    localStorage.setItem('committed_auth', 'true');
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserLocation(null);
    setLocationPermissionStatus('pending');
    localStorage.removeItem('committed_user');
    localStorage.removeItem('committed_auth');
  }, []);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    setLocationPermissionStatus('requesting');
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationPermissionStatus('denied');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // In production, you'd reverse geocode to get city/country
          const location: UserLocation = {
            lat: latitude,
            lng: longitude,
            city: 'New York',
            country: 'USA',
          };
          
          setUserLocation(location);
          setLocationPermissionStatus('granted');
          
          if (currentUser) {
            setCurrentUser({ ...currentUser, location });
          }
          
          resolve(true);
        },
        () => {
          setLocationPermissionStatus('denied');
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, [currentUser]);

  const getFilteredUsers = useCallback((filters?: { tier?: string; maxDistance?: number; ageRange?: [number, number] }) => {
    let filtered = [...users];
    
    // Free users only see local profiles (10-15)
    if (currentUser && currentUser.points === 0) {
      filtered = filtered.slice(0, 15);
    }
    
    // Premium users see users in same tier range
    if (currentUser && currentUser.points > 0 && filters?.tier) {
      filtered = filtered.filter(u => u.tier === filters.tier);
    }
    
    if (filters?.ageRange) {
      filtered = filtered.filter(u => u.age >= filters.ageRange![0] && u.age <= filters.ageRange![1]);
    }
    
    return filtered;
  }, [users, currentUser]);

  const getUserById = useCallback((id: string) => {
    return users.find(u => u.id === id);
  }, [users]);

  const addPoints = useCallback((amount: number) => {
    if (currentUser) {
      const newPoints = currentUser.points + amount;
      setCurrentUser({
        ...currentUser,
        points: newPoints,
        tier: getTierFromPoints(newPoints),
      });
    }
  }, [currentUser]);

  const toggleFollow = useCallback((userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const isFollowing = useCallback((userId: string) => {
    return followedUsers.has(userId);
  }, [followedUsers]);

  const accountAgeDays = currentUser ? calculateAccountAgeDays(currentUser.accountCreatedAt) : 0;
  // User can message if they have points OR if they are in their trial period
  const trialStatus = currentUser ? getTrialStatus(currentUser) : { isInTrial: false, daysRemaining: 0, isExpired: false };
  const canMessage = currentUser ? (currentUser.points > 0 || trialStatus.isInTrial) : false;
  const canScheduleDates = accountAgeDays >= 21;
  const isAdmin = currentUser?.isAdmin ?? false;

  // Trial related
  const isInTrial = trialStatus.isInTrial;
  const trialDaysRemaining = trialStatus.daysRemaining;
  const trialExpired = trialStatus.isExpired;

  const activateTrial = useCallback(() => {
    if (currentUser) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
      
      setCurrentUser({
        ...currentUser,
        trialStartDate: now,
        trialEndDate: trialEnd,
        trialUsed: false,
        hasActiveTrial: true,
      });
    }
  }, [currentUser]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        signup,
        logout,
        userLocation,
        locationPermissionStatus,
        requestLocation,
        users,
        getFilteredUsers,
        getUserById,
        addPoints,
        canMessage,
        canScheduleDates,
        accountAgeDays,
        followedUsers,
        toggleFollow,
        isFollowing,
        isAdmin,
        isInTrial,
        trialDaysRemaining,
        trialExpired,
        activateTrial,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
