export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export const TRIAL_DAYS = 14;
export const TRIAL_POINTS = 500; // Points granted during trial

export interface UserLocation {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export interface ChurchInfo {
  name: string;
  branch?: string;
  address?: string;
  city?: string;
  country?: string;
  pastorName?: string;
}

export interface IDVerification {
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  documentType?: 'passport' | 'drivers_license' | 'national_id' | 'other';
  documentNumber?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

export interface SecurityVerification {
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
  securityQuestionsSet: boolean;
  trustedDevices: number;
  lastSecurityCheck?: Date;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  user_name?:string;
  name?:string;
  type?: "USER" | "ADMIN";
  email: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  bio: string;
  career?: string;
  location: UserLocation;
  distance?: string;
  points: number;
  tier: Tier;
  accountCreatedAt: Date;
  isVerified: boolean;
  avatar: string;
  photos: string[];
  denomination?: string;
  looking_for?: string;
  interests?: string[];
  faithJourney?: string;
  values?: string[];
  isAdmin?: boolean;
  // Trial related
  trialStartDate?: Date;
  trialEndDate?: Date;
  trialUsed?: boolean;
  hasActiveTrial?: boolean;
  // Church information
  church?: ChurchInfo;
  // ID Verification
  idVerification?: IDVerification;
  // Security Verification
  securityVerification?: SecurityVerification;
  // Discover page features
  joinDate?: Date;
  likes?: number;
  lastActive?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isBlocked?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface PointsPackage {
  id: string;
  name: string;
  points: number;
  price: number;
  currency: string;
  isBestValue?: boolean;
  tierID?: string;
  canMessage?: boolean;
  canScheduleDate?: boolean;
  dailyMessageLimit?: number;
}

export const POINTS_PACKAGES: PointsPackage[] = [
  { id: 'starter', name: 'Starter', points: 500, price: 7.99, currency: 'USD' },
  { id: 'popular', name: 'Popular', points: 1500, price: 21.99, currency: 'USD', isBestValue: true },
  { id: 'premium', name: 'Premium', points: 3000, price: 39.99, currency: 'USD' },
  { id: 'elite', name: 'Elite', points: 5000, price: 59.99, currency: 'USD' },
  { id: 'ultimate', name: 'Ultimate', points: 10000, price: 99.99, currency: 'USD' },
];

export const TIER_RANGES: Record<Tier, { min: number; max: number; icon: string; color: string }> = {
  Bronze: { min: 0, max: 500, icon: '🥉', color: '#CD7F32' },
  Silver: { min: 501, max: 1500, icon: '🥈', color: '#C0C0C0' },
  Gold: { min: 1501, max: 3000, icon: '🥇', color: '#FFD700' },
  Platinum: { min: 3001, max: 5000, icon: '💎', color: '#E5E4E2' },
  Diamond: { min: 5001, max: Infinity, icon: '💠', color: '#B9F2FF' },
};

export function getTierFromPoints(points: number): Tier {
  if (points <= 500) return 'Bronze';
  if (points <= 1500) return 'Silver';
  if (points <= 3000) return 'Gold';
  if (points <= 5000) return 'Platinum';
  return 'Diamond';
}

export function isOver18(dob: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
}

export function calculateAccountAgeDays(createdAt: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getTrialStatus(user: User): { isInTrial: boolean; daysRemaining: number; isExpired: boolean } {
  if (!user.trialStartDate || !user.trialEndDate) {
    return { isInTrial: false, daysRemaining: 0, isExpired: false };
  }
  
  const now = new Date();
  const endDate = new Date(user.trialEndDate);
  const startDate = new Date(user.trialStartDate);
  
  if (now < startDate) {
    return { isInTrial: false, daysRemaining: 0, isExpired: false };
  }
  
  if (now >= endDate) {
    return { isInTrial: false, daysRemaining: 0, isExpired: true };
  }
  
  const diffTime = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return { isInTrial: true, daysRemaining, isExpired: false };
}

export function isInTrialPeriod(user: User): boolean {
  if (user.trialUsed) return false;
  if (!user.trialStartDate || !user.trialEndDate) return false;
  
  const now = new Date();
  const startDate = new Date(user.trialStartDate);
  const endDate = new Date(user.trialEndDate);
  
  return now >= startDate && now < endDate;
}

export const DATE_KEYWORDS = [
  'meet', 'date', 'coffee', 'dinner', 'see you', 'in person',
  'meet up', 'tomorrow', 'tonight', 'weekend', 'hang out',
  'lets meet', "let's meet", 'get together', 'drinks', 'lunch'
];

export function containsDateKeywords(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return DATE_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

export const AFRICAN_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt',
  'Tanzania', 'Uganda', 'Rwanda', 'Ethiopia', 'Senegal'
];

export function getPaymentGateway(country: string): 'Paystack' | 'Stripe' {
  return AFRICAN_COUNTRIES.includes(country) ? 'Paystack' : 'Stripe';
}
