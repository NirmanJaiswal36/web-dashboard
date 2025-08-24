// src/components/adoption/AdoptionCards.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Adoption } from '@/types/adoption';
import { useAuth } from '@/hooks/useAuth';

interface AdoptionCardsProps {
  organizationId?: number;
}

export default function AdoptionCards({ organizationId }: AdoptionCardsProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: adoptions, isLoading, error } = useQuery({
    queryKey: ['adoptions', organizationId],
    queryFn: async (): Promise<Adoption[]> => {
      const url = organizationId 
        ? `/api/adoptions/?organisation_id=${organizationId}`
        : '/api/adoptions/';
      const response = await api.get<Adoption[]>(url);
      return response.data;
    },
    enabled: !!organizationId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'available' | 'adopted' }) => {
      // Using POST as mentioned in the requirements
      const response = await api.post(`/api/adoptions/${id}/update_status/`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptions'] });
    },
  });

  const handleAdopt = (adoption: Adoption) => {
    if (adoption.id) {
      updateStatusMutation.mutate({
        id: adoption.id,
        status: adoption.status === 'available' ? 'adopted' : 'available',
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load adoption posts. Please try again.
      </Alert>
    );
  }

  if (!adoptions || adoptions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <PetsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          No adoption posts yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first adoption post to help animals find homes.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {adoptions.map((adoption) => (
          <Grid key={adoption.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardMedia
                sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <PetsIcon sx={{ fontSize: 64, color: 'grey.400' }} />
              </CardMedia>
              
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    Animal #{adoption.animal_id}
                  </Typography>
                  <Chip
                    label={adoption.status}
                    color={adoption.status === 'available' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                {adoption.desc && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {adoption.desc}
                  </Typography>
                )}
                
                {adoption.created_at && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Posted: {new Date(adoption.created_at).toLocaleDateString()}
                  </Typography>
                )}

                <Button
                  variant={adoption.status === 'available' ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => handleAdopt(adoption)}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending 
                    ? 'Updating...' 
                    : adoption.status === 'available' 
                    ? 'Mark as Adopted' 
                    : 'Mark as Available'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
