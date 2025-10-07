import React from "react";
import { useCart } from "./CartContext";
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

  if (!cart.length) {
    return <div style={{ padding: 20 }}>🛒 Your cart is empty.</div>;
  }

  return (
    <div style={{ padding: 20, background: "#f9fafb", borderTop: "1px solid #ddd" }}>
      <h2>🛒 Cart</h2>
      {cart.map(item => (
        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span>{item.name} x {item.quantity}</span>
          <span>₦{(item.price * item.quantity).toLocaleString()}</span>
          <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 8, color: "red", border: "none", cursor: "pointer" }}>Remove</button>
        </div>
      ))}
      <h3>Total: ₦{total.toLocaleString()}</h3>
      <button onClick={checkout} style={{ background: "#2f855a", color: "white", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" }}>
        ✅ Checkout
      </button>
    </div>
  );
}