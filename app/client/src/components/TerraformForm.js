// src/components/TerraformForm.js
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Backdrop } from '@mui/material'; // Import Backdrop
import { api } from '../config/api';

import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Box,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const TerraformForm = () => {
  const [formData, setFormData] = useState({
    region: 'us-east-1',
    instanceType: 't2.micro',
    ami: 'ami-0c55b159cbfafe1f0', // Example AMI for Amazon Linux 2 in us-east-1
    instanceName: 'my-ec2-instance',
    s3BucketName: '',
    createS3: false,
  });

  const [terraformConfig, setTerraformConfig] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false); // State to track deployment progress

  const regions = [
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'eu-west-1',
    'eu-central-1',
  ];

  const instanceTypes = [
    't2.micro',
    't2.small',
    't2.medium',
    't3.micro',
    't3.small',
    't3.medium',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleS3 = (e) => {
    setFormData((prev) => ({ ...prev, createS3: e.target.value === 'yes' }));
  };

  const generateTerraformConfig = async () => {
    const { region, instanceType, ami, instanceName, s3BucketName, createS3 } = formData;

try {
      const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
      if (!user || !user.id) {
        alert('User ID is missing. Cannot generate Terraform configuration.');
        return;
      }

      // Fetch AWS credentials from the backend
      const response = await fetch(`http://localhost:3031/api/user/${user.id}`, {
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

      if (!awsAccessKeyId || !awsSecretAccessKey) {
        alert('AWS credentials are missing. Please update your AWS credentials in the User Management section.');
        return;
      }

      // Generate Terraform configuration
    let config = `
provider "aws" {
  region     = "${region}"
access_key = "${awsAccessKeyId}"
  secret_key = "${awsSecretAccessKey}"
}

# EC2 Instance
resource "aws_instance" "${instanceName}" {
  ami           = "${ami}"
  instance_type = "${instanceType}"
  tags = {
    Name = "${instanceName}"
  }
}
`;

    if (createS3 && s3BucketName) {
      config += `
# S3 Bucket
resource "aws_s3_bucket" "my_bucket" {
  bucket = "${s3BucketName}"
  acl    = "private"

  tags = {
    Name = "${s3BucketName}"
  }
}
`;
    }

    setTerraformConfig(config);
    setOpenSnackbar(true);

    // Save the configuration to the backend
      const saveResponse = await fetch('http://localhost:3031/save-terraform-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id, // Include userId in the request
          config,
        }),
      });

      if (saveResponse.ok) {
        alert('Terraform configuration saved on the server successfully!');
      } else {
        alert('Failed to save Terraform configuration on the server.');
      }
    } catch (error) {
      console.error('Error generating Terraform config:', error);
      alert(error.message || 'Failed to generate Terraform configuration.');
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
      if (!user || !user.id) {
        alert('User ID is missing. Cannot deploy Terraform configuration.');
        setIsDeploying(false);
        return;
      }

      const response = await fetch('http://localhost:3031/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id, // Pass userId in the request body
        }),
      });

      if (response.ok) {
        alert('Terraform deployment completed successfully!');

        // Add EC2 configuration to the user database
        const { instanceName, instanceType, region, ami } = formData;
        const ec2Config = {
          instanceId: instanceName, // Use instanceName as a placeholder for instanceId
          name: instanceName,
          type: instanceType,
          region,
          ami,
          state: 'running', // Add the `state` field
        };
        await api.initializeCloudWatch();
        const saveResponse = await fetch(`http://localhost:3031/api/ec2-instances?userId=${user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ec2Config),
        });

        if (saveResponse.ok) {
          alert('EC2 configuration saved to the user database successfully!');
        } else {
          alert('Failed to save EC2 configuration to the user database.');
        }
      } else {
        alert('Failed to deploy Terraform configuration.');
      }
    } catch (error) {
      console.error('Error deploying Terraform:', error);
      alert('An error occurred while deploying Terraform.');
    } finally {
      setIsDeploying(false); // Hide progress indicator
    }
  };

  return (
    <div>
      <Backdrop open={isDeploying} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h4" gutterBottom>
        Infrastructure Deployment
      </Typography>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Launch AWS Resources with Terraform
          </Typography>
          <Grid container spacing={3}>
            {/* EC2 Configuration */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                EC2 Instance Configuration
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  label="Region"
                >
                  {regions.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Instance Type</InputLabel>
                <Select
                  name="instanceType"
                  value={formData.instanceType}
                  onChange={handleChange}
                  label="Instance Type"
                >
                  {instanceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="AMI ID"
                name="ami"
                value={formData.ami}
                onChange={handleChange}
                helperText="Enter a valid AMI ID for the selected region"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instance Name"
                name="instanceName"
                value={formData.instanceName}
                onChange={handleChange}
              />
            </Grid>

            {/* S3 Configuration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Additional Services (Optional)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Create S3 Bucket</InputLabel>
                <Select
                  name="createS3"
                  value={formData.createS3 ? 'yes' : 'no'}
                  onChange={handleToggleS3}
                  label="Create S3 Bucket"
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.createS3 && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="S3 Bucket Name"
                  name="s3BucketName"
                  value={formData.s3BucketName}
                  onChange={handleChange}
                  helperText="Bucket name must be globally unique"
                />
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={generateTerraformConfig}
                >
                  Generate Terraform Config
                </Button>
                {terraformConfig && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDeploy}
                    disabled={isDeploying}
                  >
                    Deploy with Terraform
                  </Button>
                )}
                {/* Circular Progress */}
                {isDeploying && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: 2,
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </Grid>
                )}
              </Box>
            </Grid>

            {/* Terraform Configuration Output */}
            {terraformConfig && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Generated Terraform Configuration
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                >
                  {terraformConfig}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3030}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Terraform configuration generated successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TerraformForm;