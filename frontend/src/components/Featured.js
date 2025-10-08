import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Featured() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await axios.get(`${API}/api/products/featured`);
        if (Array.isArray(res.data)) {
          setFeatured(res.data);
        } else {
          throw new Error("Unexpected API response");
        }
      } catch (err) {
        setError(err.message);
      }
    }
    loadFeatured();
  }, []);

  if (error) {
    return <div style={{ padding: 20, color: "red" }}>⚠️ {error}</div>;
  }

  if (!featured.length) {
    return <div style={{ padding: 20 }}>No featured products yet.</div>;
  }

  return (
    <div style={{ padding: 20, width: "100%" }}>
      <h2>🌟 Featured Products</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)", // ✅ lock at 5 columns
          gap: 16,
        }}
      >
        {featured.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <img
              src={p.image_url}
              alt={p.name}
              style={{ width: "100%", height: 140, objectFit: "cover" }}
            />
            <div style={{ padding: 10 }}>
              <h4 style={{ fontSize: 15, margin: "4px 0" }}>{p.name}</h4>
              <p style={{ margin: "4px 0", fontSize: 13, color: "#555" }}>
                NGN {Number(p.price).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}