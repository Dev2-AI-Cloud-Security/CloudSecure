import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { api } from '../config/api';
import ThreatVisualizationChart from './ThreatVisualizationChart'; // Import Threat Visualization Chart
import LogsEventAnalysis from './LogsEventAnalysis'; // Import Logs Event Analysis

const ThreatDashboard = () => {
  const [ec2Instances, setEc2Instances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [threatData, setThreatData] = useState([]); // Data for Threat Visualization Chart
  const [logEvents, setLogEvents] = useState([]); // Ensure it's initialized as an empty array

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user')); // Retrieve user from localStorage
  const userId = user?.id; // Extract userId

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is missing or invalid.');
        setLoading(false);
        return;
      }

      try {
        // Fetch EC2 Instances
        const ec2Data = await api.getEc2Instances(user.id);

        if (!ec2Data || ec2Data.length === 0) {
          console.log('No EC2 instances found for the user:', user.id);
          setEc2Instances([]); // No instances found
        } else {
          // Process EC2 Instances
        
          console.log('EC2 Instances:', ec2Data);
          setEc2Instances(ec2Data);

          // Fetch Threat Data
          const threatResponse = await api.getThreats();
          console.log('Threat Data:', threatResponse);
          setThreatData(threatResponse);

          // Fetch Log Events
          const logResponse = await api.getAlerts();
          console.log('Log Events:', logResponse);
          setLogEvents(logResponse);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

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
        {/* EC2 Instances */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                EC2 Instances
              </Typography>
              {ec2Instances.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  No EC2 instances found. Add a new instance from the Infrastructure page.
                </Typography>
              ) : (
                <ul>
                  {ec2Instances.map((instance, index) => (
                    <li key={index}>
                      <Typography variant="body1">
                        Instance ID: "{instance.instanceId}", Name: {instance.name}
                      </Typography>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Render Threat Visualization and Logs if EC2 instances are found */}
        {ec2Instances.length > 0 && (
          <>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Threat Visualization
                  </Typography>
                  <ThreatVisualizationChart data={threatData} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Logs & Event Analysis
                  </Typography>
                  <LogsEventAnalysis events={logEvents} />
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
};

export default ThreatDashboard;