// src/lib/mockData.ts

import { Emergency } from '@/types/emergency';
import { DriveDashboardResponse } from '@/types/drives';

export const mockEmergencies: Emergency[] = [
  {
    id: 1,
    title: 'Injured dog reported',
    lat: 12.9716,
    lng: 77.5946,
    severity: 'high',
    description: 'A dog with a leg injury was spotted near the park. Needs immediate attention.',
    created_at: new Date().toISOString(),
    photo_url: 'https://picsum.photos/300/200?random=1',
  },
  {
    id: 2,
    title: 'Stray cat colony',
    lat: 12.9800,
    lng: 77.6000,
    severity: 'medium',
    description: 'Large colony of stray cats needs sterilization.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    title: 'Sick puppy',
    lat: 12.9650,
    lng: 77.5900,
    severity: 'critical',
    description: 'Very young puppy showing signs of illness.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const mockDriveDashboard: DriveDashboardResponse = {
  mission_details: {
    id: 1,
    title: 'Ward 12 Sterilization Drive',
    description: 'Comprehensive sterilization drive for Ward 12 area',
    date: '2025-08-29',
    range_km: 1.2,
    city: 'Bengaluru',
    area: 'Ward 12',
    center: { lat: 12.9716, lng: 77.5946 },
    community_forming: true,
    created_at: new Date().toISOString(),
  },
  kpis: {
    animals_covered: 45,
    tagged_sterilized: 32,
    area_coverage_km2: 2.4,
  },
  geo_json: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
        },
        properties: {
          id: 1,
          type: 'sighting',
          status: 'sterilized',
          timestamp: new Date().toISOString(),
          photo_url: 'https://picsum.photos/100/100?random=2',
          notes: 'Dog sterilized successfully',
          reporter: {
            id: 1,
            name: 'Dr. Priya',
            points: 250,
          },
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [77.5950, 12.9720],
        },
        properties: {
          id: 2,
          type: 'sighting',
          status: 'active',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          photo_url: 'https://picsum.photos/100/100?random=3',
          notes: 'Cat spotted, needs attention',
          reporter: {
            id: 2,
            name: 'Volunteer Raj',
            points: 120,
          },
        },
      },
    ],
  },
  volunteers: [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      points: 250,
      avatar_url: 'https://picsum.photos/50/50?random=4',
    },
    {
      id: 2,
      name: 'Volunteer Raj',
      points: 120,
      avatar_url: 'https://picsum.photos/50/50?random=5',
    },
    {
      id: 3,
      name: 'Animal Lover Maya',
      points: 95,
      avatar_url: 'https://picsum.photos/50/50?random=6',
    },
  ],
};
