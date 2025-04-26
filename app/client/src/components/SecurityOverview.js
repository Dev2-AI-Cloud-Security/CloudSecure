import { Grid, Card, CardContent, Typography } from '@mui/material';
import ActiveThreatsChart from './ActiveThreatsChart';
import ResolvedIssuesChart from './ResolvedIssuesChart';
import RiskLevelsChart from './RiskLevelsChart';

const SecurityOverview = ({ threats, resolvedIssues, riskLevels }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: '#e0f7fa', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Threats
            </Typography>
            <ActiveThreatsChart data={threats} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: '#e0f7fa', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resolved Issues
            </Typography>
            <ResolvedIssuesChart data={resolvedIssues} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: '#e0f7fa', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Risk Levels
            </Typography>
            <RiskLevelsChart data={riskLevels} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SecurityOverview;