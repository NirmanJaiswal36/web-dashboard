// src/app/adoptions/page.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Fab,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Link from 'next/link';
import AdoptionCards from '@/components/adoption/AdoptionCards';
import AdoptionListForm from '@/components/adoption/AdoptionListForm';
import { useAuth } from '@/hooks/useAuth';

export default function AdoptionsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user, isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Button
            component={Link}
            href="/"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Map
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏠 Adoption Center
          </Typography>
          {isAuthenticated && (
            <Button
              color="inherit"
              onClick={() => setShowCreateForm(true)}
              startIcon={<AddIcon />}
            >
              Create Post
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Animals Looking for Homes
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Help these wonderful animals find their forever homes. Each animal has been cared for by local organizations and is ready for adoption.
        </Typography>

        <AdoptionCards organizationId={user?.org_id} />
      </Container>

      {/* Floating Action Button */}
      {isAuthenticated && (
        <Fab
          color="primary"
          aria-label="add adoption post"
          onClick={() => setShowCreateForm(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Create Form Modal */}
      <AdoptionListForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />
    </Box>
  );
}
