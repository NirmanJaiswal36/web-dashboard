'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { City, State } from 'country-state-city';
import { MissionFormData, CityOption, AreaOption } from '@/types/missions';
import { useMissionAPI } from '@/hooks/useMissionAPI';
import MissionMapDefiner from './MissionMapDefiner';

interface MissionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (missionId: number) => void;
}

const steps = ['Mission Details', 'Define Area'];

const MissionForm: React.FC<MissionFormProps> = ({ open, onClose, onSuccess }) => {
  const { createMission, createMissionLoading, createMissionError } = useMissionAPI();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<MissionFormData>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    city: '',
    area: '',
  });

  // City and area options
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);

  // Load cities for India
  React.useEffect(() => {
    const indianCities = City.getCitiesOfCountry('IN')?.map(city => ({
      label: `${city.name}, ${State.getStateByCodeAndCountry(city.stateCode, 'IN')?.name}`,
      value: city.name,
      lat: parseFloat(city.latitude || '0'),
      lon: parseFloat(city.longitude || '0'),
    })) || [];
    setCityOptions(indianCities);
  }, []);

  // Mock area options based on city
  React.useEffect(() => {
    if (selectedCity) {
      // In a real app, you'd fetch areas from your backend or a more detailed dataset
      const mockAreas: AreaOption[] = [
        { label: 'Central Area', value: 'central', lat: selectedCity.lat + 0.01, lon: selectedCity.lon + 0.01, city: selectedCity.value },
        { label: 'North Area', value: 'north', lat: selectedCity.lat + 0.02, lon: selectedCity.lon, city: selectedCity.value },
        { label: 'South Area', value: 'south', lat: selectedCity.lat - 0.02, lon: selectedCity.lon, city: selectedCity.value },
        { label: 'East Area', value: 'east', lat: selectedCity.lat, lon: selectedCity.lon + 0.02, city: selectedCity.value },
        { label: 'West Area', value: 'west', lat: selectedCity.lat, lon: selectedCity.lon - 0.02, city: selectedCity.value },
      ];
      setAreaOptions(mockAreas);
    } else {
      setAreaOptions([]);
      setSelectedArea(null);
    }
  }, [selectedCity]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate form before proceeding
      if (!formData.title || !formData.city || !formData.area) {
        return;
      }
      
      // Set center coordinates when moving to map step
      if (selectedArea) {
        setFormData(prev => ({
          ...prev,
          center: { lat: selectedArea.lat, lng: selectedArea.lon }
        }));
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!formData.polygon) {
      alert('Please define the mission area on the map');
      return;
    }

    try {
      await createMission(formData as any);
      onSuccess?.(1); // Mock ID for now
      handleClose();
    } catch (error) {
      console.error('Failed to create mission:', error);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      city: '',
      area: '',
    });
    setSelectedCity(null);
    setSelectedArea(null);
    onClose();
  };

  const handlePolygonChange = (polygon: any) => {
    setFormData(prev => ({ ...prev, polygon }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Create New Mission
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {createMissionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {createMissionError.message}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Mission Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Mission Date"
                  value={formData.date ? new Date(formData.date) : null}
                  onChange={(date) => setFormData(prev => ({ 
                    ...prev, 
                    date: date ? date.toISOString().split('T')[0] : ''
                  }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>

              <Autocomplete
                fullWidth
                options={cityOptions}
                getOptionLabel={(option) => option.label}
                value={selectedCity}
                onChange={(_, newValue) => {
                  setSelectedCity(newValue);
                  setFormData(prev => ({ ...prev, city: newValue?.value || '' }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="City" required />
                )}
              />
            </Box>

            <Autocomplete
              fullWidth
              options={areaOptions}
              getOptionLabel={(option) => option.label}
              value={selectedArea}
              onChange={(_, newValue) => {
                setSelectedArea(newValue);
                setFormData(prev => ({ ...prev, area: newValue?.value || '' }));
              }}
              disabled={!selectedCity}
              renderInput={(params) => (
                <TextField {...params} label="Area/Ward" required />
              )}
            />
          </Box>
        )}

        {activeStep === 1 && formData.center && (
          <Box sx={{ mt: 2, height: '500px' }}>
            <MissionMapDefiner
              center={formData.center}
              onPolygonChange={handlePolygonChange}
              initialPolygon={formData.polygon}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 3 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              disabled={createMissionLoading || !formData.polygon}
              variant="contained"
            >
              {createMissionLoading ? 'Creating...' : 'Create Mission'}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!formData.title || !formData.city || !formData.area}
              variant="contained"
            >
              Next
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MissionForm;
