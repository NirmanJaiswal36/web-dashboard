'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Autocomplete,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { City, State, Country } from 'country-state-city';
import { DriveFormData } from '@/app/drives/create/page';

interface DriveFormStepProps {
  formData: DriveFormData;
  onUpdate: (data: Partial<DriveFormData>) => void;
  onNext: () => void;
}

export function DriveFormStep({ formData, onUpdate, onNext }: DriveFormStepProps) {
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  // Initialize with India
  useEffect(() => {
    const india = Country.getCountryByCode('IN');
    if (india) {
      setSelectedCountry(india);
      const indianStates = State.getStatesOfCountry('IN');
      setStates(indianStates);
    }
  }, []);

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      const stateCities = City.getCitiesOfState('IN', selectedState.isoCode);
      setCities(stateCities);
    }
  }, [selectedState]);

  // Get coordinates for selected city
  const getCityCoordinates = (city: any) => {
    if (city && city.latitude && city.longitude) {
      return {
        lat: parseFloat(city.latitude),
        lng: parseFloat(city.longitude)
      };
    }
    // Default to Delhi if no coordinates
    return { lat: 28.6139, lng: 77.2090 };
  };

  const handleCityChange = (city: any) => {
    setSelectedCity(city);
    if (city) {
      const center = getCityCoordinates(city);
      onUpdate({
        city: city.name,
        area: city.name, // For now, use city as area
        center
      });
    }
  };

  const isFormValid = () => {
    return formData.title && formData.date && formData.city && formData.area;
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onNext();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Drive Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Fill in the basic information for your sterilization drive
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Drive Title"
              value={formData.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., South Delhi Community Drive"
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              multiline
              rows={3}
              placeholder="Describe the drive objectives and target area..."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              label="Drive Date"
              value={formData.date ? new Date(formData.date) : null}
              onChange={(date) => onUpdate({ date: date?.toISOString().split('T')[0] || '' })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={states}
              getOptionLabel={(option) => option.name}
              value={selectedState}
              onChange={(_, value) => setSelectedState(value)}
              renderInput={(params) => (
                <TextField {...params} label="State" placeholder="Select state" />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={cities}
              getOptionLabel={(option) => option.name}
              value={selectedCity}
              onChange={(_, value) => handleCityChange(value)}
              disabled={!selectedState}
              renderInput={(params) => (
                <TextField {...params} label="City" placeholder="Select city" required />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Area/Ward"
              value={formData.area}
              onChange={(e) => onUpdate({ area: e.target.value })}
              placeholder="e.g., Sector 47, Saket"
              required
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid()}
            size="large"
          >
            Next: Define Area
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
