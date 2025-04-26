import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
import ActiveThreatsChart from './ActiveThreatsChart';
import ResolvedIssuesChart from './ResolvedIssuesChart';
import RiskLevelsChart from './RiskLevelsChart';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { useAwsCredentials } from './AwsCredentialsContext';

const SecurityOverview = ({ threats, resolvedIssues, riskLevels }) => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { awsCredentials } = useAwsCredentials();

  // Initialize the EC2 client with credentials from context
  const client = new EC2Client({
    region: 'us-east-1', // Replace with your region
    credentials: {
      accessKeyId: awsCredentials.accessKeyId || '',
      secretAccessKey: awsCredentials.secretAccessKey || '',
    },
  });

  // Fetch running EC2 instances when the component mounts or credentials change
  useEffect(() => {
    const fetchInstances = async () => {
      // Skip fetching if credentials are not provided
      if (!awsCredentials.accessKeyId || !awsCredentials.secretAccessKey) {
        setLoading(false);
        setInstances([]);
        return;
      }

      try {
        const command = new DescribeInstancesCommand({
          Filters: [
            {
              Name: 'instance-state-name',
              Values: ['running'], // Only fetch running instances
            },
          ],
        });
        const response = await client.send(command);
        const instanceList = response.Reservations?.flatMap(res => res.Instances) || [];
        setInstances(instanceList);
      } catch (error) {
        console.error('Error fetching EC2 instances:', error);
        setInstances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, [awsCredentials]); // Re-fetch when credentials change

  // Navigate to Infrastructure page to create a new instance
  const handleCreateInstance = () => {
    return navigate('/infra'); 
  };

  return (
    <Grid container spacing={3}>
      {instances.length > 0 &&
        <>
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
        </>
      }

      {/* AWS Instances Section */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#e0f7fa', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AWS EC2 Instances
            </Typography>
            {loading ? (
              <Typography>Loading instances...</Typography>
            ) : instances.length > 0 ? (
              <div>
                {instances.map((instance) => (
                  <Typography key={instance.InstanceId}>
                    Instance ID: {instance.InstanceId} | Type: {instance.InstanceType} | State: {instance.State.Name}
                  </Typography>
                ))}
              </div>
            ) : (
              <div>
                <Typography>No running EC2 instances found.</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateInstance}
                  sx={{ mt: 2 }}
                >
                  Create New Instance
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SecurityOverview;