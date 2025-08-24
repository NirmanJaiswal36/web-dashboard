'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Sighting } from '@/hooks/useMapData';

interface HeatmapLayerProps {
  points: Sighting[];
}

export default function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    const initializeHeatmap = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Dynamically import Leaflet and leaflet.heat
        const L = (await import('leaflet')).default;
        
        // Import leaflet.heat
        await import('leaflet.heat');

        // Remove existing heat layer
        if (heatLayerRef.current && map) {
          map.removeLayer(heatLayerRef.current);
        }

        // Convert sightings to heat points
        const heatPoints = points.map(sighting => [
          sighting.location.lat,
          sighting.location.lng,
          getIntensity(sighting) // Weight based on status
        ]);

        if (heatPoints.length > 0) {
          // Create heat layer
          heatLayerRef.current = (L as any).heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
              0.0: '#313695',
              0.1: '#4575b4',
              0.2: '#74add1',
              0.3: '#abd9e9',
              0.4: '#e0f3f8',
              0.5: '#ffffcc',
              0.6: '#fee090',
              0.7: '#fdae61',
              0.8: '#f46d43',
              0.9: '#d73027',
              1.0: '#a50026'
            }
          });

          map.addLayer(heatLayerRef.current);
        }
      } catch (error) {
        console.warn('Failed to load heatmap:', error);
      }
    };

    initializeHeatmap();

    return () => {
      if (heatLayerRef.current && map) {
        try {
          map.removeLayer(heatLayerRef.current);
        } catch (error) {
          console.warn('Error removing heat layer:', error);
        }
      }
    };
  }, [map, points]);

  return null; // This component doesn't render anything directly
}

// Helper function to determine heat intensity based on sighting
function getIntensity(sighting: Sighting): number {
  // Active sightings get higher intensity
  switch (sighting.status) {
    case 'active':
      return 1.0;
    case 'sterilized':
      return 0.3;
    case 'resolved':
      return 0.1;
    default:
      return 0.5;
  }
}
