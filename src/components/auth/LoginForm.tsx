// src/components/auth/LoginForm.tsx
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
  Typography,
  Alert,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ open, onClose, onSwitchToRegister }: LoginFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginLoading, loginError } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ name, password }, {
      onSuccess: () => {
        onClose();
        setName('');
        setPassword('');
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Login to PawHub</DialogTitle>
        
        <DialogContent>
          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Login failed. Please check your credentials.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Organization Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1, p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loginLoading || !name || !password}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
            
            <Typography variant="body2" textAlign="center">
              Don't have an account?{' '}
              <Button size="small" onClick={onSwitchToRegister}>
                Register Organization
              </Button>
            </Typography>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}
