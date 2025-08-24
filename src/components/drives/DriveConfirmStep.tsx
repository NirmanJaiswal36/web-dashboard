'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { DriveFormData } from '@/app/drives/create/page';

interface DriveConfirmStepProps {
  formData: DriveFormData;
  onBack: () => void;
}

export function DriveConfirmStep({ formData, onBack }: DriveConfirmStepProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreateDrive = async () => {
    setIsCreating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a new drive ID (in real app, this would come from the API)
      const newDriveId = Date.now(); // Use timestamp for unique ID
      
      // In real app, this would be:
      // const newDrive = await createDrive(formData);
      // const newDriveId = newDrive.id;
      
      // Mock successful creation
      console.log('Drive created with ID:', newDriveId, 'Data:', formData);
      
      // Store the new drive data in localStorage for mock purposes
      const newDrive = {
        id: newDriveId,
        title: formData.title,
        description: formData.description || `Community sterilization drive in ${formData.area}`,
        date: formData.date,
        city: formData.city,
        area: formData.area,
        center: formData.center,
        polygon: formData.polygon || {
          type: 'Polygon' as const,
          coordinates: [[
            [formData.center.lng - 0.01, formData.center.lat - 0.01],
            [formData.center.lng + 0.01, formData.center.lat - 0.01],
            [formData.center.lng + 0.01, formData.center.lat + 0.01],
            [formData.center.lng - 0.01, formData.center.lat + 0.01],
            [formData.center.lng - 0.01, formData.center.lat - 0.01]
          ]]
        },
        status: 'upcoming' as const,
        community_forming: true
      };
      
      // Store for the drive details page to use
      localStorage.setItem(`drive_${newDriveId}`, JSON.stringify(newDrive));
      
      // Show success message briefly
      setShowSuccess(true);
      
      // Wait a moment for user to see success, then redirect
      setTimeout(() => {
        router.push(`/drives/${newDriveId}`);
      }, 1000);
    } catch (error) {
      console.error('Failed to create drive:', error);
      // Handle error (show error message, etc.)
    } finally {
      setIsCreating(false);
    }
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const getPolygonStats = () => {
    if (!formData.polygon) return null;
    
    const coordinates = formData.polygon.coordinates[0];
    return {
      points: coordinates.length - 1, // Last point is same as first
      hasPolygon: true
    };
  };

  const polygonStats = getPolygonStats();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Confirm & Create Drive
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review the details below and create your sterilization drive
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Drive Information
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Title"
                secondary={formData.title}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Description"
                secondary={formData.description || 'No description provided'}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Date"
                secondary={formData.date ? new Date(formData.date).toLocaleDateString() : 'Not set'}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Location"
                secondary={`${formData.area}, ${formData.city}`}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Center Coordinates"
                secondary={formatCoordinates(formData.center.lat, formData.center.lng)}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Target Area
          </Typography>
          {polygonStats ? (
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Polygon Defined"
                  secondary={`✓ Area marked with ${polygonStats.points} boundary points`}
                />
              </ListItem>
            </List>
          ) : (
            <Alert severity="warning">
              No target area polygon defined. The drive will use the default city center.
            </Alert>
          )}
        </CardContent>
      </Card>

      {!polygonStats && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Note:</strong> You can add a target area polygon later by editing the drive.
        </Alert>
      )}

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>Drive created successfully!</strong> Redirecting to drive details...
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={isCreating || showSuccess}
          size="large"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateDrive}
          disabled={isCreating || showSuccess}
          size="large"
          sx={{ minWidth: 140 }}
        >
          {showSuccess ? (
            <>
              ✓ Created! Redirecting...
            </>
          ) : isCreating ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            'Create Drive'
          )}
        </Button>
      </Box>
    </Box>
  );
}
