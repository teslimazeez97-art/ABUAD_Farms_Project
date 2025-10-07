import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Featured() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/products/featured`)
      .then(res => setFeatured(res.data))
      .catch(err => console.error("Error fetching featured", err));
  }, []);

  if (!featured.length) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>🌟 Featured Products</h2>
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 10 }}>
        {featured.map(f => (
          <div key={f.id} style={{ minWidth: 200, border: "1px solid #eee", borderRadius: 8, background: "#fff" }}>
            <img src={f.image_url} alt={f.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />
            <div style={{ padding: 10 }}>
              <h4 style={{ margin: "6px 0" }}>{f.name}</h4>
              <p style={{ fontSize: 13, color: "#555" }}>₦{Number(f.price).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}