import apiClient from '../client';
import { API_CONFIG } from '../config';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizerId: string;
  attendees?: string[];
  maxAttendees?: number;
  imageUrl?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: Date | string;
  location: string;
  maxAttendees?: number;
}

export const eventsService = {
  /**
   * Get all events
   */
  async getEvents(): Promise<Event[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.EVENTS.LIST);
      return response.data.events || response.data || [];
    } catch (error: any) {
      console.error('Get events error:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<Event> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID}/${eventId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get event by ID error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  },

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventData): Promise<Event> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.EVENTS.CREATE, data);
      return response.data;
    } catch (error: any) {
      console.error('Create event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  /**
   * Update an event
   */
  async updateEvent(eventId: string, data: Partial<CreateEventData>): Promise<Event> {
    try {
      const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.EVENTS.UPDATE}/${eventId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.EVENTS.DELETE}/${eventId}`);
    } catch (error: any) {
      console.error('Delete event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  },

  /**
   * Join an event
   */
  async joinEvent(eventId: string): Promise<void> {
    try {
      // This might need adjustment based on actual backend endpoint
      await apiClient.post(`${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID}/${eventId}/join`);
    } catch (error: any) {
      console.error('Join event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to join event');
    }
  },

  /**
   * Leave an event
   */
  async leaveEvent(eventId: string): Promise<void> {
    try {
      // This might need adjustment based on actual backend endpoint
      await apiClient.post(`${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID}/${eventId}/leave`);
    } catch (error: any) {
      console.error('Leave event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to leave event');
    }
  },
};

export default eventsService;