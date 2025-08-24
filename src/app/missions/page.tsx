'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Fab,
} from '@mui/material';
import { Add as AddIcon, LocationOn, CalendarToday, Group } from '@mui/icons-material';
import { useMissionAPI } from '@/hooks/useMissionAPI';
import MissionForm from '@/components/missions/MissionForm';

const MissionsPage: React.FC = () => {
  const { useMissions } = useMissionAPI();
  const { data: missions = [], isLoading } = useMissions();
  const [createFormOpen, setCreateFormOpen] = useState(false);

  const handleMissionSuccess = (missionId: number) => {
    console.log('Mission created with ID:', missionId);
    // Navigate to mission detail page if needed
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading missions...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Missions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateFormOpen(true)}
        >
          Create Mission
        </Button>
      </Box>

      {missions.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No missions found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first mission to start managing animal welfare operations.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateFormOpen(true)}
            >
              Create First Mission
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
          {missions.map((mission) => (
            <Card key={mission.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {mission.title}
                </Typography>
                
                {mission.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {mission.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {mission.area}, {mission.city}
                  </Typography>
                </Box>

                {mission.date && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(mission.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label="Active" 
                    color="primary" 
                    size="small" 
                  />
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => console.log('View mission:', mission.id)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <MissionForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSuccess={handleMissionSuccess}
      />
    </Box>
  );
};

export default MissionsPage;
