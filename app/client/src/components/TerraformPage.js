import React, { useState, useEffect } from 'react';
import Layout from './TerraformLayout';
import TerraformForm from './TerraformForm';
import { api } from '../config/api';
import { Box, Typography, Button, CircularProgress, Backdrop, Alert } from '@mui/material';
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3031';

function TerraformPage() {
  const [ec2Instances, setEc2Instances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // Track delete operation
  const [error, setError] = useState(null);
  const [awsCredentialsSet, setAwsCredentialsSet] = useState(false); // Track AWS credentials

  // Get user ID from localStorage
  const user = JSON.parse(localStorage.getItem('user')); // Parse user details from localStorage
  const userId = user?.id; // Extract user ID

  // Fetch EC2 instances from the backend
  const fetchEc2Instances = async () => {
    setLoading(true);
    try{
      const ec2Data = await api.getEc2Instances(user.id)

      if (!ec2Data || ec2Data.length === 0) {
        console.log('No EC2 instances found for the user:', user.id);
        setEc2Instances([]); // No instances found
      } else {
        setEc2Instances(ec2Data);
      } // Update state with fetched instances
    } catch (err) {
      console.error('Error fetching EC2 instances:', err.message);
      setError(err.message || 'Failed to fetch EC2 instances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAwsCredentials = async () => {
      if (!userId) {
        console.error('User ID is missing or invalid:', userId); // Debug log
        setError('User ID is missing or invalid.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${baseURL}/api/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch AWS credentials.');
        }

        const userData = await response.json();
        const { awsAccessKeyId, awsSecretAccessKey } = userData;

        if (awsAccessKeyId && awsSecretAccessKey) {
          setAwsCredentialsSet(true); // AWS credentials are set
          await fetchEc2Instances(); // Fetch EC2 instances after verifying credentials
        } else {
          setAwsCredentialsSet(false); // AWS credentials are missing
        }
      } catch (err) {
        console.error('Error fetching AWS credentials:', err.message);
        setAwsCredentialsSet(false); // Assume credentials are missing on error
      } finally {
        setLoading(false);
      }
    };

    fetchAwsCredentials();
  }, [userId]);

  const handleDeleteInstance = async () => {
    setIsDeleting(true); // Show progress circle
    try {
      const response = await fetch(`${baseURL}/api/delete-ec2-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete EC2 instances.');
      }

      const data = await response.json();
      console.log(data.message);

      // Fetch updated EC2 instances after deletion
      await fetchEc2Instances();
    } catch (err) {
      console.error('Error deleting EC2 instances:', err.message);
    } finally {
      setIsDeleting(false); // Hide progress circle
    }
  };

  const handleAddInstance = async (instanceConfig) => {
    try {
      const newInstance = await api.addEc2Instance(userId, instanceConfig); // Call API to add the instance
      console.log('New EC2 instance added:', newInstance); // Debug log

      // Fetch updated EC2 instances after adding a new instance
      await fetchEc2Instances();
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

  if (!awsCredentialsSet) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          AWS credentials are missing. Please set your AWS credentials in the User Management section.
        </Alert>
        <Typography variant="body1">
          Navigate to the <strong>User Management</strong> page to add your AWS credentials.
        </Typography>
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
      {/* Backdrop for delete operation */}
      <Backdrop open={isDeleting} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
              </li>
            ))}
          </ul>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteInstance}
            sx={{ mt: 2 }}
            disabled={isDeleting} // Disable button while deleting
          >
            Delete All Instances
          </Button>
        </Box>
      )}
    </Layout>
  );
}

export default TerraformPage;