// src/hooks/useDriveForm.ts
'use client';

import { useState, useCallback } from 'react';

export interface DriveFormData {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  range_km: number | null;
  city: string;
  area: string;
  center: { lat: number; lng: number } | null;
  community_forming: boolean;
  polygon: GeoJSON.Polygon | null;
}

export interface DriveFormValidation {
  title?: string;
  date?: string;
  city?: string;
  area?: string;
  center?: string;
  polygon?: string;
}

const initialFormData: DriveFormData = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0], // Today's date
  range_km: null,
  city: '',
  area: '',
  center: null,
  community_forming: false,
  polygon: null,
};

export const useDriveForm = () => {
  const [formData, setFormData] = useState<DriveFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<DriveFormValidation>({});

  const updateForm = useCallback((updates: Partial<DriveFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear related errors when field is updated
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key as keyof DriveFormValidation];
    });
    setErrors(newErrors);
  }, [errors]);

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: DriveFormValidation = {};

    if (step === 0) {
      // Details step validation
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.date) {
        newErrors.date = 'Date is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.area.trim()) {
        newErrors.area = 'Area is required';
      }
    } else if (step === 1) {
      // Area step validation
      if (!formData.center) {
        newErrors.center = 'Please select a valid city and area to set the map center';
      }
      if (!formData.polygon) {
        newErrors.polygon = 'Please draw an area on the map';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setErrors({});
  }, []);

  const toPayload = useCallback(() => {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      range_km: formData.range_km,
      city: formData.city.trim(),
      area: formData.area.trim(),
      center: formData.center!,
      community_forming: formData.community_forming,
      polygon: formData.polygon!,
    };
  }, [formData]);

  const isStepValid = useCallback((step: number): boolean => {
    if (step === 0) {
      return !!(
        formData.title.trim() &&
        formData.date &&
        formData.city.trim() &&
        formData.area.trim()
      );
    } else if (step === 1) {
      return !!(formData.center && formData.polygon);
    }
    return true;
  }, [formData]);

  return {
    formData,
    currentStep,
    errors,
    updateForm,
    nextStep,
    prevStep,
    validateStep,
    reset,
    toPayload,
    isStepValid,
  };
};
