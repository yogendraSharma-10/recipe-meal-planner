import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18+
import App from './App';
import './styles/main.css'; // Global styles for the application

/**
 * The main entry point for the React application.
 *
 * This file initializes the React application by rendering the root `App` component
 * into the DOM element with the ID 'root' in `public/index.html`.
 *
 * It uses `ReactDOM.createRoot` for React 18+ concurrent mode features,
 * and wraps the `App` component in `React.StrictMode` for development-time
 * checks and warnings.
 */

// Get the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');

// Create a React root using the new React 18 API.
// This enables concurrent features and improved performance.
const root = ReactDOM.createRoot(rootElement);

// Render the main App component into the root.
// React.StrictMode is a tool for highlighting potential problems in an application.
// It activates additional checks and warnings for its descendants.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);