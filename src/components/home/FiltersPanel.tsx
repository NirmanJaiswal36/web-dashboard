'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
  Autocomplete,
  Stack,
  Slider,
  Divider,
  InputLabel,
  FormControl,
  OutlinedInput,
  SelectChangeEvent,
  Collapse,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { MapFilters } from './HomeDashboard';
import { Drive } from '@/hooks/useMapData';

// Simple debounce function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

interface FiltersPanelProps {
  filters: MapFilters;
  onFiltersChange: (filters: Partial<MapFilters>) => void;
  drives: Drive[];
  isLoading: boolean;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'warning' },
  { value: 'sterilized', label: 'Sterilized', color: 'success' },
  { value: 'resolved', label: 'Resolved', color: 'default' }
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
  { value: 'critical', label: 'Critical', color: 'error' }
];

const TIME_PRESETS = [
  { label: 'Last 24h', hours: 24 },
  { label: 'Last 7d', hours: 24 * 7 },
  { label: 'Last 30d', hours: 24 * 30 },
];

export default function FiltersPanel({ 
  filters, 
  onFiltersChange, 
  drives, 
  isLoading 
}: FiltersPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [customDateRange, setCustomDateRange] = useState(false);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onFiltersChange({ searchQuery: query });
    }, 300),
    [onFiltersChange]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    onFiltersChange({ status: value });
  };

  const handleSeverityChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    onFiltersChange({ severityFilter: value });
  };

  const handleTimePreset = (hours: number) => {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    onFiltersChange({ timeRange: { from, to } });
    setCustomDateRange(false);
  };

  const handleClearFilters = () => {
    onFiltersChange({
      timeRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      },
      status: ['active', 'sterilized'],
      species: undefined,
      driveId: undefined,
      severityFilter: ['low', 'medium', 'high', 'critical'],
      searchQuery: '',
      radiusKm: undefined,
      centerPoint: undefined
    });
    setCustomDateRange(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon color="primary" />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Box>
            <IconButton 
              size="small" 
              onClick={handleClearFilters}
              title="Clear all filters"
            >
              <ClearIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Stack spacing={3}>
            {/* Time Range */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Time Range
              </Typography>
              <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                {TIME_PRESETS.map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    size="small"
                    clickable
                    onClick={() => handleTimePreset(preset.hours)}
                    variant="outlined"
                  />
                ))}
                <Chip
                  label="Custom"
                  size="small"
                  clickable
                  onClick={() => setCustomDateRange(!customDateRange)}
                  color={customDateRange ? 'primary' : 'default'}
                />
              </Stack>
              
              <Collapse in={customDateRange}>
                <Stack direction="row" spacing={1} mt={1}>
                  <DatePicker
                    label="From"
                    value={new Date(filters.timeRange.from)}
                    onChange={(date) => date && onFiltersChange({
                      timeRange: { ...filters.timeRange, from: date.toISOString() }
                    })}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                  <DatePicker
                    label="To"
                    value={new Date(filters.timeRange.to)}
                    onChange={(date) => date && onFiltersChange({
                      timeRange: { ...filters.timeRange, to: date.toISOString() }
                    })}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Stack>
              </Collapse>
            </Box>

            <Divider />

            {/* Status Filter */}
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status}
                  onChange={handleStatusChange}
                  input={<OutlinedInput label="Status" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const option = STATUS_OPTIONS.find(opt => opt.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={option?.label || value} 
                            size="small"
                            color={option?.color as any}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Drive Selector */}
            <Box>
              <Autocomplete
                options={drives}
                getOptionLabel={(option) => option.title}
                value={drives.find(d => d.id === filters.driveId) || null}
                onChange={(_, value) => onFiltersChange({ driveId: value?.id })}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Filter by Drive" 
                    size="small"
                    placeholder="All drives"
                  />
                )}
                size="small"
                loading={isLoading}
              />
            </Box>

            {/* Emergency Severity */}
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Emergency Severity</InputLabel>
                <Select
                  multiple
                  value={filters.severityFilter}
                  onChange={handleSeverityChange}
                  input={<OutlinedInput label="Emergency Severity" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const option = SEVERITY_OPTIONS.find(opt => opt.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={option?.label || value} 
                            size="small"
                            color={option?.color as any}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {SEVERITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Search */}
            <Box>
              <TextField
                fullWidth
                size="small"
                label="Search"
                placeholder="Search in notes, reporter..."
                onChange={handleSearchChange}
                defaultValue={filters.searchQuery}
              />
            </Box>

            <Divider />

            {/* Map Display Options */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Map Display
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showHeatmap}
                      onChange={(e) => onFiltersChange({ showHeatmap: e.target.checked })}
                    />
                  }
                  label="Show Heatmap"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showClusters}
                      onChange={(e) => onFiltersChange({ showClusters: e.target.checked })}
                    />
                  }
                  label="Cluster Markers"
                />
              </Stack>
            </Box>
          </Stack>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
}
