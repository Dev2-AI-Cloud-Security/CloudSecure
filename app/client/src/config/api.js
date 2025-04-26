import axios from 'axios';

// Base configuration for API requests
export const apiConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3031',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Utility function to create API requests with axios
export const createApiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${apiConfig.baseURL}${endpoint}`,
      headers: {
        ...apiConfig.headers, // Include default headers
      },
      withCredentials: true, // Include cookies if needed (e.g., for sessions)
    };

    // Add Authorization header if a token is provided
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add data for POST/PUT requests
    if (data) {
      config.data = data;
    }

    const response = await axios(config);

    return response.data; // Return the response data
  } catch (error) {
    // Handle HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 || status === 403) {
        // Handle token expiration or invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login');
      }
      throw new Error(data.message || `HTTP error! status: ${status}`);
    } else {
      console.error(`API request failed for ${endpoint}:`, error.message);
      throw new Error(error.message || 'Network error');
    }
  }
};

// API methods for interacting with the backend
export const api = {
  // Auth endpoints
  register: (userData) => createApiRequest('/api/register', 'POST', userData),
  login: (credentials) => createApiRequest('/api/login', 'POST', credentials),

  // Health check
  checkHealth: () => createApiRequest('/health'),

  // Protected endpoints (require JWT token)
  getThreats: (token) => createApiRequest('/api/threats', 'GET', null, token),
  getResolvedIssues: (token) => createApiRequest('/api/resolved-issues', 'GET', null, token),
  getRiskLevels: (token) => createApiRequest('/api/risk-levels', 'GET', null, token),
  getAlerts: (token) => createApiRequest('/api/alerts', 'GET', null, token),
};