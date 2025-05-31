import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Dynamic backend URL based on environment
const getBackendURL = () => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  // Production environment
  return 'https://signguide-backend-xhsq.onrender.com';
};

// Set axios defaults
axios.defaults.baseURL = getBackendURL();
axios.defaults.withCredentials = true;

// Optional: Log the backend URL for debugging
console.log('Backend URL:', axios.defaults.baseURL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)