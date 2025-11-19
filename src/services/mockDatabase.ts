import { User, Booking, ServicePackage, ServiceType } from '../types';

// Mock Data for Services
export const SERVICES: ServicePackage[] = [
  {
    id: 's1',
    type: ServiceType.WEDDING,
    title: 'Royal Wedding Package',
    description: 'Complete floral arrangement, stage setup, and lighting for your big day.',
    price: 150000,
    image: 'wedding.jpg',
    fallbackImage: 'https://img.freepik.com/premium-photo/indian-hindu-wedding-venue-decoration_747653-20329.jpg?w=996',
    features: ['Stage Decoration', 'Entrance Arch', 'Varmala Exchange Setup', 'Ambient Lighting']
  },
  {
    id: 's2',
    type: ServiceType.BIRTHDAY,
    title: 'Kids Wonderland Theme',
    description: 'Balloon arches, cutouts, and fun themes for children.',
    price: 15000,
    image: 'birthday.jpg',
    fallbackImage: 'https://www.oyorooms.com/blog/wp-content/uploads/2018/02/How-much-space-does-it-has.png',
    features: ['Balloon Arch', 'Theme Cutouts', 'Cake Table Decor', 'Party Hats']
  },
  {
    id: 's3',
    type: ServiceType.CORPORATE,
    title: 'Executive Corporate Gala',
    description: 'Professional and elegant setup for annual meets and parties.',
    price: 75000,
    image: 'corporate.jpg',
    fallbackImage: 'https://www.oyorooms.com/blog/wp-content/uploads/2018/03/fe-30.jpg',
    features: ['Podium Setup', 'Projector Screens', 'Elegant Table Centerpieces', 'Sound System']
  },
  {
    id: 's4',
    type: ServiceType.CATERING,
    title: 'Premium Buffet Catering',
    description: 'Delicious veg and non-veg multi-cuisine spread.',
    price: 500, 
    image: 'catering.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    features: ['3 Starters', 'Main Course (Veg/Non-Veg)', 'Desserts', 'Mineral Water']
  },
  {
    id: 's5',
    type: ServiceType.HOUSE_WARMING,
    title: 'Traditional House Warming',
    description: 'Flower decoration and traditional setups for Gruha Pravesham.',
    price: 25000,
    image: 'house.jpg',
    fallbackImage: 'https://i.pinimg.com/originals/51/c8/1c/51c81c5cf9b7c99237f7f4df8219ead3.jpg',
    features: ['Mango Leaf Torans', 'Marigold Strings', 'Rangoli Design', 'Puja Setup']
  },
  {
    id: 's6',
    type: ServiceType.PHOTO_VIDEO,
    title: 'Memories Package',
    description: 'Candid photography and cinematic videography.',
    price: 40000,
    image: 'photography.jpg',
    fallbackImage: 'https://www.photojaanic.com/blog/wp-content/uploads/sites/2/2017/03/02.jpg',
    features: ['Candid Photographer', 'Videographer', 'Drone Shot', 'Edited Album']
  }
];

// Simulating Database Interactions
const USERS_KEY = 'tirupalappa_users';
const BOOKINGS_KEY = 'tirupalappa_bookings';

export const mockDb = {
  signup: async (name: string, email: string, password: string): Promise<User> => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.find((u) => u.email === email)) {
      throw new Error('User already exists');
    }

    // Check if this is the Admin
    const isAdmin = email === 'admin@eventhub.com' || email === 'thirupalappaeventhub@gmail.com';

    const newUser: User = { id: Date.now().toString(), name, email, isAdmin };
    users.push({ ...newUser, password }); // In real app, hash password
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    await new Promise(r => setTimeout(r, 500));
    return newUser;
  },

  login: async (email: string, password: string): Promise<User> => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];
    
    // Admin simulation check if not found in local DB (for demo convenience)
    if (email === 'admin@eventhub.com') {
      return { id: 'admin-001', name: 'Agency Admin', email, isAdmin: true };
    }

    const user = users.find((u) => u.email === email && u.password === password);
    
    await new Promise(r => setTimeout(r, 500));
    
    if (!user) throw new Error('Invalid credentials');
    const { password: _, ...safeUser } = user;
    return safeUser as User;
  },

  createBooking: async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
    const bookingsStr = localStorage.getItem(BOOKINGS_KEY);
    const bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : [];

    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    console.log(`Booking created for ${booking.userEmail}`);
    await new Promise(r => setTimeout(r, 1000));
    return newBooking;
  },

  getBookings: async (userId: string, isAdmin: boolean = false): Promise<Booking[]> => {
    const bookingsStr = localStorage.getItem(BOOKINGS_KEY);
    const bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : [];
    
    if (isAdmin) {
      // Agency View: Return ALL bookings sorted by newest first
      return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Customer View: Return only their bookings
      return bookings.filter(b => b.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }
};
