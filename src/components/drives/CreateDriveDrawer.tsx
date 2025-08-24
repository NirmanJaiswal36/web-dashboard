// src/components/drives/CreateDriveDrawer.tsx
'use client';

import { 
  Drawer, 
  Box, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  TextField,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDriveForm } from '@/hooks/useDriveForm';
import { postDrive } from '@/lib/api';
import { CityWardSelector } from './CityWardSelector';
import DriveAreaSelector from './DriveAreaSelector';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const steps = ['Details', 'Area', 'Review'];

interface CreateDriveDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateDriveDrawer({ open, onClose }: CreateDriveDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    formData,
    currentStep,
    errors,
    updateForm,
    nextStep,
    prevStep,
    reset,
    toPayload,
    isStepValid,
  } = useDriveForm();

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep();
    }
  };

  const handleBack = () => {
    prevStep();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const payload = toPayload();
      console.log('Submitting drive payload:', payload);
      
      const response = await postDrive(payload);
      
      if (response.data && response.data.id) {
        console.log('Drive created successfully:', response.data);
        handleClose();
        router.push(`/drives/${response.data.id}`);
      } else {
        setSubmitError('No ID returned from server');
      }
    } catch (error: any) {
      console.error('Failed to create drive:', error);
      
      // If backend is unreachable in dev, log payload and show dev message
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        console.log('DEV MODE: Backend unreachable, payload would be:', toPayload());
        setSubmitError('Development mode: Backend not available. Check console for payload.');
      } else {
        setSubmitError(error.response?.data?.message || 'Failed to create drive. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Drive Details
            </Typography>
            
            <TextField
              label="Drive Title"
              value={formData.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Drive Date"
                value={formData.date ? new Date(formData.date) : null}
                onChange={(date) => updateForm({ 
                  date: date ? date.toISOString().split('T')[0] : '' 
                })}
                slotProps={{
                  textField: {
                    error: !!errors.date,
                    helperText: errors.date,
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>
            
            <TextField
              label="Range (km)"
              type="number"
              value={formData.range_km || ''}
              onChange={(e) => updateForm({ 
                range_km: e.target.value ? Number(e.target.value) : null 
              })}
              fullWidth
            />
            
            <CityWardSelector
              valueCity={formData.city}
              valueArea={formData.area}
              onCityChange={(city) => updateForm({ city })}
              onAreaChange={(area) => updateForm({ area })}
              onCenterChange={(center) => updateForm({ center })}
            />
            
            {errors.city && (
              <Typography color="error" variant="caption">{errors.city}</Typography>
            )}
            {errors.area && (
              <Typography color="error" variant="caption">{errors.area}</Typography>
            )}
            {errors.center && (
              <Typography color="error" variant="caption">{errors.center}</Typography>
            )}
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.community_forming}
                  onChange={(e) => updateForm({ community_forming: e.target.checked })}
                />
              }
              label="Community Forming"
            />
            <Typography variant="caption" color="text.secondary">
              Enable if this drive aims to form a local community group
            </Typography>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <DriveAreaSelector
              center={formData.center}
              initialPolygon={formData.polygon || undefined}
              onPolygonChange={(polygon) => updateForm({ polygon })}
            />
            {errors.polygon && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.polygon}
              </Alert>
            )}
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Drive Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                <Typography>{formData.title}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography>{formData.description || 'No description'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography>{formData.date}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                <Typography>{formData.area}, {formData.city}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Range</Typography>
                <Typography>{formData.range_km ? `${formData.range_km} km` : 'Not specified'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Community Forming</Typography>
                <Typography>{formData.community_forming ? 'Yes' : 'No'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Area Selected</Typography>
                <Typography>{formData.polygon ? 'Yes' : 'No polygon selected'}</Typography>
              </Box>
            </Box>
            
            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 600,
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">
            Start a Drive
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Stepper */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {renderStepContent()}
        </Box>

        {/* Actions */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Drive'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
