'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { MyLocationOutlined } from '@mui/icons-material';
import { City, State } from 'country-state-city';

interface CityOption {
  name: string;
  state: string;
  center?: { lat: number; lng: number };
}

interface CityWardSelectorProps {
  valueCity: string;
  valueArea: string;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
  onCenterChange: (center: { lat: number; lng: number }) => void;
}

// Geocoding helper using Nominatim (OpenStreetMap)
const geocodeArea = async (area: string, city: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const query = `${area}, ${city}, India`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
};

export const CityWardSelector: React.FC<CityWardSelectorProps> = ({
  valueCity,
  valueArea,
  onCityChange,
  onAreaChange,
  onCenterChange,
}) => {
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedCityData, setSelectedCityData] = useState<CityOption | null>(null);

  // Initialize city options from country-state-city
  useEffect(() => {
    try {
      // Get cities from India only
      const indianCities = City.getCitiesOfCountry('IN') || [];
      
      // Transform the cities data into our format
      const transformedCities: CityOption[] = indianCities.map((city) => ({
        name: city.name,
        state: city.stateCode,
        center: city.latitude && city.longitude ? { 
          lat: parseFloat(city.latitude), 
          lng: parseFloat(city.longitude) 
        } : undefined,
      }));
      
      // Remove duplicates and sort
      const uniqueCities = transformedCities
        .filter((city, index, self) => 
          index === self.findIndex(c => c.name === city.name && c.state === city.state)
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setCityOptions(uniqueCities);
    } catch (error) {
      console.error('Failed to load cities:', error);
      // Fallback to empty array
      setCityOptions([]);
    }
  }, []);

  // Handle city selection
  const handleCityChange = useCallback((event: any, newValue: CityOption | null) => {
    const cityName = newValue?.name || '';
    onCityChange(cityName);
    setSelectedCityData(newValue);
    
    // If city has center data, use it immediately
    if (newValue?.center) {
      onCenterChange(newValue.center);
    }
    
    // Clear area when city changes
    if (valueArea) {
      onAreaChange('');
    }
  }, [onCityChange, onCenterChange, onAreaChange, valueArea]);

  // Handle area change and attempt to get center
  const handleAreaChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const areaValue = event.target.value;
    onAreaChange(areaValue);
  }, [onAreaChange]);

  // Manual geocoding when user clicks "Find center"
  const handleFindCenter = useCallback(async () => {
    if (!valueArea || !valueCity) return;
    
    setGeocoding(true);
    try {
      const center = await geocodeArea(valueArea, valueCity);
      if (center) {
        onCenterChange(center);
      } else {
        // Could show a toast/snackbar here
        console.warn('Could not find center for:', valueArea, valueCity);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setGeocoding(false);
    }
  }, [valueArea, valueCity, onCenterChange]);

  // Find the currently selected city object
  const selectedCity = cityOptions.find(city => city.name === valueCity) || null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Location Selection
      </Typography>
      
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
        <Box flex={1}>
          <Autocomplete
            options={cityOptions}
            getOptionLabel={(option) => `${option.name}, ${option.state}`}
            value={selectedCity}
            onChange={handleCityChange}
            filterOptions={(options, { inputValue }) =>
              options.filter((option) =>
                option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.state.toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                placeholder="Search for a city..."
                required
                fullWidth
                inputProps={{
                  ...params.inputProps,
                  'aria-label': 'Select city',
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={`${option.name}-${option.state}`}>
                <Box>
                  <Typography variant="body2" component="div">
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.state}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText="No cities found"
            loading={cityOptions.length === 0}
          />
        </Box>

        <Box flex={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label="Area/Ward"
              placeholder="Enter area or ward name..."
              value={valueArea}
              onChange={handleAreaChange}
              required
              fullWidth
              inputProps={{
                'aria-label': 'Enter area or ward name',
              }}
            />
            
            <Tooltip title="Find center coordinates for this area">
              <span>
                <IconButton
                  onClick={handleFindCenter}
                  disabled={!valueArea || !valueCity || geocoding}
                  color="primary"
                  aria-label="Find center coordinates"
                >
                  {geocoding ? (
                    <CircularProgress size={20} />
                  ) : (
                    <MyLocationOutlined />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      {/* Help text */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Select a city and enter the specific area or ward. Use the location button to find coordinates if needed.
      </Typography>
    </Box>
  );
};
