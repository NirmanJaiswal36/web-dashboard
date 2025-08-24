// src/types/drives.ts
export type GeoJSONPolygon = { type: "Polygon"; coordinates: number[][][] };

export interface Drive {
  id?: number;
  title: string;
  description?: string;
  date?: string; // ISO
  range_km?: number;
  city: string;
  area: string;
  center: { lat: number; lng: number };
  community_forming?: boolean;
  polygon?: GeoJSONPolygon;
  created_at?: string;
}

export interface DriveKPIs {
  animals_covered: number;
  tagged_sterilized: number;
  area_coverage_km2: number;
}

export interface DriveVolunteer {
  id: number;
  name: string;
  points: number;
  avatar_url?: string;
}

export interface DriveDashboardResponse {
  mission_details: Drive;
  kpis: DriveKPIs;
  geo_json: {
    type: "FeatureCollection";
    features: any[];
  };
  volunteers: DriveVolunteer[];
}
