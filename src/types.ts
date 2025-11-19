export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export enum ServiceType {
  WEDDING = 'Wedding Decoration',
  BIRTHDAY = 'Birthday Decoration',
  CORPORATE = 'Corporate Party',
  CATERING = 'Catering Service',
  HOUSE_WARMING = 'House Warming',
  PHOTO_VIDEO = 'Photography & Videography',
  CUSTOM = 'Custom AI Plan'
}

export interface ServicePackage {
  id: string;
  type: ServiceType;
  title: string;
  description: string;
  price: number;
  image: string;
  fallbackImage?: string;
  features: string[];
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  guestCount: number;
  totalAmount: number;
  status: 'Confirmed' | 'Pending' | 'Completed';
  createdAt: string;
}

export interface AiPlanResponse {
  theme: string;
  suggestions: string[];
  estimatedBudgetRange: string;
}