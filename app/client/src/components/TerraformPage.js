import React, { useState, useEffect } from 'react';
import Layout from './TerraformLayout';
import TerraformForm from './TerraformForm';
import { api } from '../config/api';
import { Box, Typography, Button, CircularProgress } from '@mui/material';

function TerraformPage() {
  const [ec2Instances, setEc2Instances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user ID from localStorage
  const user = JSON.parse(localStorage.getItem('user')); // Parse user details from localStorage
  const userId = user?.id; // Extract user ID

  useEffect(() => {
    const fetchEc2Instances = async () => {
      if (!userId) {
        console.error('User ID is missing or invalid:', userId); // Debug log
        setError('User ID is missing or invalid.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.getEc2Instances(userId); // Fetch EC2 instances
        if (response.message) {
          setEc2Instances([]); // No instances found
        } else {
          setEc2Instances(response);
        }
      } catch (err) {
        setError('Failed to fetch EC2 instances: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEc2Instances();
  }, [userId]); // Use userId as the dependency instead of the entire user object

  const handleDeleteInstance = async (instanceId) => {
    try {
      await api.deleteEc2Instance(instanceId); // Call API to delete the instance
      setEc2Instances((prev) => prev.filter((instance) => instance.instanceId !== instanceId)); // Update state
    } catch (err) {
      console.error('Failed to delete EC2 instance:', err.message);
    }
  };

  const handleAddInstance = async (instanceConfig) => {
    try {
      const newInstance = await api.addEc2Instance(userId, instanceConfig); // Call API to add the instance
      setEc2Instances((prev) => [...prev, newInstance]); // Update state with the new instance
    } catch (err) {
      console.error('Failed to add EC2 instance:', err.message);
    }
  };

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
    <Layout>
      {ec2Instances.length === 0 ? (
        // Display Terraform configuration form if no EC2 instances are present
        <TerraformForm onSubmit={handleAddInstance} />
      ) : (
        // Display EC2 instance details and delete button
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            EC2 Instances
          </Typography>
          <ul>
            {ec2Instances.map((instance) => (
              <li key={instance.instanceId}>
                <Typography variant="body1">
                  Instance ID: {instance.instanceId}, Name: {instance.name}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteInstance(instance.instanceId)}
                  sx={{ mt: 1 }}
                >
                  Delete Instance
                </Button>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Layout>
  );
}

export default TerraformPage;