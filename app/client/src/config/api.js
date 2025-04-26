
// Base configuration for API requests
export const apiConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3031',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Utility function to create API requests with fetch
export const createApiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  try {
    const config = {
      method,
      headers: {
        ...apiConfig.headers, // Include default headers
      },
      credentials: 'include', // Include cookies if needed (e.g., for sessions)
      mode: 'cors', // Enable CORS
    };

    // Add Authorization header if a token is provided
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body for POST/PUT requests
    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${apiConfig.baseURL}${endpoint}`, config);

    // Handle non-JSON responses (e.g., server errors)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Unexpected response format: ${response.statusText}`);
    }

    const responseData = await response.json();

    // Check for HTTP errors (e.g., 401, 403, 500)
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Handle token expiration or invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login');
      }
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    throw error;
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