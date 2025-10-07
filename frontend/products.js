import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await axios.get(`${API}/api/products`);
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          throw new Error("Unexpected API response");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>🌱 Loading products...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>⚠️ {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>🛍 Our Products</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16
      }}>
        {products.map(p => (
          <div key={p.id} style={{
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fff",
            overflow: "hidden"
          }}>
            <img src={p.image_url} alt={p.name}
                 style={{ width: "100%", height: 140, objectFit: "cover" }} />
            <div style={{ padding: 12 }}>
              <h3 style={{ margin: "6px 0" }}>{p.name}</h3>
              <p style={{ fontSize: 14, color: "#666" }}>{p.description}</p>
              <strong>₦{Number(p.price).toLocaleString()}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}