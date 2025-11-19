import { User, Booking } from '../types';
import { mockDb } from './mockDatabase';

// NOTE: For Netlify deployment (Frontend Only), we route requests to the Mock Database.
// If you were running a real Node.js server, you would use fetch() here.

export const api = {
  signup: async (name: string, email: string, password: string): Promise<User> => {
    // Redirect to Mock DB
    return await mockDb.signup(name, email, password);
  },

  login: async (email: string, password: string): Promise<User> => {
    // Redirect to Mock DB
    return await mockDb.login(email, password);
  },

  createBooking: async (booking: any): Promise<Booking> => {
    // Redirect to Mock DB
    return await mockDb.createBooking(booking);
  },

  getBookings: async (userId: string, isAdmin: boolean = false): Promise<Booking[]> => {
    // Redirect to Mock DB
    return await mockDb.getBookings(userId, isAdmin);
  }
};
