'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamic imports for react-leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const FeatureGroup = dynamic(() => import('react-leaflet').then(m => m.FeatureGroup), { ssr: false });

// Import draw control dynamically
const EditControl = dynamic(() => import('react-leaflet-draw').then(m => m.EditControl), { ssr: false });

interface DriveAreaSelectorProps {
  center?: { lat: number; lng: number } | null;
  initialPolygon?: GeoJSON.Polygon | undefined;
  onPolygonChange: (polygon: GeoJSON.Polygon | null) => void;
}

export default function DriveAreaSelector({
  center,
  initialPolygon,
  onPolygonChange
}: DriveAreaSelectorProps) {
  const mapRef = useRef<any>(null);
  const featureGroupRef = useRef<any>(null);
  const [currentPolygon, setCurrentPolygon] = useState<GeoJSON.Polygon | null>(initialPolygon || null);

  // Recenter map when center prop changes - THIS IS THE KEY REQUIREMENT
  useEffect(() => {
    if (center && mapRef.current) {
      console.log('Recentering map to:', center);
      mapRef.current.setView([center.lat, center.lng], 18);
    }
  }, [center]);

  const handleCreated = (e: any) => {
    const layer = e.layer;
    const geoJSON = layer.toGeoJSON();
    
    // Clear existing polygons (only allow one)
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
    
    console.log('Polygon created:', geoJSON.geometry);
    setCurrentPolygon(geoJSON.geometry);
    onPolygonChange(geoJSON.geometry);
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      const geoJSON = layer.toGeoJSON();
      setCurrentPolygon(geoJSON.geometry);
      onPolygonChange(geoJSON.geometry);
    });
  };

  const handleDeleted = () => {
    setCurrentPolygon(null);
    onPolygonChange(null);
  };

  const handleReset = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    setCurrentPolygon(null);
    onPolygonChange(null);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Mission Area
      </Typography>
      
      <Box
        sx={{
          height: { xs: 280, md: 360 },
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 2,
          mb: 2
        }}
      >
        <MapContainer
          ref={mapRef}
          center={center ? [center.lat, center.lng] : [28.6139, 77.2090]} // Default to Delhi
          zoom={center ? 18 : 11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution="© Google Hybrid"
            maxNativeZoom={22}
            maxZoom={25}
            noWrap={true}
          />
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onEdited={handleEdited}
              onDeleted={handleDeleted}
              draw={{
                polygon: true,
                rectangle: true,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false
              }}
              edit={{
                edit: true,
                remove: true
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleReset}
          disabled={!currentPolygon}
          sx={{ borderRadius: 1 }}
        >
          Reset Area
        </Button>

        {currentPolygon && (
          <Chip
            label="Area selected"
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {currentPolygon 
          ? 'Area selected. Use the edit tools to modify or delete it.'
          : 'Use the polygon or rectangle tools on the map to draw your mission area.'
        }
      </Typography>
    </Box>
  );
}
