'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Mission, MissionDashboardResponse, Sighting, MissionStatistics } from '@/types/missions';

const USE_MOCK_DATA = true; // Set to false when backend is ready

export const useMissionAPI = () => {
  const queryClient = useQueryClient();

  // Create mission (same as drive)
  const createMissionMutation = useMutation({
    mutationFn: async (payload: Mission): Promise<Mission> => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { ...payload, id: Math.floor(Math.random() * 1000) + 1 };
      }
      const response = await api.post<Mission>('/api/missions/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  // Get mission dashboard (same as drive dashboard)
  const useMissionDashboard = (missionId: number) => {
    return useQuery({
      queryKey: ['mission-dashboard', missionId],
      queryFn: async (): Promise<MissionDashboardResponse> => {
        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 500));
          // Mock mission dashboard data
          return {
            mission_details: {
              id: missionId,
              title: 'Sample Mission',
              description: 'Sample mission description',
              date: new Date().toISOString(),
              city: 'Mumbai',
              area: 'Bandra West',
              center: { lat: 19.0596, lng: 72.8295 },
              polygon: {
                type: 'Polygon',
                coordinates: [[[72.8290, 19.0600], [72.8300, 19.0600], [72.8300, 19.0590], [72.8290, 19.0590], [72.8290, 19.0600]]]
              },
              created_at: new Date().toISOString(),
            },
            kpis: {
              animals_covered: 25,
              tagged_sterilized: 18,
              area_coverage_km2: 2.5,
            },
            geo_json: {
              type: 'FeatureCollection',
              features: [],
            },
            volunteers: [],
          };
        }
        const response = await api.get<MissionDashboardResponse>(`/api/missions/${missionId}/dashboard/`);
        return response.data;
      },
      refetchInterval: 10000,
      enabled: !!missionId,
    });
  };

  // Get mission statistics
  const useMissionStatistics = (missionId: number) => {
    return useQuery({
      queryKey: ['mission-statistics', missionId],
      queryFn: async (): Promise<MissionStatistics> => {
        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 300));
          return {
            total_sightings: 25,
            sterilized_count: 18,
            completion_percentage: 72,
            area_covered_km2: 2.5,
          };
        }
        const response = await api.get<MissionStatistics>(`/api/missions/${missionId}/statistics/`);
        return response.data;
      },
      enabled: !!missionId,
    });
  };

  // Create sighting within mission
  const createSightingMutation = useMutation({
    mutationFn: async (payload: Omit<Sighting, 'id' | 'created_at' | 'updated_at'>): Promise<Sighting> => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          ...payload,
          id: Math.floor(Math.random() * 1000) + 1,
          created_at: new Date().toISOString(),
        };
      }
      const response = await api.post<Sighting>('/api/sightings/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['mission-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['sightings'] });
    },
  });

  // Get sightings for mission
  const useMissionSightings = (missionId: number) => {
    return useQuery({
      queryKey: ['mission-sightings', missionId],
      queryFn: async (): Promise<Sighting[]> => {
        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 300));
          return [
            {
              id: 1,
              mission_id: missionId,
              name: 'Street Dog Alpha',
              sterilized: true,
              location: { type: 'Point', coordinates: [72.8295, 19.0596] },
              created_at: new Date().toISOString(),
            },
            {
              id: 2,
              mission_id: missionId,
              name: 'Street Dog Beta',
              sterilized: false,
              location: { type: 'Point', coordinates: [72.8297, 19.0598] },
              created_at: new Date().toISOString(),
            },
          ];
        }
        const response = await api.get<Sighting[]>(`/api/missions/${missionId}/sightings/`);
        return response.data;
      },
      enabled: !!missionId,
    });
  };

  // Update sighting
  const updateSightingMutation = useMutation({
    mutationFn: async ({ sightingId, payload }: { sightingId: number; payload: Partial<Sighting> }) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { id: sightingId, ...payload };
      }
      const response = await api.patch(`/api/sightings/${sightingId}/`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['mission-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['sightings'] });
    },
  });

  // Get all missions
  const useMissions = () => {
    return useQuery({
      queryKey: ['missions'],
      queryFn: async (): Promise<Mission[]> => {
        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return [
            {
              id: 1,
              title: 'Bandra West Mission',
              description: 'Sterilization mission in Bandra West area',
              date: new Date().toISOString(),
              city: 'Mumbai',
              area: 'Bandra West',
              center: { lat: 19.0596, lng: 72.8295 },
              created_at: new Date().toISOString(),
            },
          ];
        }
        const response = await api.get<Mission[]>('/api/missions/');
        return response.data;
      },
    });
  };

  return {
    // Mission CRUD
    createMission: createMissionMutation.mutate,
    createMissionLoading: createMissionMutation.isPending,
    createMissionError: createMissionMutation.error,
    useMissions,
    useMissionDashboard,
    useMissionStatistics,

    // Sighting CRUD
    createSighting: createSightingMutation.mutate,
    createSightingLoading: createSightingMutation.isPending,
    useMissionSightings,
    updateSighting: updateSightingMutation.mutate,
    updateSightingLoading: updateSightingMutation.isPending,
  };
};
