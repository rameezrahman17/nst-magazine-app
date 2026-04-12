import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import AdminPortal from './AdminPortal';
import './index.css';

function App() {
  return (
    <Router>
      <Analytics />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
