// App.js
import React from "react";
//import Login from "./components/Login";
// import Register from "./components/Register";
import LoginPage from "./components/LoginPage";
import LandingPage from "./components/LandingPage";
import ThreatDash  from "./components/ThreatDash";

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      {/* <nav>
        <ul>
          <li>
            <Link to="/">LoginPage</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav> */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> */}
        <Route path="/landingPage" element={<LandingPage />} />
        <Route path="/threatDash" element={<ThreatDash />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
