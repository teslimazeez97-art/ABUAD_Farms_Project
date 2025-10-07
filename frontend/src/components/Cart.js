import React from "react";
import { useCart } from "../CartContext";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  async function checkout() {
    try {
      const order = {
        customer_name: "Test User",
        customer_email: "test@example.com",
        items: cart.map(c => ({
          product_id: c.id,
          quantity: c.quantity,
          unit_price: c.price
        })),
        total_amount: total
      };
      const res = await axios.post(`${API}/api/orders`, order);
      alert("Order placed! ID: " + res.data.order_id);
      clearCart();
    } catch (err) {
      alert("Checkout failed: " + err.message);
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: 300,
      background: "#fff",
      borderLeft: "1px solid #ccc",
      height: "100vh",
      padding: 16,
      overflowY: "auto",
      boxShadow: "-2px 0 6px rgba(0,0,0,0.1)"
    }}>
      <h2>🛒 Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} style={{ marginBottom: 10, padding: 8, border: "1px solid #eee", borderRadius: 4 }}>
              <strong>{item.name}</strong>
              <br />
              Qty: {item.quantity} × ₦{Number(item.price).toLocaleString()}
              <br />
              <strong>₦{(item.price * item.quantity).toLocaleString()}</strong>
              <br />
              <button 
                onClick={() => removeFromCart(item.id)} 
                style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginTop: 4 }}
              >
                🗑 Remove
              </button>
            </div>
          ))}
          <hr />
          <h3>Total: ₦{total.toLocaleString()}</h3>
          <button
            onClick={checkout}
            style={{
              padding: "10px 16px",
              background: "#2f855a",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              width: "100%",
              fontSize: 16
            }}
          >
            ✅ Checkout
          </button>
        </>
      )}
    </div>
  );
}