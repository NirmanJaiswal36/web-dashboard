// src/components/emergency/EmergencyModal.tsx
'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import { Emergency as EmergencyIcon, Warning, Report, Error } from '@mui/icons-material';
import { Emergency } from '@/types/emergency';

interface EmergencyModalProps {
  emergency: Emergency | null;
  open: boolean;
  onClose: () => void;
}

const getSeverityIcon = (severity: Emergency['severity']) => {
  switch (severity) {
    case 'critical':
      return <Error color="error" />;
    case 'high':
      return <Report color="error" />;
    case 'medium':
      return <Warning color="warning" />;
    case 'low':
      return <EmergencyIcon color="info" />;
    default:
      return <EmergencyIcon />;
  }
};

const getSeverityColor = (severity: Emergency['severity']) => {
  switch (severity) {
    case 'critical':
      return 'error' as const;
    case 'high':
      return 'error' as const;
    case 'medium':
      return 'warning' as const;
    case 'low':
      return 'info' as const;
    default:
      return 'default' as const;
  }
};

export default function EmergencyModal({ emergency, open, onClose }: EmergencyModalProps) {
  if (!emergency) return null;

  const handleCreateSighting = () => {
    // TODO: Implement create sighting for this emergency
    console.log('Create sighting for emergency:', emergency.id);
    onClose();
  };

  const handleAssignResponse = () => {
    // TODO: Implement assign response for this emergency
    console.log('Assign response for emergency:', emergency.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSeverityIcon(emergency.severity)}
          <Typography variant="h6" component="span">
            Emergency Alert
          </Typography>
          <Chip
            label={emergency.severity.toUpperCase()}
            color={getSeverityColor(emergency.severity)}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" gutterBottom>
            {emergency.title}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {emergency.description}
          </Typography>

          {emergency.photo_url && (
            <Box sx={{ mt: 2 }}>
              <img
                src={emergency.photo_url}
                alt="Emergency"
                style={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Location:</strong> {emergency.lat.toFixed(4)}, {emergency.lng.toFixed(4)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Reported:</strong> {new Date(emergency.created_at).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          onClick={handleCreateSighting}
          variant="outlined"
          color="primary"
        >
          Create Sighting
        </Button>
        <Button
          onClick={handleAssignResponse}
          variant="contained"
          color="primary"
        >
          Assign Response
        </Button>
      </DialogActions>
    </Dialog>
  );
}
