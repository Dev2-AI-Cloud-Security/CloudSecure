// src/components/ThreatInsights.js
import { Card, CardContent, Typography } from '@mui/material';

const ThreatInsights = () => {
  return (
    <Card sx={{ backgroundColor: '#e0f7fa', borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Threat Insights
        </Typography>
        <Typography variant="body2">
          AI-driven analytics on potential risks.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ThreatInsights;