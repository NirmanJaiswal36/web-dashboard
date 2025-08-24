import { useState, useEffect } from 'react';
import { Emergency } from '@/types/emergency';
import { api } from '@/lib/api';

export interface UseEmergencyAPIReturn {
  emergencies: Emergency[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEmergencyAPI = (): UseEmergencyAPIReturn => {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmergencies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/emergencies/');
      setEmergencies(response.data);
    } catch (err: any) {
      console.error('Error fetching emergencies:', err);
      setError(err.message || 'Failed to fetch emergencies');
      // Fallback to mock data for development
      setEmergencies([
        {
          id: 1,
          title: "Injured Dog Near Highway",
          lat: 20.5937,
          lng: 78.9629,
          severity: "critical",
          description: "A dog has been hit by a vehicle and needs immediate medical attention. Located near the highway overpass.",
          created_at: new Date().toISOString(),
          photo_url: undefined
        },
        {
          id: 2,
          title: "Stray Pack Aggressive Behavior",
          lat: 20.6200,
          lng: 78.9800,
          severity: "high",
          description: "A pack of stray dogs showing aggressive behavior towards pedestrians. Multiple complaints received.",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
          photo_url: undefined
        },
        {
          id: 3,
          title: "Cat Stuck in Tree",
          lat: 20.5500,
          lng: 78.9200,
          severity: "medium",
          description: "A cat has been stuck in a tall tree for over 6 hours. Owner is distressed.",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          photo_url: undefined
        },
        {
          id: 4,
          title: "Suspected Rabies Case",
          lat: 20.6500,
          lng: 79.0100,
          severity: "critical",
          description: "A dog showing signs of rabies reported in residential area. Immediate quarantine needed.",
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
          photo_url: undefined
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchEmergencies, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    emergencies,
    isLoading,
    error,
    refetch: fetchEmergencies
  };
};
