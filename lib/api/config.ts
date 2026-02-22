export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://commitedbyfaithbackend-production.up.railway.app',
  ENDPOINTS: {
    // Authentication & User Management
    AUTH: {
      LOGIN: '/users/login',
      REGISTER: '/users/register',
      LOGOUT: '/users/logout',
    },
    
    // User Profile & Data
    USERS: {
      ME: '/users/me',                    // Get current user
      UPDATE: '/update/user',              // Update user profile
      BY_ADMIN: '/users/by/Admin',         // Get all users (discover)
      UPDATE_LOCATION: '/users/location',  // Update location
    },
    
    // Likes & Matching
    LIKES: {
      LIKE: '/like',                       // Like a user
      UNLIKE: '/like/unlike',              // Unlike a user
      MATCHES: '/like/matches',            // Get matches
    },

    // Matches (mutual)
    MATCHES: {
      LIST: '/matches',                    // Get mutual matches
    },

    // Blocking
    BLOCKS: {
      CREATE: '/blocks/create',            // Block a user
      LIST: '/blocks/list/user',           // Get blocked users
      REMOVE: '/blocks/remove',           // Unblock a user
      CAN_INTERACT: '/block/can-interact', // Check if can interact
    },

    // Events
    EVENTS: {
      LIST: '/events',                     // Get all events
      CREATE: '/events/create',            // Create event
      GET_BY_ID: '/events',                // Get event by ID
      UPDATE: '/events',                   // Update event
      DELETE: '/events',                   // Delete event
    },

    // Payments
    PAYMENTS: {
      PROCESS: '/payments',                // Process payment
    },

    // Profile
    PROFILE: {
      GET_BY_ID: '/profile',               // Get profile by ID
      UPLOAD_IMAGE: '/profile/upload-image', // Upload profile image
    },

    // Messages
    MESSAGES: {
      LIST: '/messages',                   // Get messages
      SEND: '/messages/send',              // Send message
      CONVERSATIONS: '/messages/conversations', // Get conversations
    },
  }
};

export default API_CONFIG;
