import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
} from '@mui/material';

const drawerWidth = 240;

const UserManagement = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [contactDetails, setContactDetails] = useState('');

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    // Add logic to handle password change
    alert('Password changed successfully!');
  };

  const handleDeleteAccount = () => {
    // Add logic to handle account deletion
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmDelete) {
      alert('Account deleted successfully!');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      <Typography variant="h5">User Management</Typography>
      <Divider />

      {/* Change Password Section */}
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleChangePassword}
      >
        Change Password
      </Button>

      <Divider />

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

      <Divider />

      {/* Contact Details Section */}
      <Typography variant="h6">Contact Details</Typography>
      <TextField
        label="Contact Details"
        fullWidth
        value={contactDetails}
        onChange={(e) => setContactDetails(e.target.value)}
      />

      <Divider />

      {/* Delete Account Section */}
      <Typography variant="h6" color="error">
        Danger Zone
      </Typography>
      <Button
        variant="contained"
        color="error"
        onClick={handleDeleteAccount}
      >
        Delete Account
      </Button>
    </Box>
  );
};

export default UserManagement;