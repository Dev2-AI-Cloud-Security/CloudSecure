import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./LoginPage.css";


function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmitLogin = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post('http://localhost:5000/login', { username, password });
          localStorage.setItem('token', response.data.token);
          alert('Logged in successfully. Redirecting to landing page');
          navigate('/LandingPage');
        } catch (error) {
          alert(error.response.data.message);
        }
      };
  
      const handleSubmitRegister = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post('http://localhost:5000/register', { username, password });
          localStorage.setItem('token', response.data.token);
          alert('Registration is successfull. \n You can now login');
        } catch (error) {
          alert(error.response.data.message);
        }
      };
  return (
    <><div className="login-container">
      <div className="login-card">
        <div className="login-title">Login</div>
        <div className="login-form">
          <div className="form-group">
            <div className="form-label">Email / Username</div>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <div className="form-label">Password</div>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="mfa-option">
            <div className="mfa-toggle">on</div>
            <div className="mfa-text">
              Enable Multi-Factor Authentication (MFA)
            </div>
          </div>
          <button onClick={handleSubmitLogin} className="login-button">Login</button>
          <button onClick={handleSubmitRegister} className="register-button">Register</button>
          <div className="forgot-password">Forgot Password?</div>
          <div className="role-section">
            <div className="role-title">Role-based Access</div>
            <div className="role-list">
              <div>Admin</div>
              <div>Security Analyst</div>
              <div>User Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* <form onSubmit={handleSubmit}>
             <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
             <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
             <button type="submit">Login</button>
    </form> */}
    </>
  );
}

export default LoginPage;
