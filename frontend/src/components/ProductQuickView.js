import React from "react";
import { useState, useEffect, useRef } from "react";

function autoImageUrl(seed, w = 800, h = 600) {
  return `https://picsum.photos/seed/abuad-${seed}/${w}/${h}`;
}

export default function ProductQuickView({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);

  const img = (product.image_url && product.image_url.trim()) || autoImageUrl(product.id, 800, 600);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // focus close for accessibility
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clampQty = (n) => Math.max(1, Math.min(99, Number.isFinite(n) ? n : 1));

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view ${product.name}`}
    >
      <div
        style={{
          width: "min(900px, 96vw)",
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {/* Image */}
        <div style={{ background: "#f1f5f9", minHeight: 300 }}>
          <img
            src={img}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => (e.currentTarget.src = autoImageUrl(product.id, 800, 600))}
          />
        </div>

        {/* Details */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h3 style={{ margin: 0, color: "#111827" }}>{product.name}</h3>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close quick view"
              style={{
                background: "transparent",
                border: "none",
                color: "#6b7280",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ color: "#64748b", fontSize: 14 }}>
            {product.description || "No description provided."}
          </div>

          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800, color: "#2f855a" }}>
            NGN {Number(product.price).toLocaleString()}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <label htmlFor="qty" style={{ fontSize: 14, color: "#374151" }}>
              Quantity:
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setQty((q) => clampQty(q - 1))}
                aria-label="Decrease quantity"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                -
              </button>
              <input
                id="qty"
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(clampQty(parseInt(e.target.value, 10)))}
                style={{
                  width: 60,
                  textAlign: "center",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
              <button
                onClick={() => setQty((q) => clampQty(q + 1))}
                aria-label="Increase quantity"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
            <button
              onClick={() => onAdd(qty)}
              style={{
                flex: 1,
                background: "#2f855a",
                color: "white",
                padding: "12px 14px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#276749")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#2f855a")}
            >
              Add to Cart
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#e5e7eb",
                color: "#111827",
                padding: "12px 14px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}