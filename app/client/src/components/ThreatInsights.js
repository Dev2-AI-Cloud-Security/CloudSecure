import { Typography, Box, Card, CardContent } from '@mui/material';

const ThreatInsights = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Threat Insights
        </Typography>
        <Typography variant="body1" color="textSecondary">
          No threat data available to display insights.
        </Typography>
      </Box>
    );
  }

  // Calculate insights
  const totalThreats = data.reduce((sum, threat) => sum + threat.count, 0);
  const averageThreats = (totalThreats / data.length).toFixed(2);
  const maxThreat = Math.max(...data.map((threat) => threat.count));
  const minThreat = Math.min(...data.map((threat) => threat.count));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Threat Insights
      </Typography>
      <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="body1">
            <strong>Total Threats:</strong> {totalThreats}
          </Typography>
          <Typography variant="body1">
            <strong>Average Threats:</strong> {averageThreats}
          </Typography>
          <Typography variant="body1">
            <strong>Highest Threat Count:</strong> {maxThreat}
          </Typography>
          <Typography variant="body1">
            <strong>Lowest Threat Count:</strong> {minThreat}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ThreatInsights;