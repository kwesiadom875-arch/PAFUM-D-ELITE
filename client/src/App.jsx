import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import CompareTray from './components/compare/CompareTray';
import ScrollToTop from './components/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from 'framer-motion';
import Footer from './components/Footer';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const OlfactoryMap = lazy(() => import('./pages/OlfactoryMap'));
const Cart = lazy(() => import('./pages/Cart'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./pages/Profile'));
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
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const DriverDashboard = lazy(() => import('./pages/DriverDashboard'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const About = lazy(() => import('./pages/About'));

import LoadingScreen from './components/stitch/LoadingScreen';

// Loading Fallback
const PageLoader = LoadingScreen;

function App() {
  const location = useLocation();

  return (
    <CartProvider>
      <CompareProvider>
        <ScrollToTop />
        {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/profile') && !location.pathname.startsWith('/cart') && !location.pathname.startsWith('/checkout') && <Navbar />}
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
              <Route path="/about" element={<About />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/olfactory-map" element={<OlfactoryMap />} />
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Delivery Tracker */}
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/track-order/:orderId" element={<TrackOrder />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />

              {/* Static Info Pages */}
              <Route path="/contact" element={
                <Suspense fallback={<PageLoader />}>
                  <InfoPage title="Contact Us">
                    <p>We are here to assist you with any inquiries.</p>
                    <h3>Concierge Service</h3>
                    <p>Email: concierge@parfumdellite.com<br />Phone: +33 1 40 00 00 00</p>
                    <h3>Hours</h3>
                    <p>Monday - Friday: 9am - 6pm CET</p>
                  </InfoPage>
                </Suspense>
              } />
              <Route path="/shipping" element={
                <Suspense fallback={<PageLoader />}>
                  <InfoPage title="Shipping Information">
                    <p>We offer complimentary worldwide shipping on all orders over €200.</p>
                    <h3>Delivery Times</h3>
                    <ul>
                      <li>Europe: 2-4 Business Days</li>
                      <li>USA & Canada: 3-5 Business Days</li>
                      <li>Rest of World: 5-7 Business Days</li>
                    </ul>
                    <p>All shipments are fully insured and require a signature upon delivery.</p>
                  </InfoPage>
                </Suspense>
              } />
              <Route path="/returns" element={
                <Suspense fallback={<PageLoader />}>
                  <InfoPage title="Returns & Exchanges">
                    <p>We accept returns of unopened products within 30 days of purchase.</p>
                    <p>Due to the nature of our products, we cannot accept returns of opened fragrances unless they are defective.</p>
                    <p>Please contact our concierge to initiate a return.</p>
                  </InfoPage>
                </Suspense>
              } />
              <Route path="/faq" element={
                <Suspense fallback={<PageLoader />}>
                  <InfoPage title="Frequently Asked Questions">
                    <h3>Are your products authentic?</h3>
                    <p>Yes, we are an authorized retailer for all brands we carry. Every bottle is sourced directly from the maison.</p>
                    <h3>Do you offer samples?</h3>
                    <p>Yes, every order comes with 2 complimentary samples of your choice.</p>
                  </InfoPage>
                </Suspense>
              } />
              <Route path="/size-guide" element={
                <Suspense fallback={<PageLoader />}>
                  <InfoPage title="Size Guide">
                    <p>Our fragrances are available in the following standard sizes:</p>
                    <ul>
                      <li><strong>50ml (1.7 fl oz)</strong>: Perfect for travel or discovering a new scent.</li>
                      <li><strong>100ml (3.4 fl oz)</strong>: The standard size for your signature scent.</li>
                      <li><strong>250ml (8.4 fl oz)</strong>: A grand flacon for the true connoisseur.</li>
                    </ul>
                  </InfoPage>
                </Suspense>
              } />
            </Routes>
          </Suspense>
        </AnimatePresence>
        {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/profile') && !location.pathname.startsWith('/cart') && !location.pathname.startsWith('/checkout') && <Footer />}
      </CompareProvider>
    </CartProvider>
  );
}

export default App;