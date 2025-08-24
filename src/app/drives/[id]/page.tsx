// src/app/drives/[id]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent,
  Grid,
  Chip,
  IconButton,
  LinearProgress
} from '@mui/material';
import { ArrowBack, LocationOn, CalendarToday, People, Pets, LocalHospital, Map } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getDriveDashboard, DriveDashboardResponse } from '@/lib/api';

// Dynamic imports for map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface DrivePageProps {
  params: Promise<{ id: string }>;
}

export default function DrivePage({ params }: DrivePageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DriveDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const dashboardResponse = await getDriveDashboard(id);
        setDashboardData(dashboardResponse);
      } catch (err: any) {
        console.error('Failed to fetch drive dashboard:', err);
        
        // Mock data for development if backend is not available
        if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
          console.log('DEV MODE: Using mock dashboard data');
          
          // First, check if this is a newly created drive in localStorage
          let storedDrive = null;
          if (typeof window !== 'undefined') {
            const storedDriveData = localStorage.getItem(`drive_${id}`);
            if (storedDriveData) {
              storedDrive = JSON.parse(storedDriveData);
            }
          }
          
          if (storedDrive) {
            const mockData: DriveDashboardResponse = {
              mission_details: {
                id: id,
                title: storedDrive.title,
                description: storedDrive.description,
                date: storedDrive.date,
                center: storedDrive.center,
                polygon: storedDrive.polygon,
                status: storedDrive.status || 'upcoming',
                community_forming: storedDrive.community_forming || true
              },
              geo_json: { 
                type: 'FeatureCollection',
                features: [] 
              },
              kpis: {
                animals_covered: 0, // New drive starts with 0
                tagged_sterilized: 0,
                area_coverage_km2: 0,
                volunteers_active: 1 // Creator counts as first volunteer
              },
              activity_feed: [],
              volunteers: []
            };
            setDashboardData(mockData);
            return;
          }
          
          // Use predefined mock data for existing drives
          const driveNames: Record<string, any> = {
            '1': {
              title: 'South Delhi Drive',
              description: 'Community sterilization drive in Saket area covering residential blocks and market areas. Focus on TNR (Trap-Neuter-Return) program.',
              date: '2025-08-25',
              center: { lat: 28.5245, lng: 77.2066 },
              city: 'New Delhi',
              area: 'Saket',
              kpis: {
                animals_covered: 47,
                tagged_sterilized: 23,
                area_coverage_km2: 2.8,
                volunteers_active: 12
              }
            },
            '2': {
              title: 'Gurgaon Sector 47 Drive',
              description: 'Weekly community drive for street animals in residential and commercial areas. Collaboration with local RWA.',
              date: '2025-08-28',
              center: { lat: 28.4595, lng: 77.0266 },
              city: 'Gurgaon',
              area: 'Sector 47',
              kpis: {
                animals_covered: 32,
                tagged_sterilized: 18,
                area_coverage_km2: 1.5,
                volunteers_active: 8
              }
            },
            '3': {
              title: 'Mumbai Bandra Drive',
              description: 'Monthly sterilization campaign covering Bandra West market area and surrounding residential blocks.',
              date: '2025-08-20',
              center: { lat: 19.0596, lng: 72.8295 },
              city: 'Mumbai',
              area: 'Bandra West',
              kpis: {
                animals_covered: 65,
                tagged_sterilized: 41,
                area_coverage_km2: 3.2,
                volunteers_active: 15
              }
            }
          };

          const driveInfo = driveNames[id] || driveNames['1'];
          
          const mockData: DriveDashboardResponse = {
            mission_details: {
              id: id,
              title: driveInfo.title,
              description: driveInfo.description,
              date: driveInfo.date,
              center: driveInfo.center,
              polygon: {
                type: 'Polygon',
                coordinates: [[
                  [driveInfo.center.lng - 0.01, driveInfo.center.lat - 0.01],
                  [driveInfo.center.lng + 0.01, driveInfo.center.lat - 0.01],
                  [driveInfo.center.lng + 0.01, driveInfo.center.lat + 0.01],
                  [driveInfo.center.lng - 0.01, driveInfo.center.lat + 0.01],
                  [driveInfo.center.lng - 0.01, driveInfo.center.lat - 0.01]
                ]]
              },
              status: id === '3' ? 'completed' : id === '2' ? 'upcoming' : 'active',
              community_forming: id === '2'
            },
            geo_json: { 
              type: 'FeatureCollection',
              features: [] 
            },
            kpis: driveInfo.kpis,
            activity_feed: [],
            volunteers: []
          };
          setDashboardData(mockData);
        } else {
          setError('Failed to load drive dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Drive not found.
        </Alert>
      </Box>
    );
  }

  const { mission_details, kpis } = dashboardData;

  // Convert polygon coordinates for Leaflet (swap lat/lng and ensure proper typing)
  const polygonCoords: [number, number][] = mission_details.polygon.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number]);

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'warning';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: 1, 
        borderColor: 'divider',
        p: 2
      }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.back()} edge="start">
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" component="h1">
                {mission_details.title}
              </Typography>
              <Chip 
                label={mission_details.status} 
                color={getStatusColor(mission_details.status) as any}
                size="medium"
              />
              {mission_details.community_forming && (
                <Chip 
                  label="Community Forming" 
                  color="info" 
                  size="medium"
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday fontSize="small" />
                <Typography variant="body2">
                  {new Date(mission_details.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  Center: {mission_details.center.lat.toFixed(4)}, {mission_details.center.lng.toFixed(4)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column - Map and Details */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* KPI Cards Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Card sx={{ height: '100%', bgcolor: 'primary.50' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Pets sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h3" color="primary.main" fontWeight="bold">
                      {formatNumber(kpis.animals_covered)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Animals Covered
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Card sx={{ height: '100%', bgcolor: 'success.50' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <LocalHospital sx={{ fontSize: 32, color: 'success.main' }} />
                    </Box>
                    <Typography variant="h3" color="success.main" fontWeight="bold">
                      {formatNumber(kpis.tagged_sterilized)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sterilized
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Card sx={{ height: '100%', bgcolor: 'info.50' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Map sx={{ fontSize: 32, color: 'info.main' }} />
                    </Box>
                    <Typography variant="h3" color="info.main" fontWeight="bold">
                      {kpis.area_coverage_km2.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      km² Coverage
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Card sx={{ height: '100%', bgcolor: 'warning.50' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <People sx={{ fontSize: 32, color: 'warning.main' }} />
                    </Box>
                    <Typography variant="h3" color="warning.main" fontWeight="bold">
                      {formatNumber(kpis.volunteers_active)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Volunteers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Map */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Drive Area Map
                </Typography>
                <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden' }}>
                  <MapContainer
                    center={[mission_details.center.lat, mission_details.center.lng]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Drive area polygon */}
                    <Polygon
                      positions={polygonCoords}
                      pathOptions={{
                        color: '#2e7d32',
                        fillColor: '#4caf50',
                        fillOpacity: 0.2,
                        weight: 3
                      }}
                    />
                    
                    {/* Center marker */}
                    <Marker position={[mission_details.center.lat, mission_details.center.lng]}>
                      <Popup>
                        <div>
                          <strong>{mission_details.title}</strong><br />
                          Drive Center<br />
                          Status: {mission_details.status}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Drive Info */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Drive Information
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {mission_details.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" color="success.main">
                      {kpis.animals_covered > 0 
                        ? Math.round((kpis.tagged_sterilized / kpis.animals_covered) * 100)
                        : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      sterilization rate
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={kpis.animals_covered > 0 
                      ? (kpis.tagged_sterilized / kpis.animals_covered) * 100
                      : 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'success.main'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Team Efficiency
                  </Typography>
                  <Typography variant="body2">
                    {kpis.volunteers_active > 0 
                      ? Math.round(kpis.animals_covered / kpis.volunteers_active * 10) / 10
                      : 0} animals per volunteer
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Area Density
                  </Typography>
                  <Typography variant="body2">
                    {kpis.area_coverage_km2 > 0 
                      ? Math.round(kpis.animals_covered / kpis.area_coverage_km2 * 10) / 10
                      : 0} animals per km²
                  </Typography>
                </Box>

                {mission_details.status === 'active' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    This drive is currently active. Statistics update in real-time.
                  </Alert>
                )}
                
                {mission_details.status === 'upcoming' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    This drive is scheduled to begin soon. Join the volunteer team!
                  </Alert>
                )}

                {mission_details.status === 'completed' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Drive completed successfully! Thank you to all volunteers.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
