// src/components/AlertsPanel.js
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const alerts = [
  { id: 1, incident: 'Incident 1', status: 'Ongoing' },
  { id: 2, incident: 'Incident 2', status: 'Resolved' },
  { id: 3, incident: 'Incident 3', status: 'Ongoing' },
];

const AlertsPanel = () => {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
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
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{alert.incident}</TableCell>
                <TableCell>{alert.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;