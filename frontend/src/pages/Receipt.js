import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function Receipt() {
  const location = useLocation();
  const { order } = location.state || {};

  if (!order) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h2>No order found</h2>
        <Link to="/products" style={{ color: "#2563eb" }}>
          Back to Products
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
      <h1 style={{ textAlign: "center", color: "#2f855a" }}>ABUAD Farms</h1>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>Order Receipt</h2>

      <div style={{ marginBottom: 16 }}>
        <strong>Order No:</strong> {order.orderNo}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Customer:</strong> {order.form.fullName}
        <br />
        <strong>Phone:</strong> {order.form.phone}
        <br />
        <strong>Address:</strong> {order.form.address}
        <br />
        {order.form.email && (
          <>
            <strong>Email:</strong> {order.form.email}
            <br />
          </>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #2f855a" }}>
            <th style={th}>Item</th>
            <th style={th}>Qty</th>
            <th style={th}>Price</th>
            <th style={th}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.cart.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={td}>{item.name}</td>
              <td style={td}>{item.quantity}</td>
              <td style={td}>NGN {Number(item.price).toLocaleString()}</td>
              <td style={td}>NGN {Number(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
          <tr>
            <td colSpan="3" style={{ ...td, textAlign: "right", fontWeight: "bold" }}>Subtotal</td>
            <td style={td}>NGN {Number(order.subtotal).toLocaleString()}</td>
          </tr>
          <tr>
            <td colSpan="3" style={{ ...td, textAlign: "right", fontWeight: "bold" }}>Delivery</td>
            <td style={td}>NGN {Number(order.delivery).toLocaleString()}</td>
          </tr>
          <tr style={{ borderTop: "2px solid #2f855a" }}>
            <td colSpan="3" style={{ ...td, textAlign: "right", fontWeight: "bold", fontSize: 16 }}>Total</td>
            <td style={{ ...td, fontWeight: "bold", fontSize: 16, color: "#2f855a" }}>
              NGN {Number(order.total).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {order.form.notes && (
        <div style={{ marginBottom: 20 }}>
          <strong>Notes:</strong> {order.form.notes}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        <button
          onClick={handlePrint}
          style={{
            padding: "10px 20px",
            background: "#2f855a",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🖨 Print Receipt
        </button>
        <Link
          to="/products"
          style={{
            padding: "10px 20px",
            background: "#f3f4f6",
            border: "1px solid #ddd",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
            color: "#111827",
          }}
        >
          🛍 Continue Shopping
        </Link>
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: 8,
  fontSize: 14,
  background: "#f3f4f6",
  borderBottom: "1px solid #ddd",
};

const td = {
  padding: 8,
  fontSize: 14,
};