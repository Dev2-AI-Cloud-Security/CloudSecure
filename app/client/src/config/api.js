const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const createApiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      headers: apiConfig.headers,
      credentials: 'include',
      mode: 'cors'
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${apiConfig.baseURL}${endpoint}`, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  // Auth endpoints
  register: (userData) => createApiRequest('/register', 'POST', userData),
  login: (credentials) => createApiRequest('/login', 'POST', credentials),
  
  // Health check
  checkHealth: () => createApiRequest('/health')
}; 