import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import CompareTray from './components/compare/CompareTray';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from 'framer-motion';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./components/Profile')); // Note: Profile was imported from components in original file
const ScentFinder = lazy(() => import('./pages/ScentFinder'));
const Auth = lazy(() => import('./pages/Auth'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Reviews = lazy(() => import('./pages/Reviews'));
const RequestScent = lazy(() => import('./pages/RequestScent'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ClimateTests = lazy(() => import('./pages/ClimateTests'));
const ComparePage = lazy(() => import('./pages/ComparePage'));

// Loading Fallback
const PageLoader = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8f9fa',
    color: '#C5A059',
    fontSize: '1.2rem',
    fontWeight: '500'
  }}>
    Loading Parfum D'Elite...
  </div>
);

function App() {
  const location = useLocation();

  return (
    <CartProvider>
      <CompareProvider>
        <Navbar />
        <CompareTray />
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
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/climate-tests" element={<ClimateTests />} />
              <Route path="/compare" element={<ComparePage />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </CompareProvider>
    </CartProvider>
  );
}

export default App;