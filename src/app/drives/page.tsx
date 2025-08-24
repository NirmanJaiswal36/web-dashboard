'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import { Add as AddIcon, LocationOn } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Drive } from '@/types/drives';

// Extended Drive type for UI
interface DriveWithStatus extends Drive {
  status: 'active' | 'upcoming' | 'completed';
}

// Mock data for development
const mockDrives: DriveWithStatus[] = [
  {
    id: 1,
    title: 'South Delhi Drive',
    description: 'Community sterilization drive in Saket area',
    date: '2025-08-25',
    city: 'New Delhi',
    area: 'Saket',
    center: { lat: 28.5245, lng: 77.2066 },
    polygon: {
      type: 'Polygon',
      coordinates: [[[77.2066, 28.5245], [77.2076, 28.5245], [77.2076, 28.5255], [77.2066, 28.5255], [77.2066, 28.5245]]]
    },
    status: 'active',
    community_forming: false
  },
  {
    id: 2,
    title: 'Gurgaon Sector 47 Drive',
    description: 'Weekly community drive for street animals',
    date: '2025-08-28',
    city: 'Gurgaon',
    area: 'Sector 47',
    center: { lat: 28.4595, lng: 77.0266 },
    polygon: {
      type: 'Polygon',
      coordinates: [[[77.0266, 28.4595], [77.0276, 28.4595], [77.0276, 28.4605], [77.0266, 28.4605], [77.0266, 28.4595]]]
    },
    status: 'upcoming',
    community_forming: true
  },
  {
    id: 3,
    title: 'Mumbai Bandra Drive',
    description: 'Monthly sterilization campaign',
    date: '2025-08-20',
    city: 'Mumbai',
    area: 'Bandra West',
    center: { lat: 19.0596, lng: 72.8295 },
    polygon: {
      type: 'Polygon',
      coordinates: [[[72.8295, 19.0596], [72.8305, 19.0596], [72.8305, 19.0606], [72.8295, 19.0606], [72.8295, 19.0596]]]
    },
    status: 'completed',
    community_forming: false
  }
];

export default function DrivesPage() {
  const router = useRouter();
  const [drives, setDrives] = useState<DriveWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadDrives = async () => {
      try {
        // In real app, this would be: const drives = await getDrives();
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        
        // Load existing mock drives
        let allDrives = [...mockDrives];
        
        // Add any newly created drives from localStorage
        if (typeof window !== 'undefined') {
          const keys = Object.keys(localStorage);
          const newDrives = keys
            .filter(key => key.startsWith('drive_'))
            .map(key => {
              try {
                const driveData = JSON.parse(localStorage.getItem(key) || '');
                return {
                  ...driveData,
                  id: parseInt(key.replace('drive_', '')),
                  status: driveData.status || 'upcoming'
                } as DriveWithStatus;
              } catch (e) {
                return null;
              }
            })
            .filter(Boolean) as DriveWithStatus[];
          
          // Add new drives to the beginning of the list
          allDrives = [...newDrives, ...allDrives];
        }
        
        setDrives(allDrives);
      } catch (error) {
        console.error('Failed to load drives:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDrives();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'warning';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const handleCreateDrive = () => {
    router.push('/drives/create');
  };

  const handleViewDrive = (driveId: number | undefined) => {
    if (driveId) {
      router.push(`/drives/${driveId}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        height: '50vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h1">
          Sterilization Drives
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateDrive}
          size="large"
        >
          Create New Drive
        </Button>
      </Box>

      {/* Drives Grid */}
      {drives.length === 0 ? (
        <Alert severity="info">
          No drives found. Create your first drive to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {drives.map((drive) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={drive.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {drive.title}
                    </Typography>
                    <Chip 
                      label={drive.status} 
                      color={getStatusColor(drive.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {drive.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {drive.area}, {drive.city}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Date:</strong> {drive.date ? new Date(drive.date).toLocaleDateString() : 'Not set'}
                  </Typography>
                  
                  {drive.community_forming && (
                    <Chip 
                      label="Community Forming" 
                      color="info" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleViewDrive(drive.id)}
                    variant="outlined"
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for mobile */}
      <Fab 
        color="primary" 
        aria-label="add drive"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleCreateDrive}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
