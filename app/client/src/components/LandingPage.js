import React from "react";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="sidebar">
        <div className="sidebar-title">AI in cloud security</div>
        <div className="sidebar-menu">
          <div className="sidebar-menu-item">Threat Monitoring</div>
          <div className="sidebar-menu-item">Infrastructure</div>
          <div className="sidebar-menu-item">User Management</div>
          <div className="sidebar-menu-item">Settings</div>
        </div>
      </div>
      <div className="main-content">
        <div className="page-title">Security Status Overview</div>
        <div className="status-cards">
          <div className="status-card">
            <div className="card-title">Active Threats</div>
            <div className="card-content"></div>
          </div>
          <div className="status-card">
            <div className="card-title">Resolved Issues</div>
            <div className="card-content"></div>
          </div>
          <div className="status-card">
            <div className="card-title">Risk Levels</div>
            <div className="card-content"></div>
          </div>
        </div>
        <div className="alerts-panel">
          <div className="panel-title">Alerts Panel</div>
          <div className="alerts-list">
            <div className="alert-item">Incident 1: Ongoing</div>
            <div className="alert-item">Incident 2: Resolved</div>
            <div className="alert-item">Incident 3: Ongoing</div>
          </div>
        </div>
        <div className="insights-panel">
          <div className="panel-title">Threat Insights</div>
          <div className="insights-content">
            AI-driven analytics on potential risks.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
