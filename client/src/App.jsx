import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

// IMPORT THE NEW HOME PAGE
import Home from './pages/Home';

import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin.jsx';
import Profile from './components/Profile';
import ScentFinder from './pages/ScentFinder';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup';
import Auth from './pages/Auth';

function App() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        {/* USE THE NEW HOME COMPONENT HERE 👇 */}
        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/find-your-scent" element={<ScentFinder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </CartProvider>
  );
}

export default App;