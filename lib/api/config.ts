export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://commitedbyfaithbackend-production.up.railway.app',
  ENDPOINTS: {
    // Authentication & User Management
    AUTH: {
      LOGIN: '/users/login',       // POST /users/login    — body: { email, password }
      REGISTER: '/users/register', // POST /users/register — body: models.User
      // NOTE: /users/logout and /auth/refresh are NOT in the Swagger spec — handled client-side
    },
    
    // User Profile & Data
    USERS: {
      ME: '/users/me',                    // GET    /users/me         — get current user profile (BearerAuth)
      BY_ADMIN: '/users/by/admin',        // GET    /users/by/admin   — all users except self (BearerAuth)
      UPDATE_LOCATION: '/users/location', // PUT    /users/location   — body: { location: string }
      DELETE: '/delete/user',             // DELETE /delete/user      — delete authenticated user
    },
    
    // Likes & Matching
    // Likes — GET /like, POST /like, DELETE /like, GET /like/matches
    LIKES: {
      LIKE: '/like',                       // GET/POST /like
      UNLIKE: '/like',                     // DELETE   /like  — same path, different method
      MATCHES: '/like/matches',            // GET      /like/matches
    },

    // Matches (mutual)
    MATCHES: {
      LIST: '/matches',                    // Get mutual matches
    },

    // Blocking
    // Blocks — exact paths from Swagger
    BLOCKS: {
      CREATE: '/block/create',             // POST /block/create        — body: { blocker_id, blocked_id }
      LIST: '/block/list',                 // GET  /block/list/{user_id} — path param
      REMOVE: '/block/remove',             // POST /block/remove        — body: { blocker_id, blocked_id }
      CAN_INTERACT: '/block/can-interact', // GET  /block/can-interact/{user_a}/{user_b} — path params
    },

    // Events — Swagger: POST /events, GET /events/{id}, PUT /events/{id}, DELETE /events/{id}
    // NOTE: There is NO GET /events list endpoint in the spec
    EVENTS: {
      BASE: '/events',     // POST /events              — create (body: models.Event) → 201
                           // GET  /events/{id}         — get by id
                           // PUT  /events/{id}         — update → 200
                           // DELETE /events/{id}       — delete → 204
    },

    // Payments
    // Payments — POST /payments: body { amount, plan_id, type }
    PAYMENTS: {
      PROCESS: '/payments',                // POST /payments
    },

    // Plans — GET /plans, GET /plans/{id}
    PLANS: {
      LIST: '/plans',                      // GET /plans        — get all plans
      GET_BY_ID: '/plans',                 // GET /plans/{id}   — get plan by ID
    },

    // Profile — confirmed from Swagger screenshots
    PROFILE: {
      GET_BY_ID:    '/profile',               // GET  /profile/{id}          — id = UUID path param
      UPLOAD_IMAGE: '/profile/upload/image',  // POST /profile/upload/image  — formData field: 'file'
      UPDATE:       '/update/user',           // PUT  /update/user           — body: age,bio,career,church_branch,church_name,denomination,gender,interests[],key,looking_for,profile_image
    },

    // Messages — NOT in Swagger spec, these are best-guess endpoints
    // If they 404/405, the backend may not have implemented them yet
    MESSAGES: {
      LIST: '/messages',                        // GET  /messages (unconfirmed)
      SEND: '/messages/send',                   // POST /messages/send (unconfirmed)
      CONVERSATIONS: '/messages/conversations', // GET  /messages/conversations (unconfirmed)
    },
  }
};

export default API_CONFIG;