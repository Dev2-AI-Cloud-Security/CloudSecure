import React, { useState } from "react";
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import SecurityOverview from './SecurityOverview';
import AlertsPanel from './AlertsPanel';
import ThreatInsights from './ThreatInsights';
import "./LandingPage.css";

function LandingPage() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const threatData = {
    "Active Threats": [
      "Malware detected on Server 3",
      "Unauthorized access attempt",
      "Phishing attack detected",
    ],
    "Resolved Issues": [
      "Firewall misconfiguration fixed",
      "Access control policy updated",
    ],
    "Risk Levels": [
      "High risk: 2 threats",
      "Medium risk: 3 vulnerabilities",
      "Low risk: 5 minor issues",
    ],
  };

  const alerts = [
    { id: 1, message: "Incident 1: Ongoing", details: "DDoS attack detected on server." },
    { id: 2, message: "Incident 2: Resolved", details: "Phishing email blocked by security filters." },
    { id: 3, message: "Incident 3: Ongoing", details: "Unauthorized login attempt from unknown location." },
  ];

  return (
    <div>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Security Status Overview
        </Typography>
        <Box sx={{ mb: 4 }}>
          <SecurityOverview />
        </Box>
        <Box sx={{ mb: 4 }}>
          <AlertsPanel />
        </Box>
        <Box>
          <ThreatInsights />
        </Box>
      </Container>
    </div>
  );
}

export default LandingPage;