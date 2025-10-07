import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { getCartItemsCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const linkStyle = (path) => ({
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 6,
    fontWeight: 600,
    color: location.pathname === path ? "#fff" : "rgba(255,255,255,0.85)",
    background: location.pathname === path ? "#2563eb" : "transparent",
    transition: "0.2s",
  });

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "#2f855a",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo on the left */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#fff",
            fontWeight: 800,
            fontSize: 20,
          }}
        >
          ABUAD Farms
        </Link>

        {/* Nav + Auth + Cart pushed to the right */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link to="/" style={linkStyle("/")}>Home</Link>
            <Link to="/products" style={linkStyle("/products")}>Products</Link>
            <Link to="/about" style={linkStyle("/about")}>About</Link>
            
            {/* Show admin links only for admin users */}
            {isLoggedIn && user.role === 'admin' && (
              <>
                <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>
                <Link to="/orders" style={linkStyle("/orders")}>Orders</Link>
              </>
            )}

            {/* Show customer orders link for logged-in customers */}
            {isLoggedIn && user.role !== 'admin' && (
              <Link to="/my-orders" style={linkStyle("/my-orders")}>My Orders</Link>
            )}
          </nav>

          {/* Auth Section */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isLoggedIn ? (
              <>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                  Hello, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "rgba(255,255,255,0.85)",
                    padding: "4px 8px",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={linkStyle("/login")}>Login</Link>
                <Link to="/register" style={linkStyle("/register")}>Register</Link>
              </>
            )}
          </div>

          {/* Cart Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
            style={{
              position: "relative",
              background: "#fff",
              color: "#2f855a",
              border: "none",
              padding: "8px 14px",
              borderRadius: 9999,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontWeight: 700,
              gap: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            Cart
            <span
              style={{
                background: "#2f855a",
                color: "#fff",
                borderRadius: 9999,
                padding: "2px 8px",
                fontWeight: 800,
                minWidth: 22,
                textAlign: "center",
                fontSize: 13,
              }}
            >
              {getCartItemsCount()}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}