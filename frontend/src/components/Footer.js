import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#1f2937", color: "#e5e7eb", marginTop: 40 }}>
      {/* Top */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 24,
        }}
      >
        {/* Brand / About */}
        <div>
          <h3 style={{ margin: "0 0 12px 0", color: "#fff" }}>🌱 ABUAD Farms</h3>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#d1d5db" }}>
            Fresh produce, livestock, and farm goods — proudly grown and delivered with care.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ margin: "0 0 12px 0", color: "#fff" }}>Quick Links</h4>
          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link to="/" style={{ color: "#e5e7eb", textDecoration: "none" }}>Home</Link>
            <Link to="/products" style={{ color: "#e5e7eb", textDecoration: "none" }}>Products</Link>
            <Link to="/about" style={{ color: "#e5e7eb", textDecoration: "none" }}>About</Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ margin: "0 0 12px 0", color: "#fff" }}>Contact</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.9 }}>
            <li>📍 Ado‑Ekiti, Ekiti State, Nigeria</li>
            <li>📞 +234 800 000 0000</li>
            <li>✉️ hello@abuadfarms.com</li>
          </ul>
          <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
            <button 
              onClick={() => {/* TODO: Add Facebook link */}}
              style={{ color: "#e5e7eb", textDecoration: "none", background: "none", border: "none", cursor: "pointer" }}
            >
              Facebook
            </button>
            <button 
              onClick={() => {/* TODO: Add Instagram link */}}
              style={{ color: "#e5e7eb", textDecoration: "none", background: "none", border: "none", cursor: "pointer" }}
            >
              Instagram
            </button>
            <button 
              onClick={() => {/* TODO: Add Twitter link */}}
              style={{ color: "#e5e7eb", textDecoration: "none", background: "none", border: "none", cursor: "pointer" }}
            >
              Twitter
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid #374151" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            color: "#9ca3af",
          }}
        >
          <span>© {year} ABUAD Farms. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <button 
              onClick={() => {/* TODO: Add Privacy link */}}
              style={{ color: "#9ca3af", textDecoration: "none", background: "none", border: "none", cursor: "pointer" }}
            >
              Privacy
            </button>
            <button 
              onClick={() => {/* TODO: Add Terms link */}}
              style={{ color: "#9ca3af", textDecoration: "none", background: "none", border: "none", cursor: "pointer" }}
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}