import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { api } from '../config/api';
import ThreatVisualizationChart from './ThreatVisualizationChart';
import LogsEventAnalysis from './LogsEventAnalysis';

const ThreatDashboard = () => {
  const [threats, setThreats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        // Fetch threats and alerts concurrently
        const [threatsData, alertsData] = await Promise.all([
          api.getThreats(token).catch(() => []),
          api.getAlerts(token).catch(() => []),
        ]);

        // Set threats data
        setThreats(
          Array.isArray(threatsData)
            ? threatsData.map(item => ({
                timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                count: item.count,
              }))
            : []
        );

        // Set alerts data
        setAlerts(
          Array.isArray(alertsData)
            ? alertsData.map((item, index) => ({
                id: index + 1,
                message: `Event ${index + 1}: ${item.incident} (${item.status})`,
              }))
            : []
        );
      } catch (err) {
        setError('Failed to fetch data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Threat Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Real-time Threat Visualization */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Real-time Threat Visualization
              </Typography>
              <ThreatVisualizationChart data={threats} />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                AI-powered charts on attack vectors.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Logs & Event Analysis */}
        <Grid item xs={12} md={4}>
          <LogsEventAnalysis events={alerts} />
        </Grid>
      </Grid>
    </div>
  );
};

export default ThreatDashboard;