// src/components/drives/DriveFormDetails.tsx
'use client';

import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Switch,
  Typography 
} from '@mui/material';
import { DriveFormData } from '@/hooks/useDriveForm';

interface DriveFormDetailsProps {
  formData: DriveFormData;
  onChange: (updates: Partial<DriveFormData>) => void;
}

// Mock data for cities and areas
const CITIES = [
  { id: 'bengaluru', name: 'Bengaluru', center: { lat: 12.9716, lng: 77.5946 } },
  { id: 'mumbai', name: 'Mumbai', center: { lat: 19.0760, lng: 72.8777 } },
  { id: 'delhi', name: 'Delhi', center: { lat: 28.7041, lng: 77.1025 } },
  { id: 'chennai', name: 'Chennai', center: { lat: 13.0827, lng: 80.2707 } },
];

const AREAS: Record<string, Array<{ id: string; name: string; center: { lat: number; lng: number } }>> = {
  bengaluru: [
    { id: 'ward-12', name: 'Ward 12', center: { lat: 12.9716, lng: 77.5946 } },
    { id: 'koramangala', name: 'Koramangala', center: { lat: 12.9352, lng: 77.6245 } },
    { id: 'indiranagar', name: 'Indiranagar', center: { lat: 12.9719, lng: 77.6412 } },
    { id: 'whitefield', name: 'Whitefield', center: { lat: 12.9698, lng: 77.7500 } },
  ],
  mumbai: [
    { id: 'bandra', name: 'Bandra', center: { lat: 19.0596, lng: 72.8295 } },
    { id: 'andheri', name: 'Andheri', center: { lat: 19.1136, lng: 72.8697 } },
  ],
  delhi: [
    { id: 'cp', name: 'Connaught Place', center: { lat: 28.6315, lng: 77.2167 } },
    { id: 'karol-bagh', name: 'Karol Bagh', center: { lat: 28.6519, lng: 77.1909 } },
  ],
  chennai: [
    { id: 't-nagar', name: 'T. Nagar', center: { lat: 13.0418, lng: 80.2341 } },
    { id: 'adyar', name: 'Adyar', center: { lat: 13.0067, lng: 80.2206 } },
  ],
};

export default function DriveFormDetails({ formData, onChange }: DriveFormDetailsProps) {
  const selectedCity = CITIES.find(city => city.id === formData.city);
  const availableAreas = selectedCity ? AREAS[selectedCity.id] || [] : [];

  const handleCityChange = (cityId: string) => {
    const city = CITIES.find(c => c.id === cityId);
    if (city) {
      onChange({
        city: cityId,
        area: '', // Reset area when city changes
        center: city.center,
      });
    }
  };

  const handleAreaChange = (areaId: string) => {
    const area = availableAreas.find(a => a.id === areaId);
    if (area) {
      onChange({
        area: areaId,
        center: area.center,
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        Drive Details
      </Typography>

      <TextField
        label="Drive Title"
        value={formData.title}
        onChange={(e) => onChange({ title: e.target.value })}
        required
        fullWidth
      />

      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => onChange({ description: e.target.value })}
        multiline
        rows={3}
        fullWidth
      />

      <TextField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => onChange({ date: e.target.value })}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <TextField
        label="Range (km)"
        type="number"
        value={formData.range_km || ''}
        onChange={(e) => onChange({ range_km: e.target.value ? Number(e.target.value) : null })}
        inputProps={{ min: 0, step: 0.1 }}
        fullWidth
      />

      <FormControl fullWidth required>
        <InputLabel>City</InputLabel>
        <Select
          value={formData.city}
          label="City"
          onChange={(e) => handleCityChange(e.target.value)}
        >
          {CITIES.map((city) => (
            <MenuItem key={city.id} value={city.id}>
              {city.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required disabled={!formData.city}>
        <InputLabel>Area</InputLabel>
        <Select
          value={formData.area}
          label="Area"
          onChange={(e) => handleAreaChange(e.target.value)}
        >
          {availableAreas.map((area) => (
            <MenuItem key={area.id} value={area.id}>
              {area.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            checked={formData.community_forming}
            onChange={(e) => onChange({ community_forming: e.target.checked })}
          />
        }
        label="Community Forming Drive"
      />
    </Box>
  );
}
