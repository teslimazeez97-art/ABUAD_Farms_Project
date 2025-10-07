import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import MyOrders from './pages/MyOrders';
import Checkout from './pages/Checkout';        // Add this import

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <CartModal />

        <main style={{ minHeight: '80vh', paddingTop: '80px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />    {/* Add this route */}
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="admin">
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute requiredRole="admin">
                  <Orders />
                </PrivateRoute>
              }
            />
            
            {/* Customer Routes */}
            <Route
              path="/my-orders"
              element={
                <PrivateRoute>
                  <MyOrders />
                </PrivateRoute>
              }
            />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div style={{ 
                textAlign: "center", 
                padding: "4rem 2rem",
                color: "#666"
              }}>
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;