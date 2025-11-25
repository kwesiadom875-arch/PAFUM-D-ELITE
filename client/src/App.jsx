import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin.jsx';
import Profile from './components/Profile';
import ScentFinder from './pages/ScentFinder';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Reviews from './pages/Reviews';
import RequestScent from './pages/RequestScent';
import Checkout from './pages/Checkout';

function App() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/find-your-scent" element={<ScentFinder />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/request" element={<RequestScent />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </CartProvider>
  );
}

export default App;