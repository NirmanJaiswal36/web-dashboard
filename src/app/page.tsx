'use client';

import { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';
import HomeDashboard from '@/components/home/HomeDashboard';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuth();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setShowLogin(true);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🐾 PawHub Dashboard
          </Typography>
          <Button
            component={Link}
            href="/drives"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Drives
          </Button>
          <Button
            component={Link}
            href="/adoptions"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Adoptions
          </Button>
          {isAuthenticated && user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user.name}
            </Typography>
          )}
          <Button color="inherit" onClick={handleAuthClick}>
            {isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Dashboard */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <HomeDashboard />
      </Box>

      {/* Auth Modals */}
      <LoginForm
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      
      <RegisterForm
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </Box>
  );
}
