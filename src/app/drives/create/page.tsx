'use client';

import { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Paper } from '@mui/material';
import { DriveFormStep } from '@/components/drives/DriveFormStep';
import { DriveMapStep } from '@/components/drives/DriveMapStep';
import { DriveConfirmStep } from '@/components/drives/DriveConfirmStep';
import { Drive, GeoJSONPolygon } from '@/types/drives';

const steps = ['Drive Details', 'Define Area', 'Confirm & Create'];

export interface DriveFormData {
  title: string;
  description: string;
  date: string;
  city: string;
  area: string;
  center: { lat: number; lng: number };
  polygon?: GeoJSONPolygon;
}

export default function CreateDrivePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<DriveFormData>({
    title: '',
    description: '',
    date: '',
    city: '',
    area: '',
    center: { lat: 0, lng: 0 }
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const updateFormData = (data: Partial<DriveFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <DriveFormStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <DriveMapStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <DriveConfirmStep
            formData={formData}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </Paper>
    </Box>
  );
}
