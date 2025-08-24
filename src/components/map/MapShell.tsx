// src/components/map/MapShell.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDriveAPI } from '@/hooks/useDriveAPI';
import { Emergency } from '@/types/emergency';

interface MapShellProps {
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
  onEmergencyClick?: (emergency: Emergency) => void;
  mapRef?: React.RefObject<any>;
}

function MapShellBase({ 
  center = [12.9716, 77.5946], 
  zoom = 13, 
  children, 
  onEmergencyClick,
  mapRef 
}: MapShellProps) {
  const { useEmergencies } = useDriveAPI();
  const { data: emergencies = [] } = useEmergencies();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading map...</div>;
  }

  // Dynamically import react-leaflet components only on client
  const MapContainer = require('react-leaflet').MapContainer;
  const TileLayer = require('react-leaflet').TileLayer;

  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {children}
      </MapContainer>
    </div>
  );
}

// Export with dynamic import to avoid SSR issues
export default dynamic(() => Promise.resolve(MapShellBase), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading map...</div>
});
