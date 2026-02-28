'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserLocation } from './types';
import { authService } from './api/services/auth.service';
import { usersService } from './api/services/users.service';
// Temporary fallback
import { useRouter } from 'next/navigation';
import apiClient from './api/client';

type LocationPermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied';

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  userLocation: UserLocation | null;
  locationPermissionStatus: LocationPermissionStatus;
  isLoading: boolean;
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

      //Load location from localStorage if available
      let storedLocation = storedUser?.locations?.[0] || null;      
      if (token && storedUser) {
        // Create a basic user object from stored data
        const user: User = {
          id: storedUser?.id,
          first_name: storedUser?.first_name,
          last_name:storedUser?.last_name,
          user_name: storedUser?.user_name,
          email: storedUser.email,
          type: storedUser.type,
          age: 25, // Default
          gender: 'male', // Default
          phone: '',
          bio: '',
          location: {
            lat: storedLocation?.latitude || 0,
            lng: storedLocation?.longitude || 0,
            city: storedLocation?.city || 'Unknown',
            country: storedLocation?.country || 'Unknown',
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
        if (storedLocation) {
          setUserLocation(storedLocation);
          setLocationPermissionStatus('granted');
        }
        setIsAuthenticated(true);

        if (storedUser.type === 'ADMIN') {
          router.push('/admin');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ type: string }> => {
    const response = await authService.login({ email, password });
    const userType = response.data.type?.toUpperCase();
    
    if(userType === 'ADMIN'){
      // Set current user for admin
      const adminUser: User = {
        id: response.data.id,
        first_name: response.data.first_name || 'Admin',
        last_name: response.data.last_name || '',
        user_name: response.data.username || 'admin',
        email: email,
        type: 'ADMIN',
        age: 0,
        gender: 'male',
        phone: '',
        bio: '',
        location: { lat: 0, lng: 0, city: 'Admin', country: 'System' },
        points: 0,
        tier: 'Bronze',
        accountCreatedAt: new Date(),
        isVerified: true,
        avatar: '👑',
        photos: [],
        interests: [],
        values: [],
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      router.push("/admin");
      return { type: 'ADMIN' };
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
      points: 50,
      tier: 'Silver',
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

  const signup = async (data: { user_name: string; first_name:string ; last_name:string; email: string; password: string;phone?: string; gender?: string; dob?: Date; churchName?: string; churchBranch?: string }) => {
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
      confirmPassword: data.password,
      phone: data.phone || '',
      gender: genderValue,
      age: age,
      denomination: data.churchName,
    });

    
    // Create user from response
    // const user: User = {
    //   id: response.user?.id || response.data?.id || 'new-user',
    //   first_name: data.first_name,
    //   last_name: data.last_name|| '',
    //   user_name: data.user_name,
    //   email: data.email,
    //   age: age,
    //   gender: (data.gender as 'male' | 'female') || 'male',
    //   phone: data.phone || '',
    //   bio: '',
    //   location: {
    //     lat: 0,
    //     lng: 0,
    //     city: 'Unknown',
    //     country: 'Unknown',
    //   },
    //   points: 50,
    //   tier: 'Silver',
    //   accountCreatedAt: new Date(),
    //   isVerified: false,
    //   avatar: '👤',
    //   photos: [],
    //   interests: [],
    //   values: [],
    //   church: churchInfo,
    // };

    setIsAuthenticated(false);
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

  // Helper function to find closest city from coordinates
  const findClosestCity = (lat: number, lng: number): Pick<UserLocation, 'city' | 'country'> => {
    // Expanded predefined cities with coordinates - added more Ghana and West Africa cities
    const cities = [
      // USA
      { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
      { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
      { city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
      { city: 'Houston', country: 'USA', lat: 29.7604, lng: -95.3698 },
      { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
      { city: 'Atlanta', country: 'USA', lat: 33.7490, lng: -84.3880 },
      // UK/Europe
      { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
      { city: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426 },
      // Nigeria
      { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
      { city: 'Abuja', country: 'Nigeria', lat: 9.0765, lng: 7.3986 },
      { city: 'Port Harcourt', country: 'Nigeria', lat: 4.7774, lng: 7.0134 },
      { city: 'Ibadan', country: 'Nigeria', lat: 7.3775, lng: 3.9470 },
      // Kenya
      { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
      { city: 'Mombasa', country: 'Kenya', lat: -4.0435, lng: 39.6682 },
      // Ghana - MORE CITIES
      { city: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870 },
      { city: 'Kumasi', country: 'Ghana', lat: 6.6885, lng: -1.6244 },
      { city: 'Cape Coast', country: 'Ghana', lat: 5.1054, lng: -1.2466 },
      { city: 'Tamale', country: 'Ghana', lat: 9.4075, lng: -0.8534 },
      { city: 'Tema', country: 'Ghana', lat: 5.9628, lng: 0.0567 },
      { city: 'Takoradi', country: 'Ghana', lat: 4.8985, lng: -1.7825 },
      { city: 'Ashiaman', country: 'Ghana', lat: 5.6924, lng: -0.0449 },
      { city: 'Sunyani', country: 'Ghana', lat: 7.3349, lng: -2.3100 },
      { city: 'Koforidua', country: 'Ghana', lat: 6.0900, lng: -0.0500 },
      { city: 'Wa', country: 'Ghana', lat: 9.9875, lng: -2.5178 },
      { city: 'Ho', country: 'Ghana', lat: 6.6000, lng: 0.4500 },
      { city: 'Berekum', country: 'Ghana', lat: 7.4500, lng: -2.5833 },
      { city: 'Aflao', country: 'Ghana', lat: 6.1167, lng: 1.1333 },
      // West Africa
      { city: 'Abidjan', country: 'Ivory Coast', lat: 5.3600, lng: -4.0083 },
      { city: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870 },
      { city: 'Dakar', country: 'Senegal', lat: 14.7167, lng: -17.4677 },
      { city: 'Freetown', country: 'Sierra Leone', lat: 8.4657, lng: -13.2317 },
      { city: 'Monrovia', country: 'Liberia', lat: 6.3156, lng: -10.8074 },
      // Canada
      { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
      { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207 },
      // Australia
      { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
      { city: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631 },
    ];

    // Calculate distance to each city using Haversine formula
    const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    let closestCity = cities[0];
    let minDistance = getDistance(lat, lng, cities[0].lat, cities[0].lng);

    for (const city of cities) {
      const distance = getDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    
    // If within 2000km, return the country only (not specific city)
    if (minDistance <= 2000) {
      // Return country name only - no specific city
      return { city: '', country: closestCity.country };
    }

    return { city: 'Unknown', country: 'Unknown' };
  };

  // Helper function for timezone-based location detection
  const getTimezoneLocation = (): Pick<UserLocation, 'city' | 'country'> => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    let country = 'Unknown';
    let city = 'Unknown';
    
    // Map timezone to country/city - more comprehensive list
    const timezoneMap: Record<string, { country: string; city: string }> = {
      // Africa
      'Africa/Accra': { country: 'Ghana', city: 'Accra' },
      'Africa/Lagos': { country: 'Nigeria', city: 'Lagos' },
      'Africa/Nairobi': { country: 'Kenya', city: 'Nairobi' },
      'Africa/Cairo': { country: 'Egypt', city: 'Cairo' },
      'Africa/Johannesburg': { country: 'South Africa', city: 'Johannesburg' },
      'Africa/Douala': { country: 'Cameroon', city: 'Douala' },
      'Africa/Dakar': { country: 'Senegal', city: 'Dakar' },
      'Africa/Abidjan': { country: 'Ivory Coast', city: 'Abidjan' },
      'Africa/Freetown': { country: 'Sierra Leone', city: 'Freetown' },
      'Africa/Monrovia': { country: 'Liberia', city: 'Monrovia' },
      'Africa/Kumasi': { country: 'Ghana', city: 'Kumasi' },
      'Africa/Cape_Coast': { country: 'Ghana', city: 'Cape Coast' },
      'Africa/Tamale': { country: 'Ghana', city: 'Tamale' },
      'Africa/Port_Harcourt': { country: 'Nigeria', city: 'Port Harcourt' },
      'Africa/Ibadan': { country: 'Nigeria', city: 'Ibadan' },
      'Africa/Abuja': { country: 'Nigeria', city: 'Abuja' },
      'Africa/Kampala': { country: 'Uganda', city: 'Kampala' },
      'Africa/Dar_es_Salaam': { country: 'Tanzania', city: 'Dar es Salaam' },
      'Africa/Lusaka': { country: 'Zambia', city: 'Lusaka' },
      'Africa/Harare': { country: 'Zimbabwe', city: 'Harare' },
      // USA
      'America/New_York': { country: 'USA', city: 'New York' },
      'America/Los_Angeles': { country: 'USA', city: 'Los Angeles' },
      'America/Chicago': { country: 'USA', city: 'Chicago' },
      'America/Houston': { country: 'USA', city: 'Houston' },
      'America/Phoenix': { country: 'USA', city: 'Phoenix' },
      'America/Philadelphia': { country: 'USA', city: 'Philadelphia' },
      'America/San_Antonio': { country: 'USA', city: 'San Antonio' },
      'America/San_Diego': { country: 'USA', city: 'San Diego' },
      'America/Dallas': { country: 'USA', city: 'Dallas' },
      'America/Detroit': { country: 'USA', city: 'Detroit' },
      'America/Atlanta': { country: 'USA', city: 'Atlanta' },
      'America/Miami': { country: 'USA', city: 'Miami' },
      'America/Seattle': { country: 'USA', city: 'Seattle' },
      'America/Denver': { country: 'USA', city: 'Denver' },
      'America/Toronto': { country: 'Canada', city: 'Toronto' },
      'America/Vancouver': { country: 'Canada', city: 'Vancouver' },
      'America/Montreal': { country: 'Canada', city: 'Montreal' },
      'America/Mexico_City': { country: 'Mexico', city: 'Mexico City' },
      // UK/Europe
      'Europe/London': { country: 'UK', city: 'London' },
      'Europe/Manchester': { country: 'UK', city: 'Manchester' },
      'Europe/Birmingham': { country: 'UK', city: 'Birmingham' },
      'Europe/Edinburgh': { country: 'UK', city: 'Edinburgh' },
      'Europe/Paris': { country: 'France', city: 'Paris' },
      'Europe/Berlin': { country: 'Germany', city: 'Berlin' },
      'Europe/Madrid': { country: 'Spain', city: 'Madrid' },
      'Europe/Rome': { country: 'Italy', city: 'Rome' },
      'Europe/Amsterdam': { country: 'Netherlands', city: 'Amsterdam' },
      'Europe/Brussels': { country: 'Belgium', city: 'Brussels' },
      'Europe/Vienna': { country: 'Austria', city: 'Vienna' },
      'Europe/Zurich': { country: 'Switzerland', city: 'Zurich' },
      'Europe/Stockholm': { country: 'Sweden', city: 'Stockholm' },
      'Europe/Oslo': { country: 'Norway', city: 'Oslo' },
      'Europe/Copenhagen': { country: 'Denmark', city: 'Copenhagen' },
      'Europe/Helsinki': { country: 'Finland', city: 'Helsinki' },
      'Europe/Dublin': { country: 'Ireland', city: 'Dublin' },
      'Europe/Lisbon': { country: 'Portugal', city: 'Lisbon' },
      'Europe/Athens': { country: 'Greece', city: 'Athens' },
      'Europe/Warsaw': { country: 'Poland', city: 'Warsaw' },
      'Europe/Prague': { country: 'Czech Republic', city: 'Prague' },
      'Europe/Budapest': { country: 'Hungary', city: 'Budapest' },
      // Asia
      'Asia/Dubai': { country: 'UAE', city: 'Dubai' },
      'Asia/Riyadh': { country: 'Saudi Arabia', city: 'Riyadh' },
      'Asia/Jeddah': { country: 'Saudi Arabia', city: 'Jeddah' },
      'Asia/Kuwait': { country: 'Kuwait', city: 'Kuwait City' },
      'Asia/Qatar': { country: 'Qatar', city: 'Doha' },
      'Asia/Bahrain': { country: 'Bahrain', city: 'Manama' },
      'Asia/Muscat': { country: 'Oman', city: 'Muscat' },
      'Asia/Jakarta': { country: 'Indonesia', city: 'Jakarta' },
      'Asia/Singapore': { country: 'Singapore', city: 'Singapore' },
      'Asia/Kuala_Lumpur': { country: 'Malaysia', city: 'Kuala Lumpur' },
      'Asia/Bangkok': { country: 'Thailand', city: 'Bangkok' },
      'Asia/Hong_Kong': { country: 'Hong Kong', city: 'Hong Kong' },
      'Asia/Shanghai': { country: 'China', city: 'Shanghai' },
      'Asia/Beijing': { country: 'China', city: 'Beijing' },
      'Asia/Tokyo': { country: 'Japan', city: 'Tokyo' },
      'Asia/Seoul': { country: 'South Korea', city: 'Seoul' },
      'Asia/Mumbai': { country: 'India', city: 'Mumbai' },
      'Asia/Delhi': { country: 'India', city: 'Delhi' },
      'Asia/Kolkata': { country: 'India', city: 'Kolkata' },
      'Asia/Bangalore': { country: 'India', city: 'Bangalore' },
      'Asia/Manila': { country: 'Philippines', city: 'Manila' },
      // Australia
      'Australia/Sydney': { country: 'Australia', city: 'Sydney' },
      'Australia/Melbourne': { country: 'Australia', city: 'Melbourne' },
      'Australia/Brisbane': { country: 'Australia', city: 'Brisbane' },
      'Australia/Perth': { country: 'Australia', city: 'Perth' },
      // South America
      'America/Sao_Paulo': { country: 'Brazil', city: 'São Paulo' },
      'America/Rio_de_Janeiro': { country: 'Brazil', city: 'Rio de Janeiro' },
      'America/Buenos_Aires': { country: 'Argentina', city: 'Buenos Aires' },
      'America/Santiago': { country: 'Chile', city: 'Santiago' },
      'America/Lima': { country: 'Peru', city: 'Lima' },
      'America/Bogota': { country: 'Colombia', city: 'Bogota' },
    };
    
    // Check exact timezone match
    if (timezoneMap[timezone]) {
      return timezoneMap[timezone];
    }
    
    // Try partial matching
    for (const [tz, location] of Object.entries(timezoneMap)) {
      if (timezone.includes(tz.split('/')[1])) {
        return location;
      }
    }
    
    // Fallback to region-based detection
    if (timezone.includes('Africa')) {
      return { country: 'Africa', city: '' };
    } else if (timezone.includes('America/New_York') || timezone.includes('America/Los_Angeles') || 
               timezone.includes('America/Chicago') || timezone.includes('America/Houston')) {
      return { country: 'USA', city: '' };
    } else if (timezone.includes('America/Toronto') || timezone.includes('America/Vancouver')) {
      return { country: 'Canada', city: '' };
    } else if (timezone.includes('Europe')) {
      return { country: 'Europe', city: '' };
    } else if (timezone.includes('Asia')) {
      return { country: 'Asia', city: '' };
    } else if (timezone.includes('Australia')) {
      return { country: 'Australia', city: '' };
    } else if (timezone.includes('South America') || timezone.includes('America/Sao_Paulo')) {
      return { country: 'South America', city: '' };
    }

    return { city: '', country };
  };

  const reverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<Pick<UserLocation, 'city' | 'country'>> => {
    // First, try timezone-based detection (most reliable)
    console.log('reverseGeocode: Trying timezone detection first');
    const tzLocation = getTimezoneLocation();
    if (tzLocation.country && tzLocation.country !== 'Unknown') {
      console.log('reverseGeocode: Found country from timezone:', tzLocation.country);
      return tzLocation;
    }
    
    // Try predefined cities list
    console.log('reverseGeocode: Trying predefined cities');
    const closestCity = findClosestCity(lat, lng);
    console.log('reverseGeocode: Result from findClosestCity:', closestCity);
    if (closestCity.country && closestCity.country !== 'Unknown') {
      console.log('reverseGeocode: Found country from predefined list:', closestCity.country);
      return closestCity;
    }
    
    // Last resort: Try Nominatim API
    try {
      console.log('reverseGeocode: Trying Nominatim API');
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RiseOfEklipse/1.0',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.address) {
        // Return country only (no specific city)
        const country = data.address.country_code?.toUpperCase() || 
                       data.address.country || 
                       'Unknown';
        
        console.log('Reverse geocoding result - Country:', country);
        return { city: '', country };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    
    // Ultimate fallback - use timezone
    console.log('reverseGeocode: Using timezone fallback');
    const fallbackLocation = getTimezoneLocation();
    if (fallbackLocation.country && fallbackLocation.country !== 'Unknown') {
      return fallbackLocation;
    }
    
    return { city: '', country: 'Unknown' };
  };

  const requestLocation = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationPermissionStatus('denied');
      return false;
    }

    setLocationPermissionStatus('requesting');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Got coordinates:', lat, lng);

          try {
            // First, reverse geocode to get city and country
            const address = await reverseGeocode(lat, lng);
            console.log('Reverse geocode result:', address);
            
            // Ensure we have a valid country
            let country = address.country;
            let city = address.city;
            
            // If country is still Unknown, try timezone one more time
            if (!country || country === 'Unknown') {
              const tzLocation = getTimezoneLocation();
              country = tzLocation.country;
              city = tzLocation.city;
            }

            // Try to update backend (non-blocking)
            try {
              await usersService.updateLocation(lat, lng, city, country);
            } catch (e) {
              console.log('Backend update failed, using local location');
            }
            
            // Create location object
            const nextLocation: UserLocation = {
              lat,
              lng,
              city: city || '',
              country: country || 'Unknown',
            };

            console.log('Setting user location:', nextLocation);

            // Save to localStorage for persistence
            if (typeof window !== 'undefined') {
              localStorage.setItem('userLocation', JSON.stringify(nextLocation));
            }

            setUserLocation(nextLocation);
            setCurrentUser((prev) => (prev ? { ...prev, location: nextLocation } : prev));
            setLocationPermissionStatus('granted');
            resolve(true);
          } catch (error) {
            console.error('Failed to get location:', error);
            
            // Ultimate fallback - use timezone
            const tzLocation = getTimezoneLocation();
            const nextLocation: UserLocation = {
              lat,
              lng,
              city: tzLocation.city || '',
              country: tzLocation.country || 'Unknown',
            };

            if (typeof window !== 'undefined') {
              localStorage.setItem('userLocation', JSON.stringify(nextLocation));
            }

            setUserLocation(nextLocation);
            setCurrentUser((prev) => (prev ? { ...prev, location: nextLocation } : prev));
            setLocationPermissionStatus('granted');
            resolve(true);
          }
        },
        () => {
          console.log('Geolocation permission denied');
          setLocationPermissionStatus('denied');
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
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

  // Get user by ID
  const getUserById = async (userId: string): Promise<User> => {
    try {
      return await usersService.getUserById(userId);
    } catch {
      // Fallback to mock data
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

  const value: AppContextType = {
    isAuthenticated,
    currentUser,
    userLocation,
    locationPermissionStatus,
    isLoading,
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
    canScheduleDates,
    accountAgeDays,
    isFollowing,
    toggleFollow,
    likeUser,
    isLiked,
    saveUser,
    isSaved
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