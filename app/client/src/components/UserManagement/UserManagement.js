import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
} from '@mui/material';

const UserManagement = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);

  useEffect(() => {
    // Fetch user details from the backend
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user')); // Get user details from localStorage
        const userId = user?.id; // Extract userId

        if (!userId) {
          alert('User ID is missing. Please log in again.');
          return;
        }

        const response = await fetch(`http://localhost:3031/api/user/${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Include token for authentication
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user details.');
        }

        const data = await response.json();
        setAddress(data.address || ''); // Populate address field
        setContactDetails(data.contactDetails || ''); // Populate contact details field
        setIsGoogleLogin(data.isGoogleLogin || false); // Set Google login status
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert(error.message || 'Failed to fetch user details.');
      }
    };

    fetchUserDetails();
  }, []);

  const handleUpdateUserDetails = async () => {
    const updates = {};

    // Add only modified fields to the updates object
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      updates.password = newPassword;
    } else if (newPassword || confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }

    if (address) {
      updates.address = address;
    }

    if (contactDetails) {
      updates.contactDetails = contactDetails;
    }

    if (Object.keys(updates).length === 0) {
      alert('No changes to update.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user')); // Get user details from localStorage
      const userId = user?.id; // Extract userId

      if (!userId) {
        alert('User ID is missing. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:3031/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include token for authentication
        },
        body: JSON.stringify({ userId, ...updates }), // Send userId along with updates
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user details.');
      }

      alert('User details updated successfully!');
    } catch (error) {
      console.error('Error updating user details:', error);
      alert(error.message || 'Failed to update user details.');
    }
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmDelete) {
      alert('Account deleted successfully!');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      <Typography variant="h5">User Management</Typography>
      <Divider />

      {/* Change Password Section */}
      {!isGoogleLogin && (
        <>
          <Typography variant="h6">Change Password</Typography>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </>
      )}

      {/* Address Section */}
      <Typography variant="h6">Address</Typography>
      <TextField
        label="Address"
        multiline
        rows={3}
        fullWidth
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* Contact Details Section */}
      <Typography variant="h6">Contact Details</Typography>
      <TextField
        label="Contact Details"
        fullWidth
        value={contactDetails}
        onChange={(e) => setContactDetails(e.target.value)}
      />

      <Button variant="contained" color="primary" onClick={handleUpdateUserDetails}>
        Save Changes
      </Button>

      <Divider />

      {/* Delete Account Section */}
      <Typography variant="h6" color="error">
        Danger Zone
      </Typography>
      <Button variant="contained" color="error" onClick={handleDeleteAccount}>
        Delete Account
      </Button>
    </Box>
  );
};

export default UserManagement;