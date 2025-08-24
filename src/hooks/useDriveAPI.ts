// src/hooks/useDriveAPI.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Drive, DriveDashboardResponse } from '@/types/drives';
import { CreateSightingPayload, CreateEventPayload } from '@/types/sightings';
import { Emergency } from '@/types/emergency';
import { mockEmergencies, mockDriveDashboard } from '@/lib/mockData';

const USE_MOCK_DATA = true; // Set to false when backend is ready

export const useDriveAPI = () => {
  const queryClient = useQueryClient();

  const createDriveMutation = useMutation({
    mutationFn: async (payload: Drive): Promise<Drive> => {
      if (USE_MOCK_DATA) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { ...payload, id: Math.floor(Math.random() * 1000) + 1 };
      }
      const response = await api.post<Drive>('/api/drives/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] });
    },
  });

  const useDriveDashboard = (driveId: number) => {
    return useQuery({
      queryKey: ['drive-dashboard', driveId],
      queryFn: async (): Promise<DriveDashboardResponse> => {
        if (USE_MOCK_DATA) {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          return mockDriveDashboard;
        }
        const response = await api.get<DriveDashboardResponse>(`/api/drives/${driveId}/dashboard/`);
        return response.data;
      },
      refetchInterval: 10000, // Poll every 10 seconds
      enabled: !!driveId,
    });
  };

  const createSightingMutation = useMutation({
    mutationFn: async (payload: CreateSightingPayload) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { ...payload, id: Math.floor(Math.random() * 1000) + 1 };
      }
      const response = await api.post('/api/sightings/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sightings'] });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async ({ driveId, payload }: { driveId: number; payload: CreateEventPayload }) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { ...payload, id: Math.floor(Math.random() * 1000) + 1 };
      }
      const response = await api.post(`/api/drives/${driveId}/events/`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive-dashboard'] });
    },
  });

  const updateSightingMutation = useMutation({
    mutationFn: async ({ sightingId, payload }: { sightingId: number; payload: Partial<any> }) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { id: sightingId, ...payload };
      }
      const response = await api.patch(`/api/sightings/${sightingId}/`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sightings'] });
    },
  });

  const useEmergencies = () => {
    return useQuery({
      queryKey: ['emergencies'],
      queryFn: async (): Promise<Emergency[]> => {
        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 300));
          return mockEmergencies;
        }
        const response = await api.get<Emergency[]>('/api/emergencies/');
        return response.data;
      },
      refetchInterval: 10000, // Poll every 10 seconds
    });
  };

  return {
    createDrive: createDriveMutation.mutate,
    createDriveLoading: createDriveMutation.isPending,
    createDriveError: createDriveMutation.error,
    useDriveDashboard,
    createSighting: createSightingMutation.mutate,
    createSightingLoading: createSightingMutation.isPending,
    createEvent: createEventMutation.mutate,
    updateSighting: updateSightingMutation.mutate,
    useEmergencies,
  };
};
