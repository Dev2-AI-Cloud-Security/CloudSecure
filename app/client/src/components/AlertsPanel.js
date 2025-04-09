import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const AlertsPanel = ({ alerts }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Alerts Panel
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Incident</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map(alert => (
              <TableRow key={alert.id}>
                <TableCell>{alert.message}</TableCell>
                <TableCell>{alert.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AlertsPanel;