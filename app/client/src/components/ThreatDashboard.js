// src/components/ThreatDashboard.js
import { Grid, Card, CardContent, Typography } from '@mui/material';
import ThreatVisualizationChart from './ThreatVisualizationChart';
import LogsEventAnalysis from './LogsEventAnalysis';

const ThreatDashboard = () => {
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
              <ThreatVisualizationChart />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                AI-powered charts on attack vectors.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Logs & Event Analysis */}
        <Grid item xs={12} md={4}>
          <LogsEventAnalysis />
        </Grid>
      </Grid>
    </div>
  );
};

export default ThreatDashboard;