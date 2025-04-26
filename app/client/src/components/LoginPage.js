import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Use named import
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Handle login using backend
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3031/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Logged in successfully. Redirecting to landing page');
      navigate('/app');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed. Please try again.');
    }
  };

  // Handle registration using backend
  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3031/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed. Please try again.');
      }

      alert('Registration successful. You can now login.');
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'Registration failed. Please try again.');
    }
  };

  // Handle Google login on the frontend
  const handleGoogleLoginSuccess = (credentialResponse) => {
    try {
      console.log('Google login response:', credentialResponse);

      // Decode the ID token to extract user information
      const decodedToken = jwtDecode(credentialResponse.credential);
      console.log('Decoded Google Token:', decodedToken);

      // Save user information in localStorage
      localStorage.setItem('token', credentialResponse.credential);
      localStorage.setItem('user', JSON.stringify(decodedToken));

      alert('Logged in successfully with Google. Redirecting to landing page');
      navigate('/app');
    } catch (error) {
      console.error('Error decoding Google token:', error);
      alert('Google login failed. Please try again.');
    }
  };

  return (
    
      <div className="login-container">
        <div className="login-card">
          <div className="login-title">CloudSecure</div>
          <div className="login-form">
            {/* Login Form */}
            <div className="form-group">
              <div className="form-label">Email / Username</div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <div className="form-label">Password</div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
            <button onClick={handleSubmitLogin} className="login-button">
              Login
            </button>
            <button onClick={handleSubmitRegister} className="register-button">
              Register
            </button>

            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            {/* Google Login */}
            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => {
                  console.error('Google login error');
                  alert('Google login failed. Please try again.');
                }}
              />
            </div>
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    
  );
}

export default LoginPage;