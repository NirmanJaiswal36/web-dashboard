// src/components/auth/RegisterForm.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

interface RegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const ORG_TYPES = [
  'NGO',
  'Animal Shelter',
  'Municipal Corporation',
  'Veterinary Clinic',
  'Community Group',
  'Other'
];

export default function RegisterForm({ open, onClose, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const { registerOrg, registerLoading, registerError } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    registerOrg({
      name,
      type,
      password,
      verification_code: verificationCode || undefined,
    }, {
      onSuccess: () => {
        alert('Registration successful! Please log in with your credentials.');
        onSwitchToLogin();
        // Reset form
        setName('');
        setType('');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Register Organization</DialogTitle>
        
        <DialogContent>
          {registerError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Registration failed. Please try again.
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
            
            <FormControl fullWidth required>
              <InputLabel>Organization Type</InputLabel>
              <Select
                value={type}
                label="Organization Type"
                onChange={(e) => setType(e.target.value)}
              >
                {ORG_TYPES.map((orgType) => (
                  <MenuItem key={orgType} value={orgType}>
                    {orgType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              error={password !== confirmPassword && confirmPassword !== ''}
              helperText={password !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : ''}
            />
            
            <TextField
              label="Verification Code (Optional)"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              fullWidth
              helperText="If you have a verification code from authorities"
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
                disabled={registerLoading || !name || !type || !password || password !== confirmPassword}
              >
                {registerLoading ? 'Registering...' : 'Register'}
              </Button>
            </Box>
            
            <Typography variant="body2" textAlign="center">
              Already have an account?{' '}
              <Button size="small" onClick={onSwitchToLogin}>
                Login
              </Button>
            </Typography>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}
