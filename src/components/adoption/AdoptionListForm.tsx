// src/components/adoption/AdoptionListForm.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CreateAdoptionPayload } from '@/types/adoption';
import { useAuth } from '@/hooks/useAuth';

interface AdoptionListFormProps {
  open: boolean;
  onClose: () => void;
}

export default function AdoptionListForm({ open, onClose }: AdoptionListFormProps) {
  const [animalId, setAnimalId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'available' | 'adopted'>('available');
  
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createAdoptionMutation = useMutation({
    mutationFn: async (payload: CreateAdoptionPayload) => {
      const response = await api.post('/api/adoptions/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptions'] });
      handleClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.org_id || !animalId) {
      return;
    }

    createAdoptionMutation.mutate({
      animal_id: Number(animalId),
      organisation_id: user.org_id,
      desc: description,
      status,
    });
  };

  const handleClose = () => {
    setAnimalId('');
    setDescription('');
    setStatus('available');
    onClose();
  };

  if (!user?.org_id) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Alert severity="warning">
            You must be logged in as an organization to create adoption posts.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create Adoption Post</DialogTitle>
        
        <DialogContent>
          {createAdoptionMutation.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to create adoption post. Please try again.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Animal ID"
              type="number"
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value ? Number(e.target.value) : '')}
              required
              fullWidth
              helperText="Unique identifier for the animal"
            />
            
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Describe the animal, its characteristics, medical condition, etc."
            />
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as 'available' | 'adopted')}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="adopted">Adopted</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createAdoptionMutation.isPending || !animalId}
          >
            {createAdoptionMutation.isPending ? 'Creating...' : 'Create Post'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
