// src/components/drives/DriveAreaSelectorSimple.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { GeoJSONPolygon } from '@/types/drives';

interface DriveAreaSelectorSimpleProps {
  center: { lat: number; lng: number };
  polygon: GeoJSONPolygon | null;
  onPolygonChange: (polygon: GeoJSONPolygon | null) => void;
}

export default function DriveAreaSelectorSimple({ center, polygon, onPolygonChange }: DriveAreaSelectorSimpleProps) {
  const handleUseMapBounds = () => {
    // Create a simple rectangular polygon around the center
    const offset = 0.01; // roughly 1km
    const polygon: GeoJSONPolygon = {
      type: 'Polygon',
      coordinates: [[
        [center.lng - offset, center.lat + offset],
        [center.lng + offset, center.lat + offset],
        [center.lng + offset, center.lat - offset],
        [center.lng - offset, center.lat - offset],
        [center.lng - offset, center.lat + offset]
      ]]
    };
    onPolygonChange(polygon);
  };

  const handleReset = () => {
    onPolygonChange(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Select Drive Area
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleUseMapBounds}
        >
          Create Area Around Center
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleReset}
          disabled={!polygon}
        >
          Reset
        </Button>
      </Box>

      <Box sx={{ 
        height: 400, 
        border: '1px solid #ccc', 
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'grey.50'
      }}>
        <Typography variant="h6" color="text.secondary">
          Map Drawing Tool
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Interactive map with drawing tools will be loaded here.
          <br />
          For now, use "Create Area Around Center" to define a sample area.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </Typography>
      </Box>

      {polygon && (
        <Typography variant="body2" color="text.secondary">
          ✅ Area selected with {polygon.coordinates[0]?.length || 0} points.
        </Typography>
      )}
    </Box>
  );
}
