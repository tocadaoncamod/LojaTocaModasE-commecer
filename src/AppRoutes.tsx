import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
    </Routes>
  );
};

export default AppRoutes;
