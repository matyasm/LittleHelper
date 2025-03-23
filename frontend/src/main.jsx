// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5001'; // Adjust to your backend URL
console.log('Axios baseURL configured:', axios.defaults.baseURL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);