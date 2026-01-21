
export type ServiceStatus = 'Available' | 'Busy' | 'Offline';
export type UserRole = 'user' | 'provider' | 'admin';

export type Category = 
  | 'Plumbing' 
  | 'Electrical' 
  | 'Tutoring' 
  | 'Mechanic' 
  | 'Home Maintenance' 
  | 'Gardening'
  | 'Cleaning'
  | 'Moving'
  | 'Pet Care'
  | 'Beauty'
  | 'Wellness'
  | 'Appliance Repair'
  | 'AC Repair';

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: Category;
  location: string;
  availability: ServiceStatus;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  price: string;
  avatar: string;
  lat: number;
  lng: number;
  description: string;
  longBio: string;
  skills: string[];
  yearsExperience: number;
  responseTime: string;
  verified: boolean;
  repeatCustomers: number;
  certifications: string[];
  equipment: string[];
  completedJobs: number;
  // Admin fields
  isRejected?: boolean;
  images?: string[];
}

export interface FilterState {
  search: string;
  category: string;
  location: string;
  availability: string;
}

export type AppView = 'home' | 'listings' | 'profile' | 'shortlist' | 'dashboard';
