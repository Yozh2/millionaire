import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Handle GitHub Pages 404 redirect
const redirectPath = sessionStorage.getItem('redirectPath');
if (redirectPath) {
  sessionStorage.removeItem('redirectPath');
  // Remove the base path prefix if present
  const cleanPath = redirectPath.replace(/^\/millionaire/, '');
  if (cleanPath && cleanPath !== '/') {
    window.history.replaceState(null, '', '/millionaire' + cleanPath);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/millionaire">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
