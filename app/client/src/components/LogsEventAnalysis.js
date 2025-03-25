// src/components/LogsEventAnalysis.js
import { Card, CardContent, Typography, TextField, List, ListItem, ListItemText } from '@mui/material';

const events = [
  'Event 1: Suspicious login attempt',
  'Event 2: Malware detected',
  'Event 3: Unauthorized access',
  'Event 4: Phishing attempt',
  'Event 5: Data exfiltration',
];

const LogsEventAnalysis = () => {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Logs & Event Analysis
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Filter logs..."
          sx={{ mb: 2 }}
        />
        <List>
          {events.map((event, index) => (
            <ListItem key={index} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
              <ListItemText primary={event} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default LogsEventAnalysis;