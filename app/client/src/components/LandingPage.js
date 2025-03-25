import React, { useState } from "react";

import "./LandingPage.css";

function LandingPage() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const threatData = {
    "Active Threats": [
      "Malware detected on Server 3",
      "Unauthorized access attempt",
      "Phishing attack detected",
    ],
    "Resolved Issues": [
      "Firewall misconfiguration fixed",
      "Access control policy updated",
    ],
    "Risk Levels": [
      "High risk: 2 threats",
      "Medium risk: 3 vulnerabilities",
      "Low risk: 5 minor issues",
    ],
  };

  const alerts = [
    { id: 1, message: "Incident 1: Ongoing", details: "DDoS attack detected on server." },
    { id: 2, message: "Incident 2: Resolved", details: "Phishing email blocked by security filters." },
    { id: 3, message: "Incident 3: Ongoing", details: "Unauthorized login attempt from unknown location." },
  ];

  return (
    <div className="landing-container" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="main-content" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="page-title" style={{ color: "#4682B4" }}>Security Status Overview</div>
        <div className="status-cards">
          {Object.keys(threatData).map((category) => (
            <div
              key={category}
              className="status-card"
              style={{ backgroundColor: "#ADD8E6", color: "black" }}
              onClick={() => setSelectedCard(category)}
            >
              <div className="card-title">{category}</div>
            </div>
          ))}
        </div>
        <div className="alerts-section">
          <div className="alerts-panel" style={{ backgroundColor: "#F5F5F5", color: "#4682B4" }}>
            <div className="panel-title">Alerts Panel</div>
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="alert-item"
                  style={{ backgroundColor: "#FFFFFF", color: "#4682B4", border: "1px solid #ADD8E6", padding: "10px", margin: "5px 0" }}
                  onClick={() => setSelectedAlert(alert)}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="insights-panel" style={{ backgroundColor: "#B0E0E6", color: "black" }}>
          <div className="panel-title">Threat Insights</div>
          <div className="insights-content">AI-driven analytics on potential risks.</div>
        </div>
        {selectedCard && (
          <div className="modal" style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
            <div className="modal-content" style={{ backgroundColor: "#B0E0E6", color: "black" }}>
              <h2>{selectedCard}</h2>
              <ul>
                {threatData[selectedCard].map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <button className="back-button" style={{ backgroundColor: "#4682B4", color: "white" }} onClick={() => setSelectedCard(null)}>
                Back
              </button>
            </div>
          </div>
        )}
        {selectedAlert && (
          <div className="alert-modal-container" style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
            <div className="alert-modal" style={{ backgroundColor: "#B0E0E6", color: "black", marginTop: "20px" }}>
              <h2>{selectedAlert.message}</h2>
              <p>{selectedAlert.details}</p>
              <button className="back-button" style={{ backgroundColor: "#4682B4", color: "white" }} onClick={() => setSelectedAlert(null)}>
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;