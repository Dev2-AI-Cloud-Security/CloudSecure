import { Card, CardContent, Typography, TextField, List, ListItem, ListItemText, Tooltip, CircularProgress } from '@mui/material';
import React, { useState } from 'react';
import axios from 'axios';

const LogsEventAnalysis = ({ events }) => {
  // Ensure events is an array, default to [] if undefined
  const safeEvents = Array.isArray(events) ? events : [];
  const [filter, setFilter] = useState('');
  const [suggestions, setSuggestions] = useState({}); // Cache for AI suggestions
  const [loadingSuggestion, setLoadingSuggestion] = useState({}); // Loading state for each event

  // Filter events based on the filter input
  const filteredEvents = safeEvents.filter(event =>
    event.message.toLowerCase().includes(filter.toLowerCase())
  );

  // Function to fetch AI suggestion from Google Generative AI API
  const fetchAISuggestion = async (eventMessage, eventId) => {
    // Check if suggestion is already cached
    if (suggestions[eventId]) {
      return;
    }

    setLoadingSuggestion(prev => ({ ...prev, [eventId]: true }));

    try {
      const apiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('Google AI API key is not set in environment variables');
      }

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
        {
          contents: [
            {
              parts: [
                {
                  text: `Provide a concise suggestion for handling the following security event in a web application: "${eventMessage}".`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: apiKey,
          },
        }
      );

      const suggestion = response.data.candidates[0]?.content?.parts[0]?.text || 'No suggestion available';
      setSuggestions(prev => ({ ...prev, [eventId]: suggestion }));
    } catch (error) {
      console.error('Error fetching AI suggestion:', error);
      setSuggestions(prev => ({ ...prev, [eventId]: 'Failed to fetch suggestion' }));
    } finally {
      setLoadingSuggestion(prev => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Logs & Event Analysis
        </Typography>
        <TextField
          fullWidth
          placeholder="Filter logs..."
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mb: 2 }}
        />
        <List>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <Tooltip
                key={event.id}
                title={
                  loadingSuggestion[event.id] ? (
                    <CircularProgress size={20} />
                  ) : (
                    suggestions[event.id] || 'Fetching suggestion...'
                  )
                }
                onOpen={() => fetchAISuggestion(event.message, event.id)}
                arrow
                placement="right"
              >
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText primary={event.message} />
                </ListItem>
              </Tooltip>
            ))
          ) : (
            <ListItem>
              <ListItemText primary={filter ? "No events match the filter" : "No events available"} />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default LogsEventAnalysis;