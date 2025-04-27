import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const AlertsPanel = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        No alerts available.
      </Typography>
    );
  }

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Alerts Panel
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Incident</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((alert, index) => (
            <TableRow key={index}>
              <TableCell>{alert.incident}</TableCell>
              <TableCell>{alert.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AlertsPanel;