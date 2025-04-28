import axios from 'axios';

// Base configuration for API requests
export const apiConfig = {
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Utility function to create API requests with axios
export const createApiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${apiConfig.baseURL}${endpoint}`,
      headers: {
        ...apiConfig.headers, // Include default headers
      },
      withCredentials: true, // Include cookies if needed (optional)
    };

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

  // Public endpoints (no authentication required)
  getThreats: () => createApiRequest('/api/threats', 'GET'),
  getResolvedIssues: () => createApiRequest('/api/resolved-issues', 'GET'),
  getRiskLevels: () => createApiRequest('/api/risk-levels', 'GET'),
  getAlerts: () => createApiRequest('/api/alerts', 'GET'),
  getEc2Instances: (userId) =>
    createApiRequest(`/api/ec2-instances?userId=${userId}`, 'GET'),
  deleteEc2Instance: (instanceId) =>
    createApiRequest(`/api/ec2-instances/${instanceId}`, 'DELETE'),
  addEc2Instance: (userId, instanceConfig) =>
    createApiRequest(`/api/ec2-instances?userId=${userId}`, 'POST', instanceConfig),
  initializeCloudWatch: (options = {}) =>
    createApiRequest(`/api/initialize-cloudwatch`, 'POST', options)
};