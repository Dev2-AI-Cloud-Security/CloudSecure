import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import StatsPage from './components/StatsPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <React.StrictMode>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<ProtectedRoute element={App} />} />
        <Route path="/" element={<ProtectedRoute element={App} />} />
        <Route path="/stats" element={<StatsPage />} /> {/* Public Stats Page */}
      </Routes>
    </React.StrictMode>
  </Router>
);

reportWebVitals();