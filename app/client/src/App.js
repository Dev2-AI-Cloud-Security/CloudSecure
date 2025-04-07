import * as React from 'react';
import {useState} from 'react';
import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import HomeIcon from '@mui/icons-material/Home';
import SecurityIcon from '@mui/icons-material/Security';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
// import UserManagement from './components/UserManagement/UserManagement.';
import Logo from './assets/brand_logo.webp';
const TerraformForm = lazy(() => import('./components/TerraformPage'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const ThreatMonitoring = lazy(() => import('./components/ThreatMain.js'));
const UserManagement = lazy(() => import('./components/UserManagement/layout.js'));
const LoginPage = lazy(() => import('./components/LoginPage'));

const NAVIGATION = [
  {
    kind: 'header',
    title: 'AI in Cloud Security',
  },
  {
    segment: 'landing',
    title: 'Home Page',
    icon: <HomeIcon />,
  },
  {
    segment: 'threatdash',
    title: 'Threat Monitoring',
    icon: <SecurityIcon />,
  },
  {
    segment: 'infra',
    title: 'Infrastructure',
    icon: <ComputerIcon />,
  },
  {
    segment: 'users',
    title: 'User Management',
    icon: <PeopleIcon />,
  }
 
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }) {
  let Component;

  switch (pathname) {
    case '/landing':
      Component = LandingPage;
      break;
    case '/threatdash':
      Component = ThreatMonitoring;
      break;
    case '/users':
      Component = UserManagement;
      break;
    case '/infra':
      Component = TerraformForm;
      break;
    case '/login':
      Component = LoginPage;
      break;
    default:
      Component = () => (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>Page Not Found</h2>
        </div>
      );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function AppLayout(props) {
  const { window } = props;
  const router = useDemoRouter('/landing');
  const demoWindow = window !== undefined ? window() : undefined;
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const sendMessage = async () => {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (!message) return;
    setMessages((prev) => [...prev, { sender: "You", text: message }]);
    input.value = "";

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "Bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "Error contacting chatbot server." },
      ]);
      console.error("Chatbot error:", error);
    }
  };

  

  return (
    <AppProvider
      branding={{
        logo: <img src={Logo} alt="Cloud secure" />,
        title: 'CloudSecure',
        homeUrl: '/',
      }}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
      <>
    {/* Floating Chatbot */}
    <div
    id="chatbot-toggle"
    onClick={toggleChat}
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      color: "#1976d3",
      cursor: "pointer"
      // background: "#007bff",
      // color: "white",
      // padding: "10px",
      // borderRadius: "50%",
      // cursor: "pointer",
      // zIndex: 1000,
    }}
  >
    <SmartToyIcon fontSize={'large'}/>
  </div>
  {showChat && (
    <div
      id="chatbot-container"
      style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        width: "300px",
        maxHeight: "400px",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "10px",
        overflow: "auto",
        zIndex: 1000,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        id="chatbox"
        style={{ height: "300px", overflowY: "scroll", marginBottom: "10px" }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "5px" }}>
        <input
          type="text"
          id="userInput"
          placeholder="Ask something..."
          style={{ flex: 1 }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )}
  </>
    </AppProvider>
  

  );
}

AppLayout.propTypes = {
  window: PropTypes.func,
};

export default AppLayout;
