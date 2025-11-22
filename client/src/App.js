import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Assuming you have a Navbar component
import { CartProvider } from './contexts/CartContext'; // Assuming you have a CartProvider
import ScentFinder from './pages/ScentFinder';
// ... other imports for other pages

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* ... other routes ... */}
          <Route path="/find-your-scent" element={<ScentFinder />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;