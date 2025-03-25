import * as React from 'react';
import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
// import UserManagement from './components/UserManagement/UserManagement.';
import Logo from './assets/brand_logo.webp';
const LandingPage = lazy(() => import('./components/LandingPage'));
const ThreatMonitoring = lazy(() => import('./components/ThreatDash'));
const UserManagement = lazy(() => import('./components/UserManagement/UserManagement.tsx'));

const NAVIGATION = [
  {
    kind: 'header',
    title: 'AI in Cloud Security',
  },
  {
    segment: 'landing',
    title: 'Home Page',
    icon: <DashboardIcon />,
  },
  {
    segment: 'threatdash',
    title: 'Threat Monitoring',
    icon: <DashboardIcon />,
  },
  {
    segment: 'infra',
    title: 'Infrastructure',
    icon: <DashboardIcon />,
  },
  {
    segment: 'users',
    title: 'User Management',
    icon: <DashboardIcon />,
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
  const router = useDemoRouter('/dashboard');
  const demoWindow = window !== undefined ? window() : undefined;

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
    </AppProvider>
  );
}

AppLayout.propTypes = {
  window: PropTypes.func,
};

export default AppLayout;
