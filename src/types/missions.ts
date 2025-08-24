import { GeoJSONPolygon } from './drives';

// Re-export Drive types as Mission types since they're the same concept
export type { Drive as Mission, DriveKPIs as MissionKPIs, DriveDashboardResponse as MissionDashboardResponse } from './drives';

// Mission-specific types that extend the drive concept
export interface Sighting {
  id: number;
  mission_id: number;
  name: string;
  sterilized: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  created_at: string;
  updated_at?: string;
}

export interface MissionStatistics {
  total_sightings: number;
  sterilized_count: number;
  completion_percentage: number;
  area_covered_km2: number;
}

// Form data interface for creating missions
export interface MissionFormData {
  title: string;
  description?: string;
  date?: string;
  city: string;
  area: string;
  center?: { lat: number; lng: number };
  polygon?: GeoJSONPolygon;
}

// City and area selection interfaces
export interface CityOption {
  label: string;
  value: string;
  lat: number;
  lon: number;
}

export interface AreaOption {
  label: string;
  value: string;
  lat: number;
  lon: number;
  city: string;
}
