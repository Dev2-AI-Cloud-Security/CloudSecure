import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3031';
const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${baseURL}/api/stats`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats.');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: '#f5f5f5',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: '#e3f2fd',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: '#ffffff',
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}
          >
            CloudSecure Stats
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: '#f1f8e9',
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {stats.totalUsers}
            </Typography>
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: '#e3f2fd',
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Active EC2 Instances
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {stats.totalActiveInstances}
            </Typography>
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: '#ffecb3',
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Lifetime EC2 Instances managed
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {stats.totalEc2Instances}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StatsPage;