'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Sighting, Emergency, Drive } from '@/hooks/useMapData';

interface ClusteredLayerProps {
  sightings: Sighting[];
  emergencies: Emergency[];
  drives: Drive[];
  onMarkerClick: (lat: number, lng: number) => void;
}

export default function ClusteredLayer({ 
  sightings, 
  emergencies, 
  drives, 
  onMarkerClick 
}: ClusteredLayerProps) {
  const map = useMap();
  const clusterGroupRef = useRef<any>(null);

  useEffect(() => {
    const initializeClusterGroup = async () => {
      if (typeof window === 'undefined') return;

      // Dynamically import Leaflet and MarkerClusterGroup
      const L = (await import('leaflet')).default;
      const { MarkerClusterGroup } = await import('leaflet.markercluster');

      // Create cluster group if it doesn't exist
      if (!clusterGroupRef.current) {
        clusterGroupRef.current = new MarkerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            let className = 'marker-cluster marker-cluster-';
            
            if (count < 10) className += 'small';
            else if (count < 100) className += 'medium';
            else className += 'large';

            return L.divIcon({
              html: `<div><span>${count}</span></div>`,
              className: className,
              iconSize: [40, 40]
            });
          }
        });
        
        map.addLayer(clusterGroupRef.current);
      }

      // Clear existing markers
      clusterGroupRef.current.clearLayers();

      // Add sighting markers
      sightings.forEach((sighting) => {
        const marker = L.marker([sighting.location.lat, sighting.location.lng], {
          icon: L.divIcon({
            className: `sighting-marker sighting-${sighting.status}`,
            html: `
              <div class="marker-content">
                <div class="marker-avatar">
                  ${sighting.photo_url ? 
                    `<img src="${sighting.photo_url}" alt="Animal" />` : 
                    '🐾'
                  }
                </div>
                <div class="marker-badge ${sighting.status}"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        });

        // Create popup content
        const popupContent = `
          <div class="custom-popup">
            <h4>${sighting.species || 'Animal'} Sighting</h4>
            <p><strong>Status:</strong> <span class="status-${sighting.status}">${sighting.status}</span></p>
            ${sighting.notes ? `<p><strong>Notes:</strong> ${sighting.notes}</p>` : ''}
            ${sighting.reporter ? `<p><strong>Reporter:</strong> ${sighting.reporter}</p>` : ''}
            <p><strong>Time:</strong> ${new Date(sighting.timestamp).toLocaleString()}</p>
            <div class="popup-actions">
              <button onclick="window.centerMap(${sighting.location.lat}, ${sighting.location.lng})">
                Center Map
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        marker.on('click', () => {
          onMarkerClick(sighting.location.lat, sighting.location.lng);
        });

        clusterGroupRef.current.addLayer(marker);
      });

      // Add emergency markers
      emergencies.forEach((emergency) => {
        const marker = L.marker([emergency.lat, emergency.lng], {
          icon: L.divIcon({
            className: `emergency-marker emergency-${emergency.severity}`,
            html: `
              <div class="emergency-content">
                <div class="emergency-icon">🚨</div>
                <div class="emergency-pulse ${emergency.severity}"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        });

        const popupContent = `
          <div class="custom-popup emergency">
            <h4>Emergency: ${emergency.title}</h4>
            <p><strong>Severity:</strong> <span class="severity-${emergency.severity}">${emergency.severity}</span></p>
            <p>${emergency.description}</p>
            <p><strong>Reported:</strong> ${new Date(emergency.created_at).toLocaleString()}</p>
            <div class="popup-actions">
              <button class="emergency-action">Take Action</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        marker.on('click', () => {
          onMarkerClick(emergency.lat, emergency.lng);
        });

        clusterGroupRef.current.addLayer(marker);
      });

      // Add drive polygons (not clustered)
      drives.forEach((drive) => {
        if (drive.polygon) {
          const polygon = L.geoJSON(drive.polygon, {
            style: {
              color: '#2E7D32',
              weight: 2,
              opacity: 0.8,
              fillColor: '#4CAF50',
              fillOpacity: 0.2
            }
          });

          polygon.bindPopup(`
            <div class="custom-popup drive">
              <h4>Drive: ${drive.title}</h4>
              <p><strong>Status:</strong> ${drive.status || 'Active'}</p>
              ${drive.date ? `<p><strong>Date:</strong> ${new Date(drive.date).toLocaleDateString()}</p>` : ''}
              <div class="popup-actions">
                <button onclick="window.location.href='/drives/${drive.id}'">
                  View Details
                </button>
              </div>
            </div>
          `);

          map.addLayer(polygon);
        }
      });

      // Add global function for popup actions
      (window as any).centerMap = (lat: number, lng: number) => {
        onMarkerClick(lat, lng);
      };
    };

    initializeClusterGroup();

    return () => {
      if (clusterGroupRef.current && map) {
        try {
          map.removeLayer(clusterGroupRef.current);
        } catch (error) {
          console.warn('Error removing cluster group:', error);
        }
      }
    };
  }, [map, sightings, emergencies, drives, onMarkerClick]);

  // Add custom CSS for markers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      .sighting-marker {
        background: transparent;
        border: none;
      }
      
      .marker-content {
        position: relative;
        width: 32px;
        height: 32px;
      }
      
      .marker-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        background: #fff;
        border: 2px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
      
      .marker-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .marker-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
      }
      
      .marker-badge.active { background: #ff9800; }
      .marker-badge.sterilized { background: #4caf50; }
      .marker-badge.resolved { background: #9e9e9e; }
      
      .emergency-marker {
        background: transparent;
        border: none;
      }
      
      .emergency-content {
        position: relative;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .emergency-icon {
        font-size: 18px;
        z-index: 2;
      }
      
      .emergency-pulse {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      
      .emergency-pulse.critical { background: rgba(244, 67, 54, 0.6); }
      .emergency-pulse.high { background: rgba(255, 152, 0, 0.6); }
      .emergency-pulse.medium { background: rgba(255, 193, 7, 0.6); }
      .emergency-pulse.low { background: rgba(76, 175, 80, 0.6); }
      
      @keyframes pulse {
        0% { transform: scale(0.8); opacity: 1; }
        70% { transform: scale(1.2); opacity: 0.4; }
        100% { transform: scale(1.4); opacity: 0; }
      }
      
      .custom-popup h4 { margin: 0 0 8px 0; color: #333; }
      .custom-popup p { margin: 4px 0; font-size: 12px; }
      .custom-popup .popup-actions { margin-top: 8px; }
      .custom-popup button {
        background: #1976d2;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      }
      .custom-popup button:hover { background: #1565c0; }
      
      .status-active { color: #ff9800; font-weight: bold; }
      .status-sterilized { color: #4caf50; font-weight: bold; }
      .status-resolved { color: #9e9e9e; font-weight: bold; }
      
      .severity-critical { color: #f44336; font-weight: bold; }
      .severity-high { color: #ff9800; font-weight: bold; }
      .severity-medium { color: #ffc107; font-weight: bold; }
      .severity-low { color: #4caf50; font-weight: bold; }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null; // This component doesn't render anything directly
}
