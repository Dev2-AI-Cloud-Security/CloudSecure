// Layout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Layout({ children }) {
    const navigate = useNavigate();
  return (
    <div>
      {/* Common div element */}
      <div className="sidebar" style={{ backgroundColor: "#B0E0E6", color: "black" }}>
        <div className="sidebar-title">AI in Cloud Security</div>
        <div className="sidebar-menu">
          <div className="sidebar-menu-item" onClick={() => navigate('/threatdash')}>Threat Monitoring</div>
          <div className="sidebar-menu-item" onClick={() => navigate('/infra')}>Infrastructure</div>
          <div className="sidebar-menu-item" onClick={() => navigate('/users')}>User Management</div>
          <div className="sidebar-menu-item">Settings</div>
        </div>
      </div>
    </div>
  );
}

export default Layout;