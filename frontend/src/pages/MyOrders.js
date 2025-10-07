import React, { useEffect, useState, useCallback } from "react";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchMyOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444"
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h2 style={{ color: "#2f855a" }}>My Orders</h2>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h2 style={{ color: "#2f855a" }}>My Orders</h2>
        <p style={{ color: "red" }}>Error: {error}</p>
        <p>Make sure your backend is running and you're logged in.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2 style={{ color: "#2f855a", marginBottom: 24 }}>My Orders</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 18, color: "#666", marginBottom: 16 }}>No orders yet.</p>
          <p style={{ color: "#999" }}>Place your first order to see it here!</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* Order Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20, color: "#1a202c" }}>
                    Order #{order.order_number?.split('-')[1] || order.id}
                  </h3>
                  <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 14 }}>
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span
                  style={{
                    background: getStatusColor(order.status),
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {order.status}
                </span>
              </div>

              {/* Order Total */}
              <div style={{ borderTop: "2px solid #2f855a", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
                    {order.item_count || 0} items
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#2f855a" }}>
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}