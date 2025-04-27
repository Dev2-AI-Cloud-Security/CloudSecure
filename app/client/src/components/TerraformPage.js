import React, { useState, useEffect } from 'react';
import Layout from './TerraformLayout';
import TerraformForm from './TerraformForm';
import { api } from '../config/api';
import { Box, Typography, Button, CircularProgress, Backdrop } from '@mui/material';

function TerraformPage() {
  const [ec2Instances, setEc2Instances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // Track delete operation
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

  const handleDeleteInstance = async () => {
    setIsDeleting(true); // Show progress circle
    try {
      const response = await fetch('http://localhost:3031/api/delete-ec2-instance', {
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

      // Clear all instances from the state
      setEc2Instances([]);
    } catch (err) {
      console.error('Error deleting EC2 instances:', err.message);
    } finally {
      setIsDeleting(false); // Hide progress circle
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