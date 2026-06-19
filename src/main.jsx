import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { FinanzasProvider } from './context/FinanzasContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FinanzasProvider>
        <App />
      </FinanzasProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
