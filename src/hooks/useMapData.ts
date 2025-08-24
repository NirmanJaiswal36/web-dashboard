import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { MapFilters } from '@/components/home/HomeDashboard';

export interface Sighting {
  id: string;
  location: { lat: number; lng: number };
  timestamp: string;
  status: 'active' | 'sterilized' | 'resolved';
  photo_url?: string;
  notes?: string;
  species?: string;
  reporter?: string;
  mission_id?: string;
}

export interface Drive {
  id: string;
  title: string;
  center: { lat: number; lng: number };
  polygon?: any;
  status?: string;
  date?: string;
}

export interface Emergency {
  id: string;
  title: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  photo_url?: string;
  created_at: string;
}

export interface MapData {
  sightings: Sighting[];
  drives: Drive[];
  emergencies: Emergency[];
  statistics: {
    total_sightings: number;
    sterilized: number;
    active: number;
    hotspots: Array<{ lat: number; lng: number; intensity: number }>;
  };
}

// Convert map bounds to bbox string format
const boundsToBoxString = (bounds: any): string => {
  if (!bounds) return '';
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
};

// Fetch sightings with filters
const fetchSightings = async (filters: MapFilters, bbox: string): Promise<Sighting[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.timeRange.from) params.append('from', filters.timeRange.from);
    if (filters.timeRange.to) params.append('to', filters.timeRange.to);
    if (bbox) params.append('bbox', bbox);
    if (filters.status.length > 0) params.append('status', filters.status.join(','));
    if (filters.species) params.append('species', filters.species);
    if (filters.driveId) params.append('drive_id', filters.driveId);
    if (filters.searchQuery) params.append('q', filters.searchQuery);
    params.append('limit', '1000');

    const response = await api.get(`/api/sightings/?${params.toString()}`);
    
    // Convert FeatureCollection to Sighting array
    if (response.data.type === 'FeatureCollection') {
      return response.data.features.map((feature: any) => ({
        id: feature.properties.id,
        location: {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        },
        timestamp: feature.properties.timestamp,
        status: feature.properties.status,
        photo_url: feature.properties.photo_url,
        notes: feature.properties.notes,
        species: feature.properties.species,
        reporter: feature.properties.reporter,
        mission_id: feature.properties.mission_id
      }));
    }
    
    return response.data || [];
  } catch (error) {
    console.warn('Sightings API not available, using mock data');
    // Return mock data for development
    return [
      {
        id: '1',
        location: { lat: 28.6139, lng: 77.2090 },
        timestamp: new Date().toISOString(),
        status: 'active',
        notes: 'Stray dog spotted near market',
        species: 'dog',
        reporter: 'Local volunteer'
      },
      {
        id: '2',
        location: { lat: 28.6149, lng: 77.2100 },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'sterilized',
        notes: 'Cat successfully sterilized',
        species: 'cat',
        reporter: 'Vet team'
      }
    ];
  }
};

// Fetch drives
const fetchDrives = async (): Promise<Drive[]> => {
  try {
    const response = await api.get('/api/drives/?active=true');
    return response.data || [];
  } catch (error) {
    console.warn('Drives API not available, using mock data');
    return [
      {
        id: '1',
        title: 'South Delhi Drive',
        center: { lat: 28.5245, lng: 77.2066 },
        status: 'active'
      },
      {
        id: '2',
        title: 'Gurgaon Drive',
        center: { lat: 28.4595, lng: 77.0266 },
        status: 'active'
      }
    ];
  }
};

// Fetch emergencies
const fetchEmergencies = async (): Promise<Emergency[]> => {
  try {
    const response = await api.get('/api/emergencies/');
    return response.data || [];
  } catch (error) {
    console.warn('Emergencies API not available, using mock data');
    return [
      {
        id: '1',
        title: 'Injured dog',
        lat: 28.6139,
        lng: 77.2090,
        severity: 'high',
        description: 'Dog with broken leg needs immediate attention',
        created_at: new Date().toISOString()
      }
    ];
  }
};

// Fetch statistics
const fetchStatistics = async (filters: MapFilters, bbox: string) => {
  try {
    const params = new URLSearchParams();
    if (filters.timeRange.from) params.append('from', filters.timeRange.from);
    if (filters.timeRange.to) params.append('to', filters.timeRange.to);
    if (bbox) params.append('bbox', bbox);

    const response = await api.get(`/api/statistics/overview/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.warn('Statistics API not available, using mock data');
    return {
      total_sightings: 156,
      sterilized: 89,
      active: 67,
      hotspots: [
        { lat: 28.6139, lng: 77.2090, intensity: 0.8 },
        { lat: 28.6149, lng: 77.2100, intensity: 0.6 }
      ]
    };
  }
};

export function useMapData(filters: MapFilters, mapBounds: any) {
  // Convert bounds to bbox string
  const bbox = useMemo(() => boundsToBoxString(mapBounds), [mapBounds]);

  // Create query key that changes when filters or bounds change
  const queryKey = useMemo(() => [
    'mapData',
    filters.timeRange,
    filters.status,
    filters.species,
    filters.driveId,
    filters.searchQuery,
    filters.severityFilter,
    bbox
  ], [filters, bbox]);

  // Fetch all data
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<MapData> => {
      const [sightings, drives, emergencies, statistics] = await Promise.all([
        fetchSightings(filters, bbox),
        fetchDrives(),
        fetchEmergencies(),
        fetchStatistics(filters, bbox)
      ]);

      return {
        sightings,
        drives,
        emergencies,
        statistics
      };
    },
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
    staleTime: 5000, // Data considered fresh for 5 seconds
    enabled: !!mapBounds // Only fetch when map bounds are available
  });

  return query;
}
