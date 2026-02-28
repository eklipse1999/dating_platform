import apiClient from '../client';
import { API_CONFIG } from '../config';

// POST /payments — exact body schema from Swagger
export interface PaymentData {
  amount: number;      // number (required)
  plan_id: string;     // string (required)
  type: string;        // string e.g. "card", "paystack", "stripe"
}

// POST /payments response — 200 OK with additionalProp map
export interface PaymentResponse {
  success?: boolean;
  transactionId?: string;
  reference?: string;
  points?: number;
  message?: string;
  [key: string]: any;  // Backend returns additionalProp1/2/3 shape
}

// GET /plans and GET /plans/{id} — exact schema from Swagger
export interface Plan {
  id: string;
  name: string;
  price: number;
  points: number;
  currency: string;
  tierID: string;              // maps to user's tier level
  canMessage: boolean;         // whether this plan allows messaging
  canScheduleDate: boolean;    // whether this plan allows scheduling dates
  dailyMessageLimit: number;   // 0 = unlimited
  createdAt: string;
}

const silent = (status?: number) => [401, 404, 405].includes(status ?? 0);

export const paymentsService = {

  // POST /payments  — exact Swagger body: { amount: number, plan_id: string, type: string }
  // type: "stripe" | "paystack" based on user's country
  async processPayment(data: PaymentData): Promise<PaymentResponse> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PAYMENTS.PROCESS, {
      amount:  data.amount,   // backend's own cents value (e.g. 999 for $9.99)
      plan_id: data.plan_id,  // UUID from GET /plans
      type:    data.type,     // "stripe" or "paystack"
    });
    // 200 OK — return raw response; calling code handles it
    return response.data;
    // Note: apiClient's response interceptor will throw on 4xx/5xx,
    // so the calling code's try/catch will receive the real error.
  },

  // GET /plans  — public endpoint, no auth required
  async getPlans(): Promise<Plan[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.PLANS.LIST);
      // Handle both array and wrapped { plans: [] } responses
      const raw: any[] = Array.isArray(response.data)
        ? response.data
        : response.data?.plans || response.data?.data || [];
      if (!raw.length) return [];
      // Normalise PascalCase keys (ID, Name, Price, CanMessage etc.)
      return raw.map((p: any) => ({
        id:               p.ID              ?? p.id              ?? '',
        name:             p.Name            ?? p.name            ?? '',
        price:            p.Price           ?? p.price           ?? 0,
        points:           p.Points          ?? p.points          ?? 0,
        currency:         p.Currency        ?? p.currency        ?? 'USD',
        tierID:           p.TierID          ?? p.tierID          ?? '',
        canMessage:       p.CanMessage      ?? p.canMessage      ?? false,
        canScheduleDate:  p.CanScheduleDate ?? p.canScheduleDate ?? false,
        // null from backend = unlimited; normalise to 0
        dailyMessageLimit: (p.DailyMessageLimit ?? p.dailyMessageLimit) ?? 0,
        createdAt:        p.CreatedAt       ?? p.createdAt       ?? '',
      }));
    } catch (error: any) {
      // Always log — plans are critical, silent failures hide real issues
      console.error('GET /plans failed:', error.response?.status, error.response?.data ?? error.message);
      return [];
    }
  },

  // GET /plans/{id}  — get a single plan by ID
  async getPlanById(planId: string): Promise<Plan> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PLANS.GET_BY_ID}/${planId}`);
      return response.data;
    } catch (error: any) {
      if (!silent(error.response?.status)) {
        console.error('Get plan error:', error.response?.data || error.message);
      }
      throw new Error(error.response?.data?.message || 'Plan not found');
    }
  },
};

export default paymentsService;