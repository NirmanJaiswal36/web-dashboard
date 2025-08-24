// src/lib/api.ts
import axios from 'axios';
import { Emergency } from '@/types/emergency';

const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'pawhub_token';

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  }
};

// Set token on initialization if it exists
if (typeof window !== 'undefined') {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      // Redirect to login or trigger logout
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Drive API types and helpers
export interface DrivePayload {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  range_km: number | null;
  city: string;
  area: string;
  center: { lat: number; lng: number };
  community_forming: boolean;
  polygon: {
    type: 'Polygon';
    coordinates: number[][][]; // [lng, lat] order
  };
}

export interface DriveResponse {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export interface DriveDashboardResponse {
  mission_details: {
    id: string;
    title: string;
    description: string;
    date: string;
    center: { lat: number; lng: number };
    polygon: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    status: string;
    community_forming: boolean;
  };
  kpis: {
    animals_covered: number;
    tagged_sterilized: number;
    area_coverage_km2: number;
    volunteers_active: number;
  };
  geo_json: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
      };
      properties: {
        id: string;
        type: 'sighting' | 'sterilization' | 'medical';
        photo_url?: string;
        status: string;
        last_seen: string;
        reporter_name: string;
        notes?: string;
      };
    }>;
  };
  activity_feed: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    photo_url?: string;
    user_name: string;
  }>;
  volunteers: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    points: number;
    status: 'active' | 'invited' | 'pending';
  }>;
}

export const postDrive = async (payload: DrivePayload): Promise<DriveResponse> => {
  const response = await api.post('/api/drives/', payload);
  return response.data;
};

export const getDriveDashboard = async (id: string): Promise<DriveDashboardResponse> => {
  const response = await api.get(`/api/drives/${id}/dashboard/`);
  return response.data;
};

export const getEmergencies = async () => {
  const response = await api.get('/api/emergencies/');
  return response.data;
};

export const getEmergencyById = async (id: number) => {
  const response = await api.get(`/api/emergencies/${id}/`);
  return response.data;
};

export const createEmergency = async (emergencyData: Omit<Emergency, 'id' | 'created_at'>) => {
  const response = await api.post('/api/emergencies/', emergencyData);
  return response.data;
};

export const updateEmergencyStatus = async (id: number, status: string) => {
  const response = await api.patch(`/api/emergencies/${id}/`, { status });
  return response.data;
};

export default api;
