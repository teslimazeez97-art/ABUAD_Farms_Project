import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function autoImageUrl(seed, w = 300, h = 200) {
  return `https://picsum.photos/seed/abuad-${seed}/${w}/${h}`;
}

export default function CartModal() {
  const { items, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  const getImg = (item) => {
    if (!item) return autoImageUrl("fallback");
    const idSeed = item.id ?? item.product_id ?? "fallback";
    const src = (item.image_url && String(item.image_url).trim()) || autoImageUrl(idSeed, 300, 200);
    return src;
  };

  const clampQty = (n) => Math.max(1, Math.min(99, Number.isFinite(n) ? n : 1));

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      <div
        style={{
          width: "min(900px, 96vw)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Your Cart</h3>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            style={{ 
              background: "transparent", 
              border: "none", 
              fontSize: 28, 
              cursor: "pointer", 
              color: "#6b7280",
              padding: 4
            }}
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px", 
            background: "#f9fafb",
            borderRadius: 12,
            border: "2px dashed #d1d5db"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
            <h2 style={{ 
              margin: "0 0 16px 0", 
              color: "#111827", 
              fontSize: 28,
              fontWeight: 700
            }}>
              Your cart is empty
            </h2>
            <p style={{ 
              marginBottom: 32, 
              fontSize: 18,
              color: "#6b7280",
              lineHeight: 1.6
            }}>
              Thank you for visiting ABUAD Farms!<br/>
              Ready to add some fresh products to your cart?
            </p>
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate("/products");
              }}
              style={{
                background: "#2f855a",
                color: "white",
                padding: "16px 32px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(47, 133, 90, 0.3)",
                transition: "all 0.2s"
              }}
            >
              🌱 Shop Fresh Products
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 16 }}>
              {items.map((item, idx) => (
                <div
                  key={`${item?.id ?? "x"}-${idx}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr auto",
                    gap: 16,
                    alignItems: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 16,
                    background: "#fafafa"
                  }}
                >
                  <div style={{ 
                    width: 120, 
                    height: 80, 
                    background: "#f1f5f9", 
                    borderRadius: 8, 
                    overflow: "hidden" 
                  }}>
                    <img
                      src={getImg(item)}
                      alt={item?.name ?? "Item"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => (e.currentTarget.src = autoImageUrl(item?.id ?? "fallback", 300, 200))}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{item?.name ?? "Item"}</div>
                    <div style={{ color: "#64748b", fontSize: 14 }}>
                      ₦{Number(item?.price ?? 0).toLocaleString()} each
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <button
                        onClick={() => updateQuantity(item?.id, clampQty((item?.quantity ?? 1) - 1))}
                        aria-label="Decrease quantity"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          cursor: "pointer",
                          fontWeight: 700
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item?.quantity ?? 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          updateQuantity(item?.id, clampQty(val));
                        }}
                        style={{ 
                          width: 64, 
                          textAlign: "center", 
                          border: "1px solid #d1d5db", 
                          borderRadius: 8, 
                          padding: "8px",
                          fontWeight: 600
                        }}
                      />
                      <button
                        onClick={() => updateQuantity(item?.id, clampQty((item?.quantity ?? 1) + 1))}
                        aria-label="Increase quantity"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          cursor: "pointer",
                          fontWeight: 700
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#2f855a" }}>
                      ₦{(((item?.price ?? 0) * (item?.quantity ?? 0)) || 0).toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeFromCart(item?.id)}
                      style={{
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                paddingTop: 20,
                borderTop: "2px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={clearCart}
                style={{
                  background: "#f3f4f6",
                  color: "#111827",
                  border: "1px solid #d1d5db",
                  padding: "12px 20px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Clear Cart
              </button>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#2f855a" }}>
                Total: ₦{total.toLocaleString()}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: "#6b7280",
                  color: "#fff",
                  padding: "12px 20px",
                  borderRadius: 8,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                style={{
                  background: "#2f855a",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}