'use client';

import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Emergency } from '@/types/emergency';

interface EmergencyMarkerProps {
  emergency: Emergency;
  onClick?: (emergency: Emergency) => void;
}

// Create custom emergency icons based on severity
const createEmergencyIcon = (severity: Emergency['severity']) => {
  const colors = {
    critical: '#d32f2f',
    high: '#f57c00', 
    medium: '#fbc02d',
    low: '#1976d2'
  };

  const color = colors[severity];
  
  // Create a custom red flag SVG icon
  const flagSvg = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <!-- Flag pole -->
      <rect x="2" y="0" width="3" height="40" fill="#333" />
      
      <!-- Flag -->
      <path d="M5 2 L25 2 L20 10 L25 18 L5 18 Z" fill="${color}" stroke="#fff" stroke-width="1"/>
      
      <!-- Emergency symbol -->
      <text x="12" y="12" font-family="Arial" font-size="8" fill="white" text-anchor="middle">🚨</text>
      
      <!-- Pulsing circle for critical -->
      ${severity === 'critical' ? `
        <circle cx="15" cy="10" r="12" fill="none" stroke="${color}" stroke-width="2" opacity="0.6">
          <animate attributeName="r" values="8;15;8" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
      ` : ''}
      
      <!-- Shadow -->
      <ellipse cx="4" cy="38" rx="3" ry="2" fill="rgba(0,0,0,0.3)"/>
    </svg>
  `;

  return L.divIcon({
    html: flagSvg,
    className: 'emergency-marker',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  });
};

// Create a larger icon for critical emergencies
const createCriticalEmergencyIcon = () => {
  const flagSvg = `
    <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <!-- Flag pole -->
      <rect x="3" y="0" width="4" height="50" fill="#333" />
      
      <!-- Flag -->
      <path d="M7 3 L35 3 L28 13 L35 23 L7 23 Z" fill="#d32f2f" stroke="#fff" stroke-width="2"/>
      
      <!-- Emergency symbols -->
      <text x="18" y="15" font-family="Arial" font-size="12" fill="white" text-anchor="middle">⚠</text>
      
      <!-- Pulsing circles -->
      <circle cx="20" cy="13" r="15" fill="none" stroke="#d32f2f" stroke-width="3" opacity="0.6">
        <animate attributeName="r" values="10;20;10" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="13" r="18" fill="none" stroke="#ff6b6b" stroke-width="2" opacity="0.4">
        <animate attributeName="r" values="12;25;12" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      <!-- Shadow -->
      <ellipse cx="5" cy="47" rx="4" ry="3" fill="rgba(0,0,0,0.3)"/>
    </svg>
  `;

  return L.divIcon({
    html: flagSvg,
    className: 'emergency-marker critical',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });
};

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const emergency = new Date(dateString);
  const diffMs = now.getTime() - emergency.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return emergency.toLocaleDateString();
};

export default function EmergencyMarker({ emergency, onClick }: EmergencyMarkerProps) {
  const [icon, setIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    // Create the appropriate icon based on severity
    const emergencyIcon = emergency.severity === 'critical' 
      ? createCriticalEmergencyIcon()
      : createEmergencyIcon(emergency.severity);
    
    setIcon(emergencyIcon);
  }, [emergency.severity]);

  if (!icon) return null;

  const handleMarkerClick = () => {
    onClick?.(emergency);
  };

  return (
    <Marker 
      position={[emergency.lat, emergency.lng]}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick
      }}
    >
      <Popup>
        <div style={{ minWidth: '200px', maxWidth: '300px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            borderBottom: '2px solid #d32f2f',
            paddingBottom: '8px'
          }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🚨</span>
            <strong style={{ color: '#d32f2f', fontSize: '16px' }}>
              EMERGENCY ALERT
            </strong>
          </div>
          
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: '#333',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {emergency.title}
          </h3>
          
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: emergency.severity === 'critical' ? '#d32f2f' : 
                             emergency.severity === 'high' ? '#f57c00' : 
                             emergency.severity === 'medium' ? '#fbc02d' : '#1976d2'
            }}>
              {emergency.severity.toUpperCase()} PRIORITY
            </span>
          </div>
          
          <p style={{ 
            margin: '8px 0', 
            fontSize: '12px', 
            color: '#666',
            lineHeight: '1.4'
          }}>
            {emergency.description.length > 120 
              ? emergency.description.substring(0, 120) + '...'
              : emergency.description
            }
          </p>
          
          <div style={{ 
            fontSize: '11px', 
            color: '#999',
            borderTop: '1px solid #eee',
            paddingTop: '6px',
            marginTop: '8px'
          }}>
            <div>📍 Location: {emergency.lat.toFixed(4)}, {emergency.lng.toFixed(4)}</div>
            <div>⏰ Reported: {getTimeAgo(emergency.created_at)}</div>
          </div>
          
          {emergency.photo_url && (
            <div style={{ marginTop: '8px' }}>
              <img 
                src={emergency.photo_url} 
                alt="Emergency" 
                style={{ 
                  width: '100%', 
                  maxHeight: '150px', 
                  objectFit: 'cover',
                  borderRadius: '4px'
                }} 
              />
            </div>
          )}
          
          <div style={{ 
            marginTop: '12px',
            textAlign: 'center'
          }}>
            <button 
              onClick={handleMarkerClick}
              style={{
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              VIEW DETAILS & RESPOND
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
