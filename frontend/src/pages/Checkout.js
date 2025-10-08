import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

function autoImageUrl(seed, w = 80, h = 80) {
  return `https://picsum.photos/seed/abuad-${seed}/${w}/${h}`;
}

export default function Checkout() {
  const { items, clearCart } = useCart(); // Changed from 'cart' to 'items'
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [serverReceipt, setServerReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const total = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
  const deliveryFee = total > 10000 ? 0 : 1500;
  const finalTotal = total + deliveryFee;

  // Handle order placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerInfo,
          items: items,
          total: finalTotal,
        }),
      });

      if (data.success) {
        setOrderPlaced(true);
        setServerReceipt(data);
        clearCart();
      } else {
        alert("Order failed, please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error - Order placed locally for demo");
      // Demo fallback
      setOrderPlaced(true);
      setServerReceipt({
        order_number: `ABUAD-${Date.now()}`,
        created_at: new Date().toISOString(),
        success: true
      });
      clearCart();
    } finally {
      setLoading(false);
    }
  };

  // ✅ SHOW RECEIPT PAGE
  if (orderPlaced && serverReceipt) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f9fafb",
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 600,
            width: "100%",
            background: "#fff",
            borderRadius: 16,
            padding: 40,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            textAlign: "center",
            border: "3px solid #10b981",
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
          <h1 style={{ color: "#10b981", marginBottom: 20, fontSize: 32 }}>Order Confirmed!</h1>

          <div style={{ 
            background: '#f0fdf4', 
            padding: 20, 
            borderRadius: 12, 
            marginBottom: 30,
            border: '1px solid #bbf7d0'
          }}>
            <p style={{ fontSize: 18, color: "#374151", marginBottom: 10 }}>
              Thank you <strong>{customerInfo.name}</strong>!
            </p>
            <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 15 }}>
              Your order <strong style={{ color: '#2f855a' }}>{serverReceipt.order_number}</strong> has been placed successfully.
            </p>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              Order Date: {new Date(serverReceipt.created_at).toLocaleString()}
            </p>
          </div>

          <div style={{ 
            background: '#2f855a', 
            color: 'white', 
            padding: 15, 
            borderRadius: 8, 
            marginBottom: 30 
          }}>
            <p style={{ fontSize: 20, fontWeight: "bold", margin: 0 }}>
              Total Paid: NGN {finalTotal.toLocaleString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate("/products")}
              style={{
                background: "#2f855a",
                color: "#fff",
                padding: "14px 28px",
                borderRadius: 8,
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                fontSize: 16,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#047857'}
              onMouseOut={(e) => e.target.style.background = '#2f855a'}
            >
              🌱 Continue Shopping
            </button>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "white",
                color: "#2f855a",
                border: "2px solid #2f855a",
                padding: "14px 28px",
                borderRadius: 8,
                fontWeight: "600",
                cursor: "pointer",
                fontSize: 16,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#2f855a';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#2f855a';
              }}
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ IF CART EMPTY
  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: 'center',
          padding: 20
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
        <h2 style={{ color: '#6b7280', marginBottom: 10 }}>Your cart is empty</h2>
        <p style={{ color: '#9ca3af', marginBottom: 30 }}>Add some fresh products to get started!</p>
        <button
          onClick={() => navigate("/products")}
          style={{
            background: "#2f855a",
            color: "white",
            padding: "14px 28px",
            borderRadius: 8,
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: 16,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#047857'}
          onMouseOut={(e) => e.target.style.background = '#2f855a'}
        >
          🌱 Shop Products
        </button>
      </div>
    );
  }

  // ✅ CHECKOUT FORM
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", marginBottom: 40, color: "#2f855a", fontSize: 32 }}>
        Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40 }}>
        {/* Customer Info Form */}
        <div>
          <h3 style={{ color: '#374151', marginBottom: 20 }}>Shipping Information</h3>
          <form onSubmit={handlePlaceOrder}>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                  required
                  placeholder="Enter your full name"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    borderRadius: 8, 
                    border: "1px solid #d1d5db",
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2f855a'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                  required
                  placeholder="your.email@example.com"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    borderRadius: 8, 
                    border: "1px solid #d1d5db",
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2f855a'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                  required
                  placeholder="08012345678"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    borderRadius: 8, 
                    border: "1px solid #d1d5db",
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2f855a'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Delivery Address *
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, address: e.target.value })
                  }
                  required
                  rows={4}
                  placeholder="Enter your complete delivery address including landmarks"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    borderRadius: 8, 
                    border: "1px solid #d1d5db",
                    fontSize: '16px',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2f855a'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 30,
                width: "100%",
                background: loading ? "#9ca3af" : "#2f855a",
                color: "white",
                padding: 16,
                borderRadius: 8,
                border: "none",
                fontSize: 18,
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = '#047857';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.backgroundColor = '#2f855a';
              }}
            >
              {loading ? 'Processing...' : `Place Order - NGN ${finalTotal.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <h3 style={{ color: '#374151', marginBottom: 20 }}>Order Summary</h3>
          <div
            style={{
              backgroundColor: '#f9fafb',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              position: 'sticky',
              top: 20
            }}
          >
            <div style={{ marginBottom: 20 }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottom: idx < items.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <img
                    src={item.image_url || autoImageUrl(item.id)}
                    alt={item.name}
                    style={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: 6, 
                      objectFit: 'cover',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: 14, marginBottom: 4 }}>
                      {item.name}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>
                      {item.quantity} × NGN {Number(item.price).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#2f855a' }}>
                    NGN {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              paddingTop: 20,
              borderTop: '2px solid #2f855a'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 16
              }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '600' }}>NGN {total.toLocaleString()}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: 16,
                fontSize: 16
              }}>
                <span>Delivery Fee:</span>
                <span style={{ fontWeight: '600', color: deliveryFee === 0 ? '#10b981' : '#374151' }}>
                  {deliveryFee === 0 ? 'FREE' : `NGN ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              {deliveryFee === 0 && (
                <div style={{ 
                  fontSize: 12, 
                  color: '#10b981', 
                  marginBottom: 16,
                  fontWeight: '500'
                }}>
                  Free delivery on orders over NGN 10,000
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: 20, 
                fontWeight: 800, 
                color: '#2f855a',
                paddingTop: 16,
                borderTop: '1px solid #e5e7eb'
              }}>
                <span>Total:</span>
                <span>NGN {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}