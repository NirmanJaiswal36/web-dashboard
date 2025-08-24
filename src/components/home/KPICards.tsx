'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Icon,
  Skeleton
} from '@mui/material';
import {
  Pets as PetsIcon,
  LocalHospital as MedicalIcon,
  TrendingUp as TrendingIcon,
  Place as LocationIcon
} from '@mui/icons-material';
import { MapFilters } from './HomeDashboard';
import { MapData } from '@/hooks/useMapData';

interface KPICardsProps {
  data?: MapData;
  isLoading: boolean;
  filters: MapFilters;
}

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  progress?: number;
  isLoading?: boolean;
}

function KPICard({ title, value, subtitle, icon, color, progress, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <Box sx={{ mr: 1, opacity: 0.5 }}>{icon}</Box>
            <Skeleton width={100} />
          </Box>
          <Skeleton width={60} height={32} />
          <Skeleton width={80} />
          {progress !== undefined && <Skeleton width="100%" height={6} sx={{ mt: 1 }} />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Box 
            sx={{ 
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
        
        <Typography variant="h4" component="div" fontWeight="bold" mb={0.5}>
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        
        {progress !== undefined && (
          <Box mt={1}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={color}
              sx={{ borderRadius: 1, height: 6 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function KPICards({ data, isLoading, filters }: KPICardsProps) {
  const statistics = data?.statistics;
  
  // Calculate completion percentage
  const completionRate = statistics ? 
    Math.round((statistics.sterilized / statistics.total_sightings) * 100) : 0;
  
  // Calculate active rate
  const activeRate = statistics ? 
    Math.round((statistics.active / statistics.total_sightings) * 100) : 0;

  const kpis = [
    {
      title: 'Total Sightings',
      value: statistics?.total_sightings || 0,
      subtitle: `in selected timeframe`,
      icon: <PetsIcon />,
      color: 'primary' as const
    },
    {
      title: 'Sterilized',
      value: statistics?.sterilized || 0,
      subtitle: `${completionRate}% completion rate`,
      icon: <MedicalIcon />,
      color: 'success' as const,
      progress: completionRate
    },
    {
      title: 'Active Cases',
      value: statistics?.active || 0,
      subtitle: `${activeRate}% of total`,
      icon: <TrendingIcon />,
      color: 'warning' as const,
      progress: activeRate
    },
    {
      title: 'Hotspots',
      value: statistics?.hotspots?.length || 0,
      subtitle: 'High activity areas',
      icon: <LocationIcon />,
      color: 'error' as const
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Key Metrics
      </Typography>
      
      <Grid container spacing={2}>
        {kpis.map((kpi, index) => (
          <Grid size={{ xs: 6, sm: 3 }} key={index}>
            <KPICard {...kpi} isLoading={isLoading} />
          </Grid>
        ))}
      </Grid>

      {/* Map Legend */}
      <Box mt={3}>
        <Typography variant="subtitle2" gutterBottom>
          Map Legend
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip 
            size="small" 
            label="Active" 
            color="warning" 
            variant="outlined"
          />
          <Chip 
            size="small" 
            label="Sterilized" 
            color="success" 
            variant="outlined"
          />
          <Chip 
            size="small" 
            label="Emergency" 
            color="error" 
            variant="outlined"
          />
          {filters.showHeatmap && (
            <Chip 
              size="small" 
              label="Heat Intensity" 
              color="primary" 
              variant="outlined"
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
}
