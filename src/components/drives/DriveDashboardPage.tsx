// src/components/drives/DriveDashboardPage.tsx
'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Fab,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  GroupAdd as GroupAddIcon,
  GetApp as ExportIcon,
  Pets as PetsIcon,
  LocalHospital as LocalHospitalIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import MapShell from '@/components/map/MapShell';
// import SightingMarker from './SightingMarker';
// import AddSightingModal from './AddSightingModal';
// import MarkSterilizedModal from './MarkSterilizedModal';
import { DriveDashboardResponse } from '@/types/drives';
import { Sighting } from '@/types/sightings';

interface DriveDashboardPageProps {
  dashboardData: DriveDashboardResponse;
  driveId: number;
}

function DrivePolygon({ polygon, map }: { polygon: any; map: L.Map | null }) {
  // Render polygon on map
  return null; // Implementation would use useMap hook
}

export default function DriveDashboardPage({ dashboardData, driveId }: DriveDashboardPageProps) {
  const [selectedSighting, setSelectedSighting] = useState<any>(null);
  const [showAddSighting, setShowAddSighting] = useState(false);
  const [showMarkSterilized, setShowMarkSterilized] = useState(false);
  const mapRef = useRef<any>(null);

  const { mission_details, kpis, geo_json, volunteers } = dashboardData;

  const handleSightingClick = (sighting: any) => {
    setSelectedSighting(sighting);
    // Map centering will be handled by the map component
  };

  const handleMarkSterilized = () => {
    if (selectedSighting) {
      setShowMarkSterilized(true);
    }
  };

  const handleExportReport = () => {
    // Generate CSV export
    const csvContent = [
      ['ID', 'Type', 'Status', 'Location', 'Timestamp', 'Reporter'],
      ...geo_json.features.map((feature: any) => [
        feature.properties.id,
        feature.properties.type || 'sighting',
        feature.properties.status,
        `${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}`,
        feature.properties.timestamp,
        feature.properties.reporter?.name || 'Unknown',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drive-${driveId}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <PetsIcon color="primary" />
            <Typography variant="h6" component="div">
              {mission_details.title}
            </Typography>
            <Chip 
              label={mission_details.date} 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={`${mission_details.city} - ${mission_details.area}`} 
              size="small" 
              color="primary"
            />
          </Box>
          <IconButton color="inherit">
            <EditIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Map */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapShell
            center={[mission_details.center.lat, mission_details.center.lng]}
            zoom={16}
            mapRef={mapRef}
          >
            {/* Render sighting markers */}
            {geo_json.features.map((feature: any) => (
              <div key={feature.properties.id}>
                {/* SightingMarker component will go here */}
              </div>
            ))}
          </MapShell>

          {/* Floating Action Buttons */}
          <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Fab 
              color="primary" 
              size="small"
              onClick={() => setShowAddSighting(true)}
            >
              <AddIcon />
            </Fab>
            <Fab 
              color="secondary" 
              size="small"
              onClick={handleMarkSterilized}
              disabled={!selectedSighting}
            >
              <CheckCircleIcon />
            </Fab>
            <Fab 
              size="small"
              onClick={() => console.log('Invite volunteers')}
            >
              <GroupAddIcon />
            </Fab>
            <Fab 
              size="small"
              onClick={handleExportReport}
            >
              <ExportIcon />
            </Fab>
          </Box>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: 350, bgcolor: 'background.paper', borderLeft: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {/* KPIs */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Drive Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid size={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="h4" color="primary">
                      {kpis.animals_covered}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Animals Covered
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="h4" color="success.main">
                      {kpis.tagged_sterilized}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Sterilized
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="h4" color="info.main">
                      {kpis.area_coverage_km2.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Area (km²)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Activity Feed */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
            </Box>
            <List dense>
              {geo_json.features
                .sort((a: any, b: any) => new Date(b.properties.timestamp).getTime() - new Date(a.properties.timestamp).getTime())
                .slice(0, 10)
                .map((feature: any) => (
                  <ListItem 
                    key={feature.properties.id}
                    onClick={() => handleSightingClick(feature)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: selectedSighting?.properties.id === feature.properties.id ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={feature.properties.photo_url}
                        sx={{ width: 32, height: 32 }}
                      >
                        {feature.properties.status === 'sterilized' ? <LocalHospitalIcon /> : <PetsIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {feature.properties.type || 'Sighting'}
                          </Typography>
                          <Chip
                            label={feature.properties.status}
                            size="small"
                            color={feature.properties.status === 'sterilized' ? 'success' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {feature.properties.reporter?.name || 'Unknown reporter'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(feature.properties.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Box>

          {/* Volunteers */}
          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Volunteers ({volunteers.length})
              </Typography>
            </Box>
            <List dense>
              {volunteers.slice(0, 5).map((volunteer) => (
                <ListItem key={volunteer.id}>
                  <ListItemAvatar>
                    <Avatar src={volunteer.avatar_url} sx={{ width: 32, height: 32 }}>
                      {volunteer.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={volunteer.name}
                    secondary={`${volunteer.points} points`}
                  />
                  <Button size="small" variant="outlined">
                    Invite
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Box>

      {/* Modals */}
      {/* TODO: Add modals */}
      {showAddSighting && (
        <div>Add Sighting Modal placeholder</div>
      )}
      {showMarkSterilized && (
        <div>Mark Sterilized Modal placeholder</div>
      )}
    </Box>
  );
}
