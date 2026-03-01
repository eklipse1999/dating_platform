import apiClient from '../client';
import { API_CONFIG } from '../config';

// Exact schema from backend Swagger
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  city?: string;
  category?: string;
  host?: string;
  hostAvatar?: string;
  attendees?: number;
  maxAttendees?: number;
  isVirtual?: boolean;
  isFree?: boolean;
  isSponsored?: boolean;
  price?: number;
  image?: string;
  tags?: string[];
  distance?: string;
  user1_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// POST /events — full schema the backend accepts
export interface CreateEventData {
  title: string;
  description: string;
  date: string | Date;    // accepts Date object or ISO string — serialised before sending
  time?: string;
  location: string;
  city?: string;
  category?: string;
  host?: string;
  hostAvatar?: string;
  attendees?: number;
  maxAttendees?: number;
  isVirtual?: boolean;
  isFree?: boolean;
  isSponsored?: boolean;
  price?: number;
  image?: string;
  tags?: string[];
  distance?: string;
}

const isSilentStatus = (status?: number) => status === 404 || status === 405 || status === 401;

export const eventsService = {

  // NOTE: There is no GET /events list endpoint in the Swagger spec.
  // This returns an empty array — events are loaded by ID or from local state.
  async getEvents(): Promise<Event[]> {
    return [];
  },

  // GET /events/{id}
  async getEventById(eventId: string): Promise<Event> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}`);
      return response.data;
    } catch (error: any) {
      if (!isSilentStatus(error.response?.status)) {
        console.error('Get event error:', error.response?.data || error.message);
      }
      throw new Error(error.response?.data?.message || 'Event not found');
    }
  },

  // POST /events  → 201 on success
  async createEvent(data: CreateEventData): Promise<Event> {
    try {
      // Serialise date to ISO string — backend expects string, not Date object
      const payload = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.EVENTS.BASE, payload);
      return response.data;
    } catch (error: any) {
      if (!isSilentStatus(error.response?.status)) {
        console.error('Create event error:', error.response?.data || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  // PUT /events/{id}  → 200 on success
  async updateEvent(eventId: string, data: Partial<CreateEventData>): Promise<Event> {
    try {
      const payload = {
        ...data,
        ...(data.date ? { date: data.date instanceof Date ? data.date.toISOString() : data.date } : {}),
      };
      const response = await apiClient.put(
        `${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      if (!isSilentStatus(error.response?.status)) {
        console.error('Update event error:', error.response?.data || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  // DELETE /events/{id}  → 204 on success
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}`);
    } catch (error: any) {
      if (!isSilentStatus(error.response?.status)) {
        console.error('Delete event error:', error.response?.data || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  },

  // POST /events/{id}/join  (optimistic — no swagger entry yet)
  async joinEvent(eventId: string): Promise<void> {
    try {
      await apiClient.post(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}/join`);
    } catch (error: any) {
      // Silently ignore — optimistic UI handles state
      if (!isSilentStatus(error.response?.status)) {
        console.error('Join event error:', error.response?.data || error.message);
      }
    }
  },

  // POST /events/{id}/leave  (optimistic — no swagger entry yet)
  async leaveEvent(eventId: string): Promise<void> {
    try {
      await apiClient.post(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}/leave`);
    } catch (error: any) {
      // Silently ignore — optimistic UI handles state
      if (!isSilentStatus(error.response?.status)) {
        console.error('Leave event error:', error.response?.data || error.message);
      }
    }
  },
};

export default eventsService;