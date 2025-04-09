import React, { useState, useEffect } from 'react';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import { api } from '../config/api';
import SecurityOverview from './SecurityOverview';
import AlertsPanel from './AlertsPanel';
import ThreatInsights from './ThreatInsights';

function LandingPage() {
  const [threats, setThreats] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [riskLevels, setRiskLevels] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (token) {
      // Fetch Threats
      api.getThreats(token)
        .then(data => {
          setThreats(data.map(item => ({
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            count: item.count,
          })));
        })
        .catch(err => console.error('Error fetching threats:', err));

      // Fetch Resolved Issues
      api.getResolvedIssues(token)
        .then(data => {
          setResolvedIssues(data.map((item, index) => ({
            name: `Q${index + 1}`,
            resolved: item.count,
          })));
        })
        .catch(err => console.error('Error fetching resolved issues:', err));

      // Fetch Risk Levels
      api.getRiskLevels(token)
        .then(data => {
          setRiskLevels(data.map(item => ({
            name: item.level,
            value: item.count,
          })));
        })
        .catch(err => console.error('Error fetching risk levels:', err));

      // Fetch Alerts
      api.getAlerts(token)
        .then(data => {
          setAlerts(data.map((item, index) => ({
            id: index + 1,
            message: `${item.incident}: ${item.status}`,
            details: `Incident detected: ${item.incident}`,
          })));
        })
        .catch(err => console.error('Error fetching alerts:', err));
    }
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
        <Box sx={{ mb: 4 }}>
          <SecurityOverview threats={threats} resolvedIssues={resolvedIssues} riskLevels={riskLevels} />
        </Box>
        <Box sx={{ mb: 4 }}>
          <AlertsPanel alerts={alerts} />
        </Box>
        <Box>
          <ThreatInsights />
        </Box>
      </Container>
    </div>
  );
}

export default LandingPage;