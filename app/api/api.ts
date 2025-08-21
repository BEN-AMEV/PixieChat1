import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://10.252.234.246:5001', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User interface for API responses
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  username: string;
  avatarId?: string;
}

// Auth response interfaces to match backend
export interface AuthResponse {
  token: string;
  message: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    avatarId: string;
    dateOfBirth: string;
  };
}

// Authentication API methods
export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    dateOfBirth: string;
    avatarId?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

// User search API methods
export const userApi = {
  searchUsers: async (query?: string): Promise<User[]> => {
    try {
      const params = query ? { query } : {};
      const response = await api.get('/auth/users/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }
};

// Mock API responses for location sharing (for testing purposes)
const mockFriendsLocations = [
  {
    id: '1',
    latitude: 5.6047,
    longitude: -0.186,
    status: 'active',
    activity: 'at Starbucks',
    speed: 0,
    isOnline: true,
    shareLocation: true,
  },
  {
    id: '2',
    latitude: 5.6027,
    longitude: -0.188,
    status: 'idle',
    activity: 'listening to music',
    speed: 25,
    isOnline: true,
    shareLocation: true,
  },
  {
    id: '3',
    latitude: 5.6057,
    longitude: -0.185,
    status: 'active',
    activity: 'running',
    speed: 12,
    isOnline: true,
    shareLocation: true,
  },
  {
    id: '4',
    latitude: 5.6017,
    longitude: -0.189,
    status: 'sleeping',
    activity: 'taking photos',
    speed: 0,
    isOnline: false,
    shareLocation: true,
  }
];

// Mock API methods for testing
export const mockApi = {
  get: async (url: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url === '/friends/locations') {
      return {
        data: {
          friends: mockFriendsLocations.map(friend => ({
            ...friend,
            // Add some random movement to simulate real-time updates
            latitude: friend.latitude + (Math.random() - 0.5) * 0.0001,
            longitude: friend.longitude + (Math.random() - 0.5) * 0.0001,
          }))
        }
      };
    }
    
    if (url === '/auth/users') {
      return {
        data: [
          { id: 1, firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01', email: 'john@example.com', username: 'johndoe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', dateOfBirth: '1992-05-15', email: 'jane@example.com', username: 'janesmith' },
          { id: 3, firstName: 'Mike', lastName: 'Johnson', dateOfBirth: '1988-12-20', email: 'mike@example.com', username: 'mikejohnson' },
        ]
      };
    }
    
    if (url === '/auth/users/search') {
      return {
        data: [
          { id: 1, firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01', email: 'john@example.com', username: 'johndoe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', dateOfBirth: '1992-05-15', email: 'jane@example.com', username: 'janesmith' },
        ]
      };
    }
    
    return { data: null };
  },
  
  post: async (url: string, data: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (url === '/auth/login') {
      // Mock successful login
      console.log('Mock login attempt:', data);
      return { 
        data: { 
          token: 'mock-jwt-token-12345',
          user: {
            id: 1,
            username: data.username,
            email: `${data.username}@example.com`,
            firstName: 'Mock',
            lastName: 'User'
          }
        } 
      };
    }
    
    if (url === '/auth/register') {
      // Mock successful registration
      console.log('Mock registration attempt:', data);
      return { 
        data: { 
          token: 'mock-jwt-token-12345',
          user: {
            id: 1,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          }
        } 
      };
    }
    
    if (url === '/location/share') {
      console.log('Location shared:', data);
      return { data: { success: true } };
    }
    
    return { data: { success: true } };
  }
};

// Use mock API for testing (comment out these lines to use real API)
// api.get = mockApi.get as any;
// api.post = mockApi.post as any;

export default api;
