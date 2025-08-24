'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Button,
  Skeleton,
  Alert,
  Stack
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ZoomIn as ZoomIcon,
  Pets as PetsIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Sighting } from '@/hooks/useMapData';

interface ActivityFeedProps {
  sightings: Sighting[];
  onSightingClick: (lat: number, lng: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

interface SightingItemProps {
  sighting: Sighting;
  onSightingClick: (lat: number, lng: number) => void;
}

function SightingItem({ sighting, onSightingClick }: SightingItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'warning';
      case 'sterilized': return 'success';
      case 'resolved': return 'default';
      default: return 'default';
    }
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSightingClick(sighting.location.lat, sighting.location.lng);
  };

  return (
    <ListItem
      sx={{ 
        px: 0, 
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: 'action.hover',
          borderRadius: 1,
          cursor: 'pointer'
        }
      }}
      onClick={handleZoomClick}
    >
      <ListItemAvatar>
        <Avatar 
          src={sighting.photo_url} 
          sx={{ 
            bgcolor: 'primary.light',
            width: 40,
            height: 40
          }}
        >
          <PetsIcon />
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Typography variant="body2" component="span">
              {sighting.species ? sighting.species.charAt(0).toUpperCase() + sighting.species.slice(1) : 'Animal'} sighting
            </Typography>
            <Chip 
              label={sighting.status} 
              size="small"
              color={getStatusColor(sighting.status) as any}
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {sighting.notes || 'No description available'}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <TimeIcon fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(sighting.timestamp), { addSuffix: true })}
              </Typography>
              {sighting.reporter && (
                <Typography variant="caption" color="text.secondary">
                  • by {sighting.reporter}
                </Typography>
              )}
            </Box>
          </Box>
        }
      />
      
      <IconButton 
        size="small" 
        onClick={handleZoomClick}
        sx={{ ml: 1 }}
        title="Zoom to location"
      >
        <ZoomIcon />
      </IconButton>
    </ListItem>
  );
}

function LoadingSkeleton() {
  return (
    <List sx={{ py: 0 }}>
      {[...Array(5)].map((_, index) => (
        <ListItem key={index} sx={{ px: 0, py: 1 }}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={40} height={40} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton width="60%" />}
            secondary={
              <Box>
                <Skeleton width="90%" />
                <Skeleton width="50%" />
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

export default function ActivityFeed({ 
  sightings, 
  onSightingClick, 
  isLoading, 
  onRefresh 
}: ActivityFeedProps) {
  
  if (isLoading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Recent Activity</Typography>
          <IconButton size="small" disabled>
            <RefreshIcon />
          </IconButton>
        </Box>
        <LoadingSkeleton />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          Recent Activity
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({sightings.length})
          </Typography>
        </Typography>
        <IconButton 
          size="small" 
          onClick={onRefresh}
          title="Refresh feed"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {sightings.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No sightings found for the current filters. Try adjusting your search criteria.
        </Alert>
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List sx={{ py: 0 }}>
            {sightings.map((sighting) => (
              <SightingItem
                key={sighting.id}
                sighting={sighting}
                onSightingClick={onSightingClick}
              />
            ))}
          </List>
          
          {sightings.length === 25 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing first 25 results. Use filters to narrow down.
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Quick Actions */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1}>
          <Button 
            size="small" 
            variant="outlined" 
            fullWidth
            onClick={() => {/* TODO: Implement create sighting */}}
          >
            Add Sighting
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            fullWidth
            href="/drives/create"
          >
            Create Drive
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
