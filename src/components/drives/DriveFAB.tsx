// src/components/drives/DriveFAB.tsx
'use client';

import { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { AddLocationAlt as AddLocationAltIcon } from '@mui/icons-material';
import CreateDriveDrawer from './CreateDriveDrawer';

export default function DriveFAB() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Tooltip title="Start a Drive" placement="left">
        <Fab
          color="primary"
          aria-label="start a drive"
          onClick={() => setIsDrawerOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            borderRadius: '50%',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            }
          }}
        >
          <AddLocationAltIcon />
        </Fab>
      </Tooltip>

      <CreateDriveDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
