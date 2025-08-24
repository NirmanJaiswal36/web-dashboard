// src/components/drives/DriveReview.tsx
'use client';

import { Box, Typography, Card, CardContent, Chip, Divider } from '@mui/material';
import { DriveFormData } from '@/hooks/useDriveForm';

interface DriveReviewProps {
  formData: DriveFormData;
}

export default function DriveReview({ formData }: DriveReviewProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        Review Drive Details
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {formData.title}
          </Typography>
          
          {formData.description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {formData.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={`📅 ${formData.date}`} 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={`📍 ${formData.city}`} 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={`🏘️ ${formData.area}`} 
              variant="outlined" 
              size="small" 
            />
            {formData.range_km && (
              <Chip 
                label={`📏 ${formData.range_km} km`} 
                variant="outlined" 
                size="small" 
              />
            )}
            {formData.community_forming && (
              <Chip 
                label="👥 Community Forming" 
                color="primary" 
                size="small" 
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Location Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Center: {formData.center.lat.toFixed(4)}, {formData.center.lng.toFixed(4)}
          </Typography>
          
          {formData.polygon && (
            <Typography variant="body2" color="text.secondary">
              Area polygon: {formData.polygon.coordinates[0]?.length || 0} points defined
            </Typography>
          )}
        </CardContent>
      </Card>

      {formData.polygon && (
        <Box sx={{ 
          height: 200, 
          bgcolor: 'grey.100', 
          borderRadius: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            Area Preview Map
            <br />
            <small>(Polygon with {formData.polygon.coordinates[0]?.length || 0} points)</small>
          </Typography>
        </Box>
      )}

      <Typography variant="body2" color="text.secondary">
        Click "Confirm" to create this drive and proceed to the dashboard.
      </Typography>
    </Box>
  );
}
