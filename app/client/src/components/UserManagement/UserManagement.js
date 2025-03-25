// src/components/Layout.js
import { useState } from 'react';
import {
  Box,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;