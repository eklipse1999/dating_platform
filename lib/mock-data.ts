import { User, getTierFromPoints, ChurchInfo, IDVerification, SecurityVerification } from './types';

const FIRST_NAMES_MALE = ['James', 'Michael', 'David', 'Daniel', 'Matthew', 'Andrew', 'Joshua', 'Christopher', 'Joseph', 'Samuel', 'Benjamin', 'Nathan'];
const FIRST_NAMES_FEMALE = ['Sarah', 'Emily', 'Grace', 'Hannah', 'Rachel', 'Rebecca', 'Elizabeth', 'Mary', 'Ruth', 'Abigail', 'Faith', 'Hope'];
const LAST_NAMES = ['Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];

const CITIES = [
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston', country: 'USA', lat: 29.7604, lng: -95.3698 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
  { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
  { city: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
];

const CHURCHES: { name: string; branches: string[] }[] = [
  { name: 'Redeemed Christian Church of God', branches: ['City of David', 'Jesus House', 'King\'s Court', 'Victory Chapel', 'House of Praise'] },
  { name: 'Winners Chapel', branches: ['Faith Tabernacle', 'Liberation City', 'Covenant Place', 'Dominion City'] },
  { name: 'Christ Embassy', branches: ['Loveworld Arena', 'Healing School', 'Christ Embassy Central'] },
  { name: 'Hillsong Church', branches: ['Hillsong NYC', 'Hillsong LA', 'Hillsong London', 'Hillsong Sydney'] },
  { name: 'Elevation Church', branches: ['Ballantyne', 'Blakeney', 'University City', 'Matthews'] },
  { name: 'Saddleback Church', branches: ['Lake Forest', 'San Clemente', 'Irvine', 'Rancho Capistrano'] },
  { name: 'Lakewood Church', branches: ['Houston Central', 'Lakewood Online'] },
  { name: 'Life.Church', branches: ['Edmond', 'Oklahoma City', 'Tulsa', 'Dallas'] },
  { name: 'Bethel Church', branches: ['Redding', 'San Francisco', 'Los Angeles'] },
  { name: 'Gateway Church', branches: ['Southlake', 'Dallas', 'Fort Worth', 'Frisco'] },
];

const BIOS = [
  "Passionate about faith and family. Looking for someone who shares my values and loves adventure.",
  "Church worship leader seeking a partner who loves music and serving the community.",
  "Software engineer with a heart for missions. Love hiking, coffee, and deep conversations.",
  "Teacher by day, volunteer by night. Seeking someone who values kindness and laughter.",
  "Business owner who believes in faith, family, and giving back. Ready for something real.",
  "Medical professional who loves travel and trying new cuisines. Faith is my foundation.",
  "Creative soul passionate about art and worship. Looking for my partner in prayer.",
  "Fitness enthusiast who believes in healthy body, healthy spirit. Let's grow together!",
  "Youth pastor seeking someone who shares my heart for the next generation.",
  "Accountant with a love for board games and Bible study. Looking for my person.",
];

const DENOMINATIONS = ['Baptist', 'Catholic', 'Methodist', 'Presbyterian', 'Non-denominational', 'Pentecostal', 'Lutheran', 'Anglican'];

const INTERESTS = [
  ['Bible Study', 'Hiking', 'Music'],
  ['Cooking', 'Travel', 'Photography'],
  ['Fitness', 'Reading', 'Volunteering'],
  ['Art', 'Movies', 'Coffee'],
  ['Sports', 'Gaming', 'Podcasts'],
  ['Gardening', 'Baking', 'Crafts'],
];

const AVATARS = [
  '👤', '🙂', '😊', '🌟', '💫', '✨', '🎯', '🌸', '🌺', '🌻',
  '🦋', '🕊️', '💜', '💙', '🤍', '🧡', '💛', '💚', '🩵', '🩷',
  '😇', '😺', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomPoints(): number {
  const weights = [
    { points: getRandomNumber(0, 500), weight: 40 },
    { points: getRandomNumber(501, 1500), weight: 30 },
    { points: getRandomNumber(1501, 3000), weight: 15 },
    { points: getRandomNumber(3001, 5000), weight: 10 },
    { points: getRandomNumber(5001, 10000), weight: 5 },
  ];
  
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const w of weights) {
    random -= w.weight;
    if (random <= 0) return w.points;
  }
  
  return weights[0].points;
}

function generateChurchInfo(location: { city: string; country: string }): ChurchInfo {
  const church = getRandomElement(CHURCHES);
  return {
    name: church.name,
    branch: getRandomElement(church.branches),
    city: location.city,
    country: location.country,
  };
}

function generateIDVerification(accountAgeDays: number): IDVerification {
  const documentTypes: IDVerification['documentType'][] = ['passport', 'drivers_license', 'national_id'];
  
  // Determine status based on account age with some randomness
  let status: IDVerification['status'];
  const rand = Math.random();
  
  if (accountAgeDays >= 21) {
    // Older accounts: 70% verified, 15% submitted, 10% rejected, 5% pending
    if (rand > 0.3) status = 'verified';
    else if (rand > 0.15) status = 'submitted';
    else if (rand > 0.05) status = 'rejected';
    else status = 'pending';
  } else {
    // Newer accounts: 20% verified, 40% submitted, 10% rejected, 30% pending
    if (rand > 0.8) status = 'verified';
    else if (rand > 0.4) status = 'submitted';
    else if (rand > 0.3) status = 'rejected';
    else status = 'pending';
  }
  
  const baseVerification: IDVerification = { status };
  
  if (status !== 'pending') {
    baseVerification.documentType = getRandomElement(documentTypes);
    baseVerification.submittedAt = new Date(Date.now() - getRandomNumber(1, Math.max(1, accountAgeDays)) * 24 * 60 * 60 * 1000);
  }
  
  if (status === 'verified') {
    baseVerification.verifiedAt = new Date(Date.now() - getRandomNumber(1, 14) * 24 * 60 * 60 * 1000);
  }
  
  if (status === 'rejected') {
    baseVerification.rejectionReason = 'Document unclear or expired. Please resubmit.';
  }
  
  return baseVerification;
}

function generateSecurityVerification(accountAgeDays: number): SecurityVerification {
  const isOlderAccount = accountAgeDays >= 14;
  
  return {
    emailVerified: Math.random() > 0.1, // 90% have email verified
    phoneVerified: Math.random() > 0.3, // 70% have phone verified
    twoFactorEnabled: isOlderAccount && Math.random() > 0.6, // 40% of older accounts have 2FA
    lastPasswordChange: isOlderAccount ? new Date(Date.now() - getRandomNumber(1, 30) * 24 * 60 * 60 * 1000) : undefined,
    securityQuestionsSet: Math.random() > 0.4, // 60% have security questions
    trustedDevices: getRandomNumber(1, 3),
    lastSecurityCheck: new Date(Date.now() - getRandomNumber(1, 7) * 24 * 60 * 60 * 1000),
  };
}

export function generateMockUsers(count: number = 25): User[] {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = getRandomElement(gender === 'male' ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
    const lastName = getRandomElement(LAST_NAMES);
    const location = getRandomElement(CITIES);
    const points = generateRandomPoints();
    const accountAgeDays = getRandomNumber(1, 60);
    const accountCreatedAt = new Date();
    accountCreatedAt.setDate(accountCreatedAt.getDate() - accountAgeDays);
    
    const idVerification = generateIDVerification(accountAgeDays);
    const isFullyVerified = accountAgeDays >= 21 && idVerification.status === 'verified';
    
    users.push({
      id: `user-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      age: getRandomNumber(22, 40),
      gender,
      phone: `+1${getRandomNumber(200, 999)}${getRandomNumber(100, 999)}${getRandomNumber(1000, 9999)}`,
      bio: getRandomElement(BIOS),
      location: {
        lat: location.lat,
        lng: location.lng,
        city: location.city,
        country: location.country,
      },
      distance: `${(Math.random() * 50).toFixed(1)} km`,
      points,
      tier: getTierFromPoints(points),
      accountCreatedAt,
      isVerified: isFullyVerified,
      avatar: AVATARS[i % AVATARS.length],
      photos: [],
      denomination: getRandomElement(DENOMINATIONS),
      interests: getRandomElement(INTERESTS),
      faithJourney: "My faith journey began in childhood and has grown stronger through life's challenges.",
      values: ['Family', 'Integrity', 'Compassion', 'Growth'],
      church: generateChurchInfo(location),
      idVerification,
      securityVerification: generateSecurityVerification(accountAgeDays),
      joinDate: accountCreatedAt,
      likes: getRandomNumber(10, 500),
      lastActive: getRandomElement(['now', '5m', '15m', '1h', '2h', '5h', '1d']),
    });
  }
  
  return users;
}

export const MOCK_USERS = generateMockUsers(25);

export const MOCK_CURRENT_USER: User = {
  id: 'current-user',
  name: 'John Doe',
  email: 'john.doe@email.com',
  age: 28,
  gender: 'male',
  phone: '+1234567890',
  bio: "Passionate about faith and finding meaningful connections. Love outdoor adventures and deep conversations.",
  location: {
    lat: 40.7128,
    lng: -74.0060,
    city: 'New York',
    country: 'USA',
  },
  points: 0,
  tier: 'Bronze',
  accountCreatedAt: new Date(),
  isVerified: false,
  avatar: '🙂',
  photos: [],
  denomination: 'Non-denominational',
  interests: ['Bible Study', 'Hiking', 'Music'],
  faithJourney: "My faith has been my anchor through all of life's seasons.",
  values: ['Family', 'Integrity', 'Compassion'],
  church: {
    name: 'Hillsong Church',
    branch: 'Hillsong NYC',
    city: 'New York',
    country: 'USA',
  },
  idVerification: {
    status: 'pending',
  },
  securityVerification: {
    emailVerified: true,
    phoneVerified: false,
    twoFactorEnabled: false,
    securityQuestionsSet: false,
    trustedDevices: 1,
  },
};
