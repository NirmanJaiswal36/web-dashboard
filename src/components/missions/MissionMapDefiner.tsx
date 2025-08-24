'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { GeoJSONPolygon } from '@/types/drives';

interface MissionMapDefinerProps {
  center: { lat: number; lng: number };
  onPolygonChange: (polygon: GeoJSONPolygon | null) => void;
  initialPolygon?: GeoJSONPolygon;
}

const MissionMapDefiner: React.FC<MissionMapDefinerProps> = ({
  center,
  onPolygonChange,
  initialPolygon,
}) => {
  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <Typography variant="h6">Map Component (Under Development)</Typography>
      <Typography variant="body2">
        Center: {center.lat}, {center.lng}
      </Typography>
      {/* TODO: Implement Leaflet map with draw functionality */}
      <Box 
        sx={{ 
          height: '400px', 
          width: '100%', 
          backgroundColor: '#f5f5f5', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #ccc',
          borderRadius: 1,
          mt: 2
        }}
      >
        <Typography color="text.secondary">
          Leaflet Map with Drawing Tools Will Be Here
        </Typography>
      </Box>
    </Box>
  );
};

export default MissionMapDefiner;
