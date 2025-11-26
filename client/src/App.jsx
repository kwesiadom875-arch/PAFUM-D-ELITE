import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin.jsx';
import Profile from './components/Profile';
import ScentFinder from './pages/ScentFinder';
import Auth from './pages/Auth';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Reviews from './pages/Reviews';
import RequestScent from './pages/RequestScent';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AnimatePresence } from 'framer-motion';

function App() {
  const location = useLocation();

  return (
    <CartProvider>
      <Navbar />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{ backgroundColor: '#1a1a1a', color: '#fcfcfc', border: '1px solid #333' }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/find-your-scent" element={<ScentFinder />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/request" element={<RequestScent />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </AnimatePresence>
    </CartProvider>
  );
}

export default App;