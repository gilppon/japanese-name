/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const initialOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture",
};

const root = ReactDOM.createRoot(rootElement);
import { HelmetProvider } from 'react-helmet-async';

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <PayPalScriptProvider options={initialOptions}>
        <App />
      </PayPalScriptProvider>
    </HelmetProvider>
  </React.StrictMode>
);
