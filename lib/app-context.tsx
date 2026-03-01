'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserLocation, getTierFromPoints, getTrialStatus } from './types';
import { authService } from './api/services/auth.service';
import { usersService } from './api/services/users.service';
// Temporary fallback
import { useRouter } from 'next/navigation';
import apiClient from './api/client';

type LocationPermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied';

interface AppContextType {
  isAuthenticated: boolean;
  isLoading?: boolean;
  currentUser: User | null;
  userLocation: UserLocation | null;
  locationPermissionStatus: LocationPermissionStatus;
  requestLocation: () => Promise<boolean>;
  getFilteredUsers: (filters?: any) => Promise<User[]>;
  canMessage: (otherUserId: string) => boolean;
  isInTrial: boolean;
  trialDaysRemaining: number;
  trialExpired: boolean;
  login: (email: string, password: string) => Promise<{ type: string }>;
  logout: () => Promise<void>;
  signup?: (data: any) => Promise<void>;
  getUserById?: (userId: string) => Promise<User>;
  users?: User[];
  isAdmin?: boolean;
  addPoints?: (points: number) => void;
  canScheduleDates?: boolean;
  accountAgeDays?: number;
  
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
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<LocationPermissionStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [users , setUsers ] = useState<User[]>([])
  const router = useRouter(); 
  
  // Track user interactions
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [savedUsers, setSavedUsers] = useState<Set<string>>(new Set());


  const fetchUserState = async()=>{
    try{
      const response = await apiClient.get("/users/me")
      return response.data
    }catch(err){
      // Silently fail — user is simply not logged in
    }
  }
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async() => {
      const token = authService.getToken();
      // Only call the API if a token exists — avoids a 401 on the homepage for guests
      const storedUser = token ? await fetchUserState() : null;

      // Load location from localStorage if available
      let storedLocation: UserLocation | null = null;
      if (typeof window !== 'undefined') {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
          try { storedLocation = JSON.parse(savedLocation); } catch {}
        }
      }

      if (token && storedUser) {
        // Normalise API response — backend may return PascalCase or snake_case
        const s = storedUser as any;
        const pick = (...keys: string[]) => {
          for (const k of keys) { if (s[k] !== undefined && s[k] !== null && s[k] !== '') return s[k]; }
          return undefined;
        };
        const user: User = {
          id:           pick('id',         'ID',         'user_id')   || '',
          first_name:   pick('first_name', 'FirstName',  'firstName') || '',
          last_name:    pick('last_name',  'LastName',   'lastName')  || '',
          name:         pick('user_name',  'UserName',   'username',  'Username', 'name', 'Name') || '',
          email:        pick('email',      'Email')                   || '',
          type:         pick('type',       'Type')                    || 'USER',
          age:          pick('age',        'Age')                     || 25,
          gender:      (pick('gender',     'Gender')                  || 'male') as 'male' | 'female',
          phone:        pick('phone',      'Phone')                   || '',
          bio:          pick('bio',        'Bio')                     || '',
          career:       pick('career',     'Career')                  || '',
          denomination: pick('denomination','Denomination')           || '',
          location: storedLocation || {
            lat:     pick('lat', 'Lat') || 0,
            lng:     pick('lng', 'Lng') || 0,
            city:    pick('city',    'City')    || s.location?.city    || 'Unknown',
            country: pick('country', 'Country') || s.location?.country || 'Unknown',
          },
          points:           pick('points',        'Points')           || 50,
          tier:            (pick('tier',          'Tier') ? pick('tier', 'Tier') : getTierFromPoints(pick('points', 'Points') || 50)) as any,
          accountCreatedAt: pick('created_at', 'CreatedAt', 'accountCreatedAt') ? new Date(pick('created_at', 'CreatedAt', 'accountCreatedAt')) : new Date(),
          isVerified:       pick('isVerified', 'IsVerified', 'is_verified') || false,
          avatar:           pick('avatar',     'Avatar',    'profile_image', 'ProfileImage') || '👤',
          photos:           pick('photos',     'Photos')   || [],
          interests:        pick('interests',  'Interests')|| [],
          values:           pick('values',     'Values')   || [],
          trialStartDate:   pick('trialStartDate', 'trial_start_date') ? new Date(pick('trialStartDate', 'trial_start_date')) : (pick('created_at', 'CreatedAt') ? new Date(pick('created_at', 'CreatedAt')) : undefined),
          trialEndDate:     pick('trialEndDate', 'trial_end_date') ? new Date(pick('trialEndDate', 'trial_end_date')) : (pick('created_at', 'CreatedAt') ? (() => { const d = new Date(pick('created_at', 'CreatedAt')); d.setDate(d.getDate() + 14); return d; })() : undefined),
          trialUsed:        pick('trialUsed', 'trial_used') || false,
          hasActiveTrial:   pick('hasActiveTrial', 'has_active_trial') || false,
          church: {
            name:   pick('church_name',  'ChurchName')  || s.church?.name   || '',
            branch: pick('church_branch','ChurchBranch')|| s.church?.branch || '',
          },
        };
        
        setCurrentUser(user);
        if (storedLocation) {
          setUserLocation(storedLocation);
          setLocationPermissionStatus('granted');
        }
        setIsAuthenticated(true);

        if (storedUser.type === 'ADMIN' && typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
          router.push('/admin');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ type: string }> => {
    const response = await authService.login({ email, password });
    if(response.data.type == "ADMIN"){
      const adminUser: User = {
        id: response.data?.id || response.user?.id || "",
        first_name: response.data?.first_name || "",
        last_name: response.data?.last_name || "",
        name: response.data?.user_name || response.user?.username || "",
        email: email,
        type: "ADMIN",
        age: response.data?.age || 25,
        gender: (response.data?.gender as "male" | "female") || "male",
        phone: response.data?.phone || "",
        bio: response.data?.bio || "",
        location: { lat: 0, lng: 0, city: "Unknown", country: "Unknown" },
        points: response.data?.points || 0,
        tier: response.data?.tier || "Bronze",
        accountCreatedAt: new Date(response.data?.created_at || Date.now()),
        isVerified: response.data?.isVerified || false,
        avatar: response.data?.avatar || "👤",
        photos: [],
        interests: [],
        values: [],
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      router.push("/admin");
      return { type: "ADMIN" };
    }
    // Fetch user profile from backend to get actual location and other data
    let userLocation: UserLocation = {
      lat: 0,
      lng: 0,
      city: 'Unknown',
      country: 'Unknown',
    };
    
    try {
      const userProfile = await usersService.getCurrentUser();
      if (userProfile.location) {
        userLocation = {
          lat: userProfile.location.lat || 0,
          lng: userProfile.location.lng || 0,
          city: userProfile.location.city || 'Unknown',
          country: userProfile.location.country || 'Unknown',
        };
      }
    } catch (error) {
      console.log('Could not fetch user profile, using default location');
    }
    
    // Create user from response
    const user: User = {
      id: response.user?.id || '',
      first_name: response.data?.first_name,
      last_name:response.data?.last_name,
      name: response.user?.username,
      type:response.data?.type,
      email: email,
      age: 25,
      gender: 'male',
      phone: '',
      bio: '',
      location: userLocation,
      points: response.data?.points || 50,
      tier: getTierFromPoints(response.data?.points || 50),
      accountCreatedAt: new Date(),
      isVerified: false,
      avatar: '👤',
      photos: [],
      interests: [],
      values: [],
    };

    setCurrentUser(user);
    setUserLocation(userLocation);
    setIsAuthenticated(true);
    return { type: user.type || 'USER' };
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setFollowedUsers(new Set());
    setLikedUsers(new Set());
    setSavedUsers(new Set());
  };

  const signup = async (data: { user_name: string; first_name: string; last_name: string; email: string; password: string; phone?: string; gender?: string; dob?: Date; churchName?: string; churchBranch?: string }) => {
    // Calculate age from date of birth if provided
    let age = 25; // default age
    if (data.dob) {
      const today = new Date();
      const birthDate = new Date(data.dob);
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    
    const genderValue = (data.gender === 'male' || data.gender === 'female') ? data.gender : 'male';
    
    // Prepare church info if provided
    const churchInfo = data.churchName ? {
      name: data.churchName,
      branch: data.churchBranch,
    } : undefined;
    
    const response = await authService.register({ 
      user_name: data.user_name,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email, 
      password: data.password,
      phone: data.phone || '',
      gender: genderValue,
      age: age,
      denomination: data.churchName,
    });

    // Store token
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token);
    }

    // Build local user from response
    const resData = response.data || response.user || {};
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    const user: User = {
      id: resData.id || resData.user_id || '',
      first_name: resData.first_name || data.first_name,
      last_name: resData.last_name || data.last_name,
      name: resData.user_name || data.user_name,
      email: data.email,
      age,
      gender: genderValue,
      phone: data.phone || '',
      bio: '',
      location: { lat: 0, lng: 0, city: 'Unknown', country: 'Unknown' },
      points: 50,
      tier: 'Free',
      accountCreatedAt: now,
      trialStartDate: now,
      trialEndDate: trialEnd,
      hasActiveTrial: true,
      trialUsed: false,
      isVerified: false,
      avatar: '👤',
      photos: [],
      interests: [],
      values: [],
      church: churchInfo,
    };

    setCurrentUser(user);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  // For now, return mock users until backend implements user discovery
  // Filter by location if user location is available
  const getFilteredUsers = async (filters?: any): Promise<User[]> => {
  try {
    const response = await apiClient.get("/users/by/admin");
    let users: User[] = response.data;

    if (userLocation && userLocation.lat !== 0 && userLocation.lng !== 0) {
      const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;

        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      users = users.filter((user) => {
        if (!user.location) return false;

        const distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          user.location.lat,
          user.location.lng
        );

        return distance <= 50;
      });

      if (users.length === 0) {
        users = response.data.slice(0, 15);
      }
    }

    return users;
  } catch (error) {
    return [];
  }
};

  // ─────────────────────────────────────────────────────────────
  // LOCATION SYSTEM  (3-tier, same approach as Google / Airbnb)
  //
  //  Tier 1 — IP geolocation  (instant, zero permissions, always works)
  //            Uses ipapi.co free API — city + country from IP address
  //            This is what most big sites use as their PRIMARY method
  //
  //  Tier 2 — GPS / Browser geolocation  (precise lat/lng for backend)
  //            Low-accuracy mode to avoid mobile timeout issues
  //            Runs in parallel with Tier 1, updates coordinates silently
  //
  //  Tier 3 — Timezone fallback  (100% reliable, zero network needed)
  //            Used if both IP and GPS fail
  // ─────────────────────────────────────────────────────────────

  // Tier 3: derive country from browser timezone (always available, no network)
  const getLocationFromTimezone = (): Pick<UserLocation, 'city' | 'country'> => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, { country: string; city: string }> = {
      'Africa/Accra':         { country: 'Ghana',        city: 'Accra'         },
      'Africa/Lagos':         { country: 'Nigeria',      city: 'Lagos'         },
      'Africa/Abuja':         { country: 'Nigeria',      city: 'Abuja'         },
      'Africa/Port_Harcourt': { country: 'Nigeria',      city: 'Port Harcourt' },
      'Africa/Nairobi':       { country: 'Kenya',        city: 'Nairobi'       },
      'Africa/Cairo':         { country: 'Egypt',        city: 'Cairo'         },
      'Africa/Johannesburg':  { country: 'South Africa', city: 'Johannesburg'  },
      'Africa/Douala':        { country: 'Cameroon',     city: 'Douala'        },
      'Africa/Dakar':         { country: 'Senegal',      city: 'Dakar'         },
      'Africa/Abidjan':       { country: 'Ivory Coast',  city: 'Abidjan'       },
      'Africa/Kampala':       { country: 'Uganda',       city: 'Kampala'       },
      'Africa/Dar_es_Salaam': { country: 'Tanzania',     city: 'Dar es Salaam' },
      'America/New_York':     { country: 'USA',          city: 'New York'      },
      'America/Los_Angeles':  { country: 'USA',          city: 'Los Angeles'   },
      'America/Chicago':      { country: 'USA',          city: 'Chicago'       },
      'America/Houston':      { country: 'USA',          city: 'Houston'       },
      'America/Atlanta':      { country: 'USA',          city: 'Atlanta'       },
      'America/Miami':        { country: 'USA',          city: 'Miami'         },
      'America/Toronto':      { country: 'Canada',       city: 'Toronto'       },
      'America/Vancouver':    { country: 'Canada',       city: 'Vancouver'     },
      'America/Mexico_City':  { country: 'Mexico',       city: 'Mexico City'   },
      'Europe/London':        { country: 'UK',           city: 'London'        },
      'Europe/Paris':         { country: 'France',       city: 'Paris'         },
      'Europe/Berlin':        { country: 'Germany',      city: 'Berlin'        },
      'Europe/Madrid':        { country: 'Spain',        city: 'Madrid'        },
      'Europe/Rome':          { country: 'Italy',        city: 'Rome'          },
      'Europe/Amsterdam':     { country: 'Netherlands',  city: 'Amsterdam'     },
      'Europe/Dublin':        { country: 'Ireland',      city: 'Dublin'        },
      'Asia/Dubai':           { country: 'UAE',          city: 'Dubai'         },
      'Asia/Riyadh':          { country: 'Saudi Arabia', city: 'Riyadh'        },
      'Asia/Singapore':       { country: 'Singapore',    city: 'Singapore'     },
      'Asia/Kuala_Lumpur':    { country: 'Malaysia',     city: 'Kuala Lumpur'  },
      'Asia/Tokyo':           { country: 'Japan',        city: 'Tokyo'         },
      'Asia/Seoul':           { country: 'South Korea',  city: 'Seoul'         },
      'Asia/Mumbai':          { country: 'India',        city: 'Mumbai'        },
      'Asia/Kolkata':         { country: 'India',        city: 'Kolkata'       },
      'Asia/Manila':          { country: 'Philippines',  city: 'Manila'        },
      'Australia/Sydney':     { country: 'Australia',    city: 'Sydney'        },
      'Australia/Melbourne':  { country: 'Australia',    city: 'Melbourne'     },
      'America/Sao_Paulo':    { country: 'Brazil',       city: 'São Paulo'     },
      'America/Buenos_Aires': { country: 'Argentina',    city: 'Buenos Aires'  },
    };
    if (map[tz]) return map[tz];
    // Region fallback
    if (tz.startsWith('Africa'))    return { country: 'Africa',    city: '' };
    if (tz.startsWith('America'))   return { country: 'Americas',  city: '' };
    if (tz.startsWith('Europe'))    return { country: 'Europe',    city: '' };
    if (tz.startsWith('Asia'))      return { country: 'Asia',      city: '' };
    if (tz.startsWith('Australia')) return { country: 'Australia', city: '' };
    return { country: 'Unknown', city: '' };
  };

  // Tier 1: IP-based geolocation — instant, no permission, works on all devices
  // ipapi.co is free (1000 req/day), returns city + country + lat/lng from IP
  const getLocationFromIP = async (): Promise<UserLocation | null> => {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('IP API error');
      const d = await res.json();
      if (!d.country_name) throw new Error('No country in response');
      return {
        city:    d.city        || '',
        country: d.country_name,
        lat:     d.latitude    || 0,
        lng:     d.longitude   || 0,
      };
    } catch {
      return null;
    }
  };

  // Tier 2: GPS — low-accuracy mode (fast on mobile, works in browsers)
  // Does NOT use enableHighAccuracy — that's what causes mobile timeouts
  const getLocationFromGPS = (): Promise<GeolocationCoordinates | null> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        resolve(null);
        return;
      }
      // Short timeout, no high accuracy — just like Google Maps on first load
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        ()    => resolve(null),   // never reject — just resolve null on denial
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 }
      );
    });
  };

  // Persist location to state, localStorage, and backend
  const applyLocation = async (loc: UserLocation) => {
    setUserLocation(loc);
    setCurrentUser(prev => prev ? { ...prev, location: loc } : prev);
    setLocationPermissionStatus('granted');
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLocation', JSON.stringify(loc));
    }
    // Update backend — body: { location: string } per Swagger
    try {
      const locString = [loc.city, loc.country].filter(Boolean).join(', ');
      await usersService.updateLocation(locString);
    } catch {
      // Non-blocking — location update failure doesn't affect UX
    }
  };

  // Main requestLocation — runs Tier 1 + Tier 2 in parallel, always succeeds
  const requestLocation = async (): Promise<boolean> => {
    setLocationPermissionStatus('requesting');

    // Step 1: IP geolocation first — instant, gives correct city/country/coords
    const ipLoc = await getLocationFromIP();

    // Step 2: GPS runs ONLY to get more precise coordinates, NOT to override country/city
    // This prevents VPNs, cached GPS, or stale coords from corrupting the country name
    const gpsCoords = await getLocationFromGPS();

    // Build best available location
    let finalLoc: UserLocation;

    if (ipLoc) {
      // IP is the source of truth for city + country + approximate coords.
      // GPS coords are only used if they are geographically consistent with the IP country
      // (i.e. within ~2000km) — prevents VPN/cached GPS from showing wrong coordinates.
      let lat = ipLoc.lat;
      let lng = ipLoc.lng;

      if (gpsCoords) {
        // Haversine distance check: only accept GPS if within 2000km of IP location
        const R = 6371;
        const dLat = (gpsCoords.latitude  - ipLoc.lat) * Math.PI / 180;
        const dLng = (gpsCoords.longitude - ipLoc.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(ipLoc.lat * Math.PI / 180) *
          Math.cos(gpsCoords.latitude * Math.PI / 180) *
          Math.sin(dLng / 2) ** 2;
        const distKm = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        if (distKm <= 2000) {
          // GPS is geographically consistent with IP country — use precise GPS coords
          lat = gpsCoords.latitude;
          lng = gpsCoords.longitude;
        }
        // If distKm > 2000, GPS coords are from a different region (VPN, cached, mock)
        // — silently ignore them and keep the accurate IP coordinates
      }

      finalLoc = { city: ipLoc.city, country: ipLoc.country, lat, lng };
    } else if (gpsCoords) {
      // GPS only — reverse geocode with Nominatim for city/country
      let city = '';
      let country = 'Unknown';
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${gpsCoords.latitude}&lon=${gpsCoords.longitude}`,
          { headers: { 'User-Agent': 'CommittedByFaith/1.0' }, signal: AbortSignal.timeout(4000) }
        );
        const d = await r.json();
        city    = d.address?.city || d.address?.town || d.address?.village || '';
        country = d.address?.country || 'Unknown';
      } catch { /* use timezone fallback below */ }
      if (country === 'Unknown') {
        const tz = getLocationFromTimezone();
        city    = city    || tz.city;
        country = tz.country !== 'Unknown' ? tz.country : country;
      }
      finalLoc = { city, country, lat: gpsCoords.latitude, lng: gpsCoords.longitude };
    } else {
      // Tier 3: timezone — zero network, always works
      const tz = getLocationFromTimezone();
      finalLoc = { city: tz.city, country: tz.country, lat: 0, lng: 0 };
    }

    await applyLocation(finalLoc);
    return true;  // always returns true — location is always resolved somehow
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

  const trialStatus = currentUser ? getTrialStatus(currentUser) : { isInTrial: false, daysRemaining: 0, isExpired: false };
  const isInTrial = trialStatus.isInTrial;
  const trialDaysRemaining = trialStatus.daysRemaining;
  const trialExpired = trialStatus.isExpired;

  // Get user by ID — maps ProfileResponse → User shape
  const getUserById = async (userId: string): Promise<User> => {
    try {
      const p = await usersService.getUserById(userId);
      // ProfileResponse is missing User fields — map with safe defaults
      const mapped: User = {
        id:               p.user_id || p.id || userId,
        first_name:       (p as any).first_name  || '',
        last_name:        (p as any).last_name   || '',
        name:             (p as any).user_name   || '',
        email:            (p as any).email       || '',
        age:              p.age                  || 25,
        gender:           (p.gender as 'male' | 'female') || 'male',
        phone:            (p as any).phone       || '',
        bio:              p.bio                  || '',
        career:           p.career               || '',
        denomination:     p.denomination         || '',
        interests:        p.interests            || [],
        values:           [],
        location:         { lat: 0, lng: 0, city: '', country: '' },
        points:           0,
        tier:             'Bronze',
        accountCreatedAt: new Date(p.created_at  || Date.now()),
        isVerified:       false,
        avatar:           '👤',
        photos:           p.profile_image ? [p.profile_image] : [],
        church: {
          name:   p.church_name   || '',
          branch: p.church_branch || '',
        },
      };
      return mapped;
    } catch {
      const user = users.find(u => u.id === userId);
      if (user) return user;
      throw new Error('User not found');
    }
  };

  // Get users for sidebar
  users.slice(0, 10);

  // Helper values
  const isAdmin = currentUser?.type?.includes("ADMIN".toUpperCase()) || false;
  const accountAgeDays = currentUser ? Math.floor((Date.now() - new Date(currentUser.accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const canScheduleDates = currentUser?.points !== undefined && currentUser.points > 0;

  // Add points after a successful plan purchase and upgrade tier accordingly
  const addPoints = (points: number) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const newPoints = (prev.points || 0) + points;
      const newTier = getTierFromPoints(newPoints);
      const updated = { ...prev, points: newPoints, tier: newTier };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const value: AppContextType = {
    isAuthenticated,
    isLoading,
    currentUser,
    userLocation,
    locationPermissionStatus,
    requestLocation,
    getFilteredUsers,
    canMessage,
    isInTrial,
    trialDaysRemaining,
    trialExpired,
    login,
    logout,
    signup,
    getUserById,
    users,
    isAdmin,
    addPoints,
    canScheduleDates,
    accountAgeDays,
    isFollowing,
    toggleFollow,
    likeUser,
    isLiked,
    saveUser,
    isSaved
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}