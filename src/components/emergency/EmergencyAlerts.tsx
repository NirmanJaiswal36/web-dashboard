'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  keyframes
} from '@mui/material';
import {
  Error,
  Warning,
  Info,
  Emergency as EmergencyIcon,
  ExpandMore,
  ExpandLess,
  LocationOn,
  AccessTime,
  Notifications,
  Close
} from '@mui/icons-material';
import { Emergency } from '@/types/emergency';
import EmergencyModal from '@/components/emergency/EmergencyModal';

interface EmergencyAlertsProps {
  emergencies: Emergency[];
  onEmergencyClick?: (emergency: Emergency) => void;
  onDismiss?: () => void;
}

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const getSeverityIcon = (severity: Emergency['severity']) => {
  switch (severity) {
    case 'critical':
      return <Error sx={{ color: '#d32f2f' }} />;
    case 'high':
      return <Warning sx={{ color: '#f57c00' }} />;
    case 'medium':
      return <Warning sx={{ color: '#fbc02d' }} />;
    case 'low':
      return <Info sx={{ color: '#1976d2' }} />;
    default:
      return <EmergencyIcon sx={{ color: '#666' }} />;
  }
};

const getSeverityColor = (severity: Emergency['severity']) => {
  switch (severity) {
    case 'critical':
      return '#d32f2f';
    case 'high':
      return '#f57c00';
    case 'medium':
      return '#fbc02d';
    case 'low':
      return '#1976d2';
    default:
      return '#666';
  }
};

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const emergency = new Date(dateString);
  const diffMs = now.getTime() - emergency.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return emergency.toLocaleDateString();
};

export default function EmergencyAlerts({ emergencies, onEmergencyClick, onDismiss }: EmergencyAlertsProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sort emergencies by severity and time
  const sortedEmergencies = [...emergencies].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const criticalCount = emergencies.filter(e => e.severity === 'critical').length;
  const highCount = emergencies.filter(e => e.severity === 'high').length;

  const handleEmergencyClick = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setModalOpen(true);
    onEmergencyClick?.(emergency);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmergency(null);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.();
  };

  if (emergencies.length === 0) {
    return null;
  }

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          border: `2px solid ${getSeverityColor(sortedEmergencies[0]?.severity)}`,
          background: `linear-gradient(135deg, 
            ${alpha(getSeverityColor(sortedEmergencies[0]?.severity), 0.1)} 0%, 
            ${alpha(getSeverityColor(sortedEmergencies[0]?.severity), 0.05)} 100%)`,
          animation: criticalCount > 0 ? `${pulse} 2s ease-in-out infinite` : 'none',
        }}
      >
        {/* Emergency Header */}
        <Box
          sx={{
            p: 2,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(getSeverityColor(sortedEmergencies[0]?.severity), 0.1)
            }
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Badge
            badgeContent={emergencies.length}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                animation: criticalCount > 0 ? `${pulse} 1.5s ease-in-out infinite` : 'none',
              }
            }}
          >
            <Notifications sx={{ color: getSeverityColor(sortedEmergencies[0]?.severity), mr: 1 }} />
          </Badge>
          
          <Box sx={{ flex: 1, ml: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              🚨 Emergency Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {criticalCount > 0 && `${criticalCount} Critical`}
              {criticalCount > 0 && highCount > 0 && ' • '}
              {highCount > 0 && `${highCount} High Priority`}
              {criticalCount === 0 && highCount === 0 && `${emergencies.length} Active`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Dismiss alerts">
              <IconButton 
                size="small" 
                onClick={handleDismiss}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    color: 'text.primary'
                  }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <IconButton size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Emergency List */}
        <Collapse in={expanded}>
          <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
            {sortedEmergencies.map((emergency, index) => (
              <Box
                key={emergency.id}
                sx={{
                  p: 2,
                  pt: index === 0 ? 1 : 2,
                  borderTop: index > 0 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(getSeverityColor(emergency.severity), 0.1),
                    transform: 'translateX(4px)'
                  }
                }}
                onClick={() => handleEmergencyClick(emergency)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  {/* Red Flag Icon */}
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: getSeverityColor(emergency.severity),
                      borderRadius: '2px 8px 2px 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '100%',
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid',
                        borderLeftColor: alpha(getSeverityColor(emergency.severity), 0.7),
                        borderTop: '4px solid transparent',
                      }
                    }}
                  >
                    🚩
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="600" noWrap>
                        {emergency.title}
                      </Typography>
                      <Chip
                        label={emergency.severity.toUpperCase()}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          backgroundColor: getSeverityColor(emergency.severity),
                          color: 'white',
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    </Box>

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {emergency.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {emergency.lat.toFixed(3)}, {emergency.lng.toFixed(3)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {getTimeAgo(emergency.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Collapse>

        {/* Pulsing indicator for critical emergencies */}
        {criticalCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#d32f2f',
              animation: `${pulse} 1s ease-in-out infinite`
            }}
          />
        )}
      </Paper>

      {/* Emergency Modal */}
      <EmergencyModal
        emergency={selectedEmergency}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
