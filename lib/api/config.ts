export const API_CONFIG = {
  BASE_URL: 'https://commitedbyfaithbackend-production.up.railway.app',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/users/login',
      REGISTER: '/users/register',
      LOGOUT: '/users/logout',
    },
    USERS: {
      PROFILE: '/users/me',
      UPDATE: '/update/user',
      DISCOVER: '/users/by/Admin',
      SEARCH: '/users/search',
      GET_BY_ID: '/users',
      UPDATE_LOCATION: '/users/location',
    },
    BLOCKS: {
      LIST: '/blocks/list/user',
      CREATE: '/blocks/create',
      REMOVE: '/blocks/remove',
    },
    MATCHES: {
      LIST: '/matches',
      LIKE: '/like',
      UNLIKE: '/like',
    },
    LIKES: {
      LIST: '/like/matches',
      UNLIKE: '/like/unlike',
    },
    MESSAGES: {
      CONVERSATIONS: '/messages/conversations',
      SEND: '/messages/send',
      LIST: '/messages',
    },
    EVENTS: {
      LIST: '/events',
      GET_BY_ID: '/events',
      CREATE: '/events/create',
      UPDATE: '/events',
      DELETE: '/events',
    },
    PAYMENTS: {
      PROCESS: '/payments',
    },
    PROFILE: {
      GET_BY_ID: '/profile',
      UPLOAD_IMAGE: '/profile/upload-image',
      UPDATE: '/update/user',
    },
  }
};

export default API_CONFIG;