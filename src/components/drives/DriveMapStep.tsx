'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { DriveFormData } from '@/app/drives/create/page';
import { GeoJSONPolygon } from '@/types/drives';

interface DriveMapStepProps {
  formData: DriveFormData;
  onUpdate: (data: Partial<DriveFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DriveMapStep({ formData, onUpdate, onNext, onBack }: DriveMapStepProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [drawnPolygon, setDrawnPolygon] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    let mapInstance: any = null;

    // Dynamically import Leaflet to avoid SSR issues
    const initializeMap = async () => {
      if (typeof window === 'undefined') return;
      if (map) return; // Already initialized

      const L = (await import('leaflet')).default;
      await import('leaflet-draw');
      
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });

      if (mapRef.current && !map) {
        // Clear any existing map instance in the container
        if ((mapRef.current as any)._leaflet_id) {
          (mapRef.current as any)._leaflet_id = null;
        }

        // Initialize map
        mapInstance = L.map(mapRef.current).setView(
          [formData.center.lat, formData.center.lng], 
          18
        );

        // Add Google Hybrid tiles
        L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          attribution: '© Google Hybrid',
          maxNativeZoom: 22,
          maxZoom: 25,
          noWrap: true
        }).addTo(mapInstance);

        // Add marker for city center
        L.marker([formData.center.lat, formData.center.lng])
          .addTo(mapInstance)
          .bindPopup(`${formData.area}, ${formData.city}`)
          .openPopup();

        // Initialize draw controls
        const drawnItems = new L.FeatureGroup();
        mapInstance.addLayer(drawnItems);

        const drawControl = new (L as any).Control.Draw({
          position: 'topright',
          draw: {
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e1e100',
                message: '<strong>Error:</strong> Shape edges cannot cross!'
              },
              shapeOptions: {
                color: '#97009c',
                weight: 3,
                fillOpacity: 0.2
              }
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
          },
          edit: {
            featureGroup: drawnItems,
            remove: true
          }
        });

        mapInstance.addControl(drawControl);

        // Handle polygon creation
        mapInstance.on((L as any).Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          
          // Remove existing polygon
          if (drawnPolygon) {
            drawnItems.removeLayer(drawnPolygon);
          }
          
          drawnItems.addLayer(layer);
          setDrawnPolygon(layer);

          // Convert to GeoJSON
          const geoJson = layer.toGeoJSON();
          const polygon: GeoJSONPolygon = {
            type: 'Polygon',
            coordinates: geoJson.geometry.coordinates
          };
          
          onUpdate({ polygon });
        });

        // Handle polygon deletion
        mapInstance.on((L as any).Draw.Event.DELETED, () => {
          setDrawnPolygon(null);
          onUpdate({ polygon: undefined });
        });

        setMap(mapInstance);
        setIsMapReady(true);
      }
    };

    initializeMap();

    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        mapInstance = null;
      }
      if (map && map !== mapInstance) {
        try {
          map.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        setMap(null);
      }
    };
  }, [formData.center]);

  const isValid = () => {
    return formData.polygon !== undefined;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Define Target Area
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Draw a polygon around the area where the sterilization drive will take place
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Drive Location: {formData.area}, {formData.city}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Center coordinates: {formData.center.lat.toFixed(4)}, {formData.center.lng.toFixed(4)}
          </Typography>
        </CardContent>
      </Card>

      {!isMapReady && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading map...
        </Alert>
      )}

      <Box
        ref={mapRef}
        sx={{
          height: 500,
          width: '100%',
          border: '1px solid #ddd',
          borderRadius: 1,
          mb: 3
        }}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Instructions:</strong>
        <br />
        1. Use the polygon tool (□) on the top right to draw the target area
        <br />
        2. Click on the map to start drawing, continue clicking to add points
        <br />
        3. Double-click or click the first point again to complete the polygon
        <br />
        4. Use the edit tool (✏️) to modify or the delete tool (🗑️) to remove
      </Alert>

      {!formData.polygon && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please draw a polygon to define the target area before proceeding.
        </Alert>
      )}

      {formData.polygon && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Target area defined successfully! You can edit or redraw if needed.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          size="large"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!isValid()}
          size="large"
        >
          Next: Confirm & Create
        </Button>
      </Box>
    </Box>
  );
}
