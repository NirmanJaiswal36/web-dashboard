import { Sighting } from '@/hooks/useMapData';

export interface ExportData {
  id: string;
  timestamp: string;
  lat: number;
  lng: number;
  status: string;
  reporter?: string;
  notes?: string;
  species?: string;
}

/**
 * Export array of data to CSV file
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { [key in keyof T]: string }
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get column headers
  const keys = Object.keys(data[0]) as (keyof T)[];
  const headerRow = headers 
    ? keys.map(key => headers[key] || String(key))
    : keys.map(key => String(key));

  // Convert data to CSV rows
  const csvRows = [
    headerRow.join(','), // Header row
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value || '');
      }).join(',')
    )
  ];

  // Create and download CSV file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export sightings to CSV with proper formatting
 */
export function exportSightingsToCsv(sightings: Sighting[], filename?: string): void {
  const exportData: ExportData[] = sightings.map(sighting => ({
    id: sighting.id,
    timestamp: new Date(sighting.timestamp).toLocaleString(),
    lat: sighting.location.lat,
    lng: sighting.location.lng,
    status: sighting.status,
    reporter: sighting.reporter || '',
    notes: sighting.notes || '',
    species: sighting.species || ''
  }));

  const headers: { [key in keyof ExportData]: string } = {
    id: 'ID',
    timestamp: 'Timestamp',
    lat: 'Latitude',
    lng: 'Longitude',
    status: 'Status',
    reporter: 'Reporter',
    notes: 'Notes',
    species: 'Species'
  };

  const defaultFilename = `sightings_export_${new Date().toISOString().split('T')[0]}.csv`;
  
  exportToCsv(exportData, filename || defaultFilename, headers);
}

/**
 * Export filtered data with current filter information
 */
export function exportFilteredData(
  sightings: Sighting[],
  filterInfo: {
    timeRange: { from: string; to: string };
    status: string[];
    driveId?: string;
    searchQuery?: string;
  }
): void {
  // Add filter metadata as comments at the top of CSV
  const filterComments = [
    `# PawHub Sightings Export`,
    `# Generated: ${new Date().toLocaleString()}`,
    `# Time Range: ${new Date(filterInfo.timeRange.from).toLocaleDateString()} - ${new Date(filterInfo.timeRange.to).toLocaleDateString()}`,
    `# Status Filter: ${filterInfo.status.join(', ')}`,
    filterInfo.driveId ? `# Drive ID: ${filterInfo.driveId}` : '',
    filterInfo.searchQuery ? `# Search Query: ${filterInfo.searchQuery}` : '',
    `# Total Records: ${sightings.length}`,
    '', // Empty line before data
  ].filter(Boolean);

  const exportData: ExportData[] = sightings.map(sighting => ({
    id: sighting.id,
    timestamp: new Date(sighting.timestamp).toLocaleString(),
    lat: sighting.location.lat,
    lng: sighting.location.lng,
    status: sighting.status,
    reporter: sighting.reporter || '',
    notes: sighting.notes || '',
    species: sighting.species || ''
  }));

  const headers: { [key in keyof ExportData]: string } = {
    id: 'ID',
    timestamp: 'Timestamp',
    lat: 'Latitude',
    lng: 'Longitude',
    status: 'Status',
    reporter: 'Reporter',
    notes: 'Notes',
    species: 'Species'
  };

  // Create CSV content with metadata
  const headerRow = Object.values(headers).join(',');
  const dataRows = exportData.map(row => 
    Object.keys(headers).map(key => {
      const value = (row as any)[key];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value || '');
    }).join(',')
  );

  const csvContent = [
    ...filterComments,
    headerRow,
    ...dataRows
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const filename = `pawhub_filtered_export_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
