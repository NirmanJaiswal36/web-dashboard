'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Typography
} from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamic imports for Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
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

// Import useMap hook differently
let useMapHook: any = null;
if (typeof window !== 'undefined') {
  import('react-leaflet').then((mod) => {
    useMapHook = mod.useMap;
  });
}

export interface MapFilters {
  timeRange: {
    from: string;
    to: string;
  };
  status: string[];
  species?: string;
  driveId?: string;
  severityFilter: string[];
  searchQuery: string;
  showHeatmap: boolean;
  showClusters: boolean;
  radiusKm?: number;
  centerPoint?: { lat: number; lng: number };
}

const defaultFilters: MapFilters = {
  timeRange: {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    to: new Date().toISOString()
  },
  status: ['active', 'sterilized'],
  severityFilter: ['low', 'medium', 'high', 'critical'],
  searchQuery: '',
  showHeatmap: false,
  showClusters: true
};

export default function HomeDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const mapRef = useRef<any>(null);
  const [filters, setFilters] = useState<MapFilters>(defaultFilters);
  const [mapBounds, setMapBounds] = useState<any>(null);
  
  // Mock data for now
  const data = {
    sightings: [
      { id: 1, location: 'Park Street', lat: 20.5937, lng: 78.9629, timestamp: new Date().toISOString(), status: 'active' },
      { id: 2, location: 'Market Area', lat: 20.6937, lng: 78.8629, timestamp: new Date().toISOString(), status: 'sterilized' },
      { id: 3, location: 'Hospital Zone', lat: 20.4937, lng: 79.0629, timestamp: new Date().toISOString(), status: 'emergency' }
    ],
    drives: [],
    emergencies: [],
    statistics: {
      total_sightings: 156,
      sterilized: 89,
      active: 67,
      hotspots: []
    }
  };
  const isLoading = false;
  const error = null;
  const refetch = () => {};

  // Handle filter changes with debouncing
  const handleFiltersChange = (newFilters: Partial<MapFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle map events
  const handleMapReady = () => {
    console.log('Map is ready');
  };

  // Center map to specific location
  const centerMapTo = (lat: number, lng: number, zoom = 15) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], zoom);
    }
  };

  return (
    <Grid container sx={{ height: '100%', overflow: 'hidden' }}>
      {/* Left Panel - Map */}
      <Grid 
        size={{ xs: 12, md: 8 }} 
        sx={{ 
          height: { xs: '50%', md: '100%' },
          position: 'relative'
        }}
      >
        <Card sx={{ 
          height: '100%', 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[4]
        }}>
          <MapContainer
            center={[20.5937, 78.9629]} // India center
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            whenReady={handleMapReady}
            zoomControl={!isMobile}
          >
            {/* Base tile layer */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Simple markers for sightings */}
            {data.sightings.map((sighting) => (
              <Marker key={sighting.id} position={[sighting.lat, sighting.lng]}>
                <Popup>
                  <div>
                    <strong>{sighting.location}</strong><br />
                    Status: {sighting.status}<br />
                    ID: #{sighting.id}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card>
      </Grid>

      {/* Right Panel - Controls & Info */}
      <Grid 
        size={{ xs: 12, md: 4 }} 
        sx={{ 
          height: { xs: '50%', md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 1
        }}
      >
        {/* Filters Panel */}
        <Card sx={{ mb: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Time Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['24h', '7d', '30d', 'All'].map((range) => (
                  <Box
                    key={range}
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: range === '7d' ? 'primary.main' : 'grey.100',
                      color: range === '7d' ? 'white' : 'text.primary',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {range}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['Active', 'Sterilized', 'Emergency'].map((status) => (
                  <Box
                    key={status}
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: status === 'Active' ? 'primary.main' : 'grey.100',
                      color: status === 'Active' ? 'white' : 'text.primary',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {status}
                  </Box>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <Card sx={{ mb: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {isLoading ? '...' : data?.statistics?.total_sightings || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sightings
                  </Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {isLoading ? '...' : data?.statistics?.sterilized || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sterilized
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card sx={{ flex: 1, borderRadius: 2, overflow: 'hidden' }}>
          <CardContent sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ 
              height: 'calc(100% - 40px)', 
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                borderRadius: 2 
              }
            }}>
              {/* Activity items from data */}
              {data.sightings.map((sighting, index) => (
                <Box
                  key={sighting.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: 'grey.50',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  onClick={() => centerMapTo(sighting.lat, sighting.lng)}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: sighting.status === 'emergency' ? 'error.main' : 
                               sighting.status === 'sterilized' ? 'success.main' : 'primary.main',
                      mr: 2,
                      flexShrink: 0
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {sighting.status === 'emergency' ? 'Emergency Report' : 'Sighting'} #{sighting.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {index + 1} min ago • {sighting.location}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {/* Show message when no data */}
              {data.sightings.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
