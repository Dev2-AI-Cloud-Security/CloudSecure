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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user || !user.id || user.id.length !== 24) {
        console.error('Invalid token or user ID format:', user?.id);
        setError('Invalid token or user ID format.');
        setLoading(false);
        return;
      }

      try {
        // Fetch all data in parallel
        const [ec2Data, threatsData, resolvedIssuesData, riskLevelsData, alertsData] = await Promise.all([
          api.getEc2Instances(user.id),
          api.getThreats(),
          api.getResolvedIssues(),
          api.getRiskLevels(),
          api.getAlerts(),
        ]);

        // Process EC2 Instances
        if (ec2Data.message) {
          setEc2Instances([]); // No instances found
        } else {
          setEc2Instances(ec2Data);
        }

        // Process Threats
        setThreats(
          threatsData.map((item) => ({
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            count: item.count,
          }))
        );

        // Process Resolved Issues
        setResolvedIssues(
          resolvedIssuesData.map((item, index) => ({
            name: `Q${index + 1}`,
            resolved: item.count,
          }))
        );

        // Process Risk Levels
        setRiskLevels(
          riskLevelsData.map((item) => ({
            name: item.level,
            value: item.count,
          }))
        );

        // Process Alerts
        setAlerts(
          alertsData.map((alert) => ({
            incident: alert.incident,
            status: alert.status,
          }))
        );
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
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
              {ec2Instances.length === 0 ? (
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
                    <ThreatInsights data={threats} />
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