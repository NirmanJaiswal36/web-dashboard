// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { setToken, removeToken, getToken } from '@/lib/api';
import { AuthResponse, LoginPayload, OrgRegisterPayload, OrgRegisterResponse, User } from '@/types/auth';

const USE_MOCK_AUTH = true; // Set to false when backend is ready

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      // Mock user data for demonstration
      if (USE_MOCK_AUTH) {
        setUser({
          id: 1,
          name: 'Demo Organization',
          org_id: 1,
        });
      }
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload): Promise<AuthResponse> => {
      if (USE_MOCK_AUTH) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful login
        return {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            name: payload.name,
            org_id: 1,
          },
        };
      }
      
      const response = await api.post<AuthResponse>('/api/auth/login/', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: OrgRegisterPayload): Promise<OrgRegisterResponse> => {
      if (USE_MOCK_AUTH) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock successful registration
        return {
          org_id: Math.floor(Math.random() * 1000) + 1,
          name: payload.name,
          type: payload.type,
          created_at: new Date().toISOString(),
        };
      }
      
      const response = await api.post<OrgRegisterResponse>('/api/auth/register_org/', payload);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      // After successful registration, you might want to auto-login
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    registerOrg: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
};
