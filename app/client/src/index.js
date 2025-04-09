import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import LoginPage from './components/LoginPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <Router>
  <React.StrictMode>
    <Routes> 
    <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<App />} />
        <Route path="/" element={<LoginPage />} />
    </Routes>
    
  </React.StrictMode>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
