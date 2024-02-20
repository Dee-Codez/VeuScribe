import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import { SocketProvider } from './utils/SocketProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_REACT_APP_GOOGLE_API_TOKEN}>
    <Router>
      <SocketProvider>
        <App /> 
      </SocketProvider>
    </Router>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
