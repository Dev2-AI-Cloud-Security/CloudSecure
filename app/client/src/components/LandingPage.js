import React, { useState, useEffect } from 'react';
import { CssBaseline, Container, Typography, Box, Card, CardContent } from '@mui/material';
import { api } from '../config/api';
import SecurityOverview from './SecurityOverview';
import AlertsPanel from './AlertsPanel';
import ThreatInsights from './ThreatInsights';

function LandingPage() {
  const [threats, setThreats] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [riskLevels, setRiskLevels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [ec2Instances, setEc2Instances] = useState([]);
  const [loadingInstances, setLoadingInstances] = useState(true);

  // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (token && user) {
      if (!user.id || user.id.length !== 24) {
        console.error('Invalid user ID format:', user.id);
        return;
      }

      // Fetch EC2 Instances
      api.getEc2Instances(user.id) // Pass user ID to the API
        .then(data => {
          if (data.message) {
            setEc2Instances([]); // No instances found
          } else {
            setEc2Instances(data);
          }
        })
        .catch(err => console.error('Error fetching EC2 instances:', err))
        .finally(() => setLoadingInstances(false));

      // Fetch Threats
      api.getThreats()
        .then(data => {
          setThreats(data.map(item => ({
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            count: item.count,
          })));
        })
        .catch(err => console.error('Error fetching threats:', err));

      // Fetch Resolved Issues
      api.getResolvedIssues()
        .then(data => {
          setResolvedIssues(data.map((item, index) => ({
            name: `Q${index + 1}`,
            resolved: item.count,
          })));
        })
        .catch(err => console.error('Error fetching resolved issues:', err));

      // Fetch Risk Levels
      api.getRiskLevels()
        .then(data => {
          setRiskLevels(data.map(item => ({
            name: item.level,
            value: item.count,
          })));
        })
        .catch(err => console.error('Error fetching risk levels:', err));
    }
  }, [token, user]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.getAlerts(token);
        setAlerts(response);
      } catch (err) {
        console.error('Error fetching alerts:', err.message);
      }
    };

    const interval = setInterval(fetchAlerts, 60000); // Fetch alerts every 60 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [token]);

  return (
    <div>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Security Status Overview
        </Typography>
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.username}!
        </Typography>

        {/* EC2 Instances Section */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                EC2 Instances
              </Typography>
              {loadingInstances ? (
                <Typography variant="body1" color="textSecondary">
                  Loading EC2 instances...
                </Typography>
              ) : ec2Instances.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  No EC2 instances found. Add a new instance from the Infrastructure page.
                </Typography>
              ) : (
                <>
                  <ul>
                    {ec2Instances.map((instance, index) => (
                      <li key={index}>
                        <Typography variant="body1">
                          Instance ID: {instance.instanceId}, Name: {instance.name}
                        </Typography>
                      </li>
                    ))}
                  </ul>

                  {/* Render other components only if EC2 instances exist */}
                  <Box sx={{ mb: 4 }}>
                    <SecurityOverview threats={threats} resolvedIssues={resolvedIssues} riskLevels={riskLevels} />
                  </Box>
                  <Box sx={{ mb: 4 }}>
                    <AlertsPanel alerts={alerts} />
                  </Box>
                  <Box>
                    <ThreatInsights />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </div>
  );
}

export default LandingPage;