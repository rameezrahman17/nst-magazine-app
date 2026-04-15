import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Disaster recovery: catch errors before React even starts
window.onerror = function(msg, url, lineNo, columnNo, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: white; background: #800; font-family: sans-serif;">
      <h1>Critical Launch Error</h1>
      <p>${msg}</p>
      <p>Source: ${url}:${lineNo}</p>
      <hr/>
      <p>Please check if all environment variables are set in Vercel.</p>
    </div>`;
  }
  return false;
};

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  document.getElementById('root').innerHTML = `<h1>Render Error: ${e.message}</h1>`;
}

