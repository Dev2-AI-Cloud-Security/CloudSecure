// src/components/UserManagement.js
import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';

const initialUsers = [
  { id: 1, username: 'user1', email: 'user1@example.com', role: 'Admin' },
  { id: 2, username: 'user2', email: 'user2@example.com', role: 'User' },
  { id: 3, username: 'user3', email: 'user3@example.com', role: 'Security Analyst' },
];

const activityLogs = [
  'User1 logged in',
  'User2 updated profile',
  'User3 accessed sensitive data',
  'User1 logged out',
];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState('');

  const roles = ['Admin', 'User', 'Security Analyst'];

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleRoleChange = () => {
    if (!selectedUser || !newRole) return;
    setUsers(
      users.map((user) =>
        user.username === selectedUser ? { ...user, role: newRole } : user
      )
    );
    setSelectedUser('');
    setNewRole('');
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        User Management & Access Control
      </Typography>

      {/* User List */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User List
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role-based Permissions */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Role-based Permissions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select a user</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select a user"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.username}>
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Assign Role</InputLabel>
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                label="Assign Role"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRoleChange}
              disabled={!selectedUser || !newRole}
            >
              Assign Role
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Logs
          </Typography>
          <List>
            {activityLogs.map((log, index) => (
              <ListItem key={index} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                <ListItemText primary={log} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;