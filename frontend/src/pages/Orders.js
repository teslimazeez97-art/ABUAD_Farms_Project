import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [updatingOrderIds, setUpdatingOrderIds] = useState([]);

  const toNum = (v) => {
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch('/api/orders');
      const list = (data.success && Array.isArray(data.orders)) ? data.orders : [];
      const processed = list.map((order) => {
        const items = (order.items || []).map((it) => ({
          ...it,
          quantity: toNum(it.quantity),
          price: toNum(it.price),
          total: toNum(it.quantity) * toNum(it.price),
        }));
        const itemTotal = items.reduce((s, it) => s + it.total, 0);
        const total = toNum(order.total_amount || order.total || itemTotal);
        return {
          ...order,
          items,
          total,
          item_count: items.length || toNum(order.item_count),
        };
      });

      setOrders(processed);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (updatingOrderIds.includes(orderId)) return;

    const prevOrders = [...orders];
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setUpdatingOrderIds((ids) => [...ids, orderId]);

    try {
      const data = await apiFetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Update with server response if available
      if (data && data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o)));
      }
      console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.message || "Failed to update order");
      setOrders(prevOrders);
      alert("Failed to update order status: " + (err.message || ""));
    } finally {
      setUpdatingOrderIds((ids) => ids.filter((id) => id !== orderId));
    }
  };

  const fetchOrderDetails = async (order) => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please login.");

      const id = order.id || order.order_number;
      const data = await apiFetch(`/api/orders/${id}`);

      // apiFetch returns data directly
      const orderData = data.success && data.order ? data.order : data;
      const items = (orderData.items || orderData.items_list || []).map((it) => ({
        ...it,
        quantity: toNum(it.quantity),
        price: toNum(it.price),
        total: toNum(it.quantity) * toNum(it.price),
      }));
      const processed = {
        ...orderData,
        items,
      };
      setSelectedOrder(processed);
      setShowOrderDetails(true);
      setDirty(false);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.message || "Failed to fetch order details");
      setSelectedOrder(order);
      setShowOrderDetails(true);
      setDirty(false);
    }
  };

  const saveSelectedOrder = async () => {
    if (!selectedOrder) return;
    setIsSaving(true);
    setError("");
    try {
      const data = await apiFetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedOrder.status,
        }),
      });

      // apiFetch returns data directly
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, ...(data.order || { status: selectedOrder.status }) } : o
        )
      );

      setDirty(false);
      alert("Order saved successfully.");
      // Refresh the orders list to ensure consistency
      fetchOrders();
    } catch (err) {
      console.error("Error saving order:", err);
      setError(err.message || "Failed to save order");
      alert("Failed to save order: " + (err.message || ""));
    } finally {
      setIsSaving(false);
    }
  };

  const cancelDetailChanges = () => {
    if (!selectedOrder) {
      setShowOrderDetails(false);
      return;
    }
    const original = orders.find((o) => o.id === selectedOrder.id);
    if (original) {
      setSelectedOrder(original);
    } else {
      setSelectedOrder(null);
      setShowOrderDetails(false);
    }
    setDirty(false);
  };

  const handleBackFromDetails = async () => {
    if (dirty) {
      const doSave = window.confirm("You have unsaved changes. Save before leaving?");
      if (doSave) {
        await saveSelectedOrder();
        setShowOrderDetails(false);
        return;
      }
    }
    setShowOrderDetails(false);
    setSelectedOrder(null);
    setDirty(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusBadge = (status) => ({
    backgroundColor: getStatusColor(status),
    color: "white",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "capitalize",
  });

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (order.customer_name || "").toLowerCase().includes(q) ||
      (order.order_number || "").toLowerCase().includes(q) ||
      (order.email || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    const num = toNum(amount);
    return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + toNum(o.total), 0),
    };
    return stats;
  };

  const getOrderNumberDisplay = (order) => {
    if (order.order_number && order.order_number.includes("-")) {
      return order.order_number.split("-")[1];
    }
    return order.id?.toString() || "N/A";
  };

  const stats = getOrderStats();

  if (showOrderDetails && selectedOrder) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <button
            onClick={handleBackFromDetails}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
            disabled={isSaving}
          >
            ← Back
          </button>

          <h1 style={{ color: "#2f855a", margin: 0 }}>
            Order Details - #{getOrderNumberDisplay(selectedOrder)}
          </h1>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={cancelDetailChanges}
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
              disabled={isSaving || !dirty}
            >
              Cancel
            </button>

            <button
              onClick={saveSelectedOrder}
              style={{
                backgroundColor: "#2f855a",
                color: "white",
                border: "none",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
              disabled={isSaving || !dirty}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1.5rem", maxWidth: 900 }}>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ color: "#2f855a", marginBottom: "1rem" }}>Order Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <strong>Order Number:</strong> {selectedOrder.order_number || `#${selectedOrder.id}`}
              </div>
              <div>
                <strong>Date:</strong> {formatDate(selectedOrder.created_at)}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    setSelectedOrder((s) => ({ ...s, status: e.target.value }));
                    setDirty(true);
                  }}
                  style={{
                    padding: "0.4rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span style={{ marginLeft: 8, ...getStatusBadge(selectedOrder.status) }}>{selectedOrder.status}</span>
              </div>
              <div>
                <strong>Total:</strong>{" "}
                <span style={{ color: "#2f855a", fontWeight: "700" }}>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ color: "#2f855a", marginBottom: "1rem" }}>Customer Information</h3>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <div>
                <strong>Name:</strong> {selectedOrder.customer_name || selectedOrder.customer || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {selectedOrder.customer_email || selectedOrder.email || "N/A"}
              </div>
              <div>
                <strong>Phone:</strong> {selectedOrder.customer_phone || selectedOrder.phone || "N/A"}
              </div>
              <div>
                <strong>Address:</strong> {selectedOrder.delivery_address || selectedOrder.address || "N/A"}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ color: "#2f855a", marginBottom: "1rem" }}>Order Items</h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {selectedOrder.items && selectedOrder.items.length ? (
                selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0.375rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600" }}>{item.product_name || item.name || "Unknown"}</div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{formatCurrency(item.price)} each</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>Qty: {item.quantity}</div>
                      <div style={{ fontWeight: "600", color: "#2f855a" }}>{formatCurrency(item.total)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: 12, color: "#6b7280" }}>No items found for this order</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: 12, color: "#dc2626", marginBottom: 12 }}>
          <strong>Error:</strong> {error}
          <button onClick={() => setError("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer" }}>
            ✕
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#2f855a", margin: 0 }}>Order Management</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            {filteredOrders.length} of {orders.length} orders
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Orders</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827" }}>{stats.total}</div>
        </div>

        <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Pending</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>{stats.pending}</div>
        </div>

        <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Processing</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#3b82f6" }}>{stats.processing}</div>
        </div>

        <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Delivered</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>{stats.delivered}</div>
        </div>

        <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Revenue</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#2f855a" }}>{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input type="text" placeholder="Search by customer, order number, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", minWidth: 300, flex: 1 }} />

        <button onClick={fetchOrders} style={{ backgroundColor: "#2f855a", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "0.375rem", cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>🔄</div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f9fafb" }}>
                <tr>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Order</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Customer</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Date</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Items</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Total</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Status</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <tr key={order.id} style={{ backgroundColor: index % 2 === 0 ? "white" : "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.75rem" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "#111827" }}>#{getOrderNumberDisplay(order)}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{order.order_number || `Order #${order.id}`}</div>
                        </div>
                      </td>

                      <td style={{ padding: "0.75rem" }}>
                        <div>
                          <div style={{ fontWeight: "500", color: "#111827" }}>{order.customer_name || "N/A"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{order.customer_email || order.email || "N/A"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{order.customer_phone || order.phone || "N/A"}</div>
                        </div>
                      </td>

                      <td style={{ padding: "0.75rem", color: "#6b7280", fontSize: "0.875rem" }}>{formatDate(order.created_at)}</td>

                      <td style={{ padding: "0.75rem", color: "#374151", fontWeight: "500" }}>{order.item_count} items</td>

                      <td style={{ padding: "0.75rem", color: "#2f855a", fontWeight: "700" }}>{formatCurrency(order.total)}</td>

                      <td style={{ padding: "0.75rem" }}>
                        <span style={getStatusBadge(order.status)}>{order.status}</span>
                      </td>

                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => fetchOrderDetails(order)}
                            style={{ backgroundColor: "#3b82f6", color: "white", border: "none", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            View
                          </button>

                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            style={{ padding: "0.25rem 0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", fontSize: "0.75rem", backgroundColor: "white" }}
                            disabled={updatingOrderIds.includes(order.id)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                      {searchTerm || filter !== "all" ? "No orders match your filters" : "No orders yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;