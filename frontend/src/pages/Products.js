import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import ProductQuickView from "../components/ProductQuickView";

function autoImageUrl(seed, w = 600, h = 400) {
  return `https://picsum.photos/seed/abuad-${seed}/${w}/${h}`;
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { addToCart } = useCart();

  // ✅ FIXED: Changed from port 5000 to 5001
const API = "http://localhost:5001";
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      console.log('🔍 Products: Starting to fetch from:', `${API}/api/products`);
      setLoading(true);
      setError("");
      try {
        console.log('📡 Products: Making API call...');
        const prodRes = await fetch(`${API}/api/products`);
        console.log('📊 Products: Response status:', prodRes.status);
        
        if (!prodRes.ok) throw new Error(`Products HTTP ${prodRes.status}`);
        
        const prodData = await prodRes.json();
        console.log('✅ Products: Received', prodData.length, 'products');
        console.log('📦 Products: Sample product:', prodData[0]);
        
        if (!mounted) return;
        setProducts(Array.isArray(prodData) ? prodData : []);

        try {
          console.log('🏷️ Products: Fetching categories...');
          const catRes = await fetch(`${API}/api/categories`);
          if (!catRes.ok) {
            throw new Error(`Categories HTTP ${catRes.status}`);
          }
          const catData = await catRes.json();
          console.log('✅ Products: Categories received:', catData);
          
          if (mounted) {
            const normalized = Array.isArray(catData) ? catData.slice() : [];
            if (!normalized.includes("Others")) normalized.unshift("Others");
            setCategories(normalized);
          }
        } catch (catErr) {
          console.warn("Categories endpoint missing or failed — deriving categories from products.", catErr);
          if (!mounted) return;
          const setCats = new Set();
          (prodData || []).forEach((p) => {
            const c = p?.category && String(p.category).trim() !== "" ? String(p.category).trim() : "Others";
            setCats.add(c);
          });
          const derived = Array.from(setCats).filter((c) => c !== "Others").sort();
          derived.unshift("Others");
          setCategories(derived);
          console.log('🏷️ Products: Derived categories:', derived);
        }
      } catch (e) {
        console.error("❌ Products: Fetch error:", e);
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [API]);

  const filtered = products
    .filter((p) => (q ? p.name.toLowerCase().includes(q.toLowerCase()) : true))
    .filter((p) => {
      if (!categoryFilter) return true;
      const pCat = p.category || "Others";
      return pCat === categoryFilter;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      return (b.id || 0) - (a.id || 0);
    });

  const handleAddToCart = (p, qty = 1) => {
    console.log('🛒 Products: Adding to cart:', p.name, 'qty:', qty);
    addToCart({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      quantity: qty,
      image_url: p.image_url || autoImageUrl(p.id, 600, 400),
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h2 style={{ color: "#2f855a" }}>Products</h2>

      {/* Debug Info */}
      <div style={{ background: "#f0f9ff", padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
        <strong>Debug:</strong> API: {API} | Products: {products.length} | Filtered: {filtered.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: "1 1 240px", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db", minWidth: 180 }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db", minWidth: 220 }}
        >
          <option value="">Filter</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 20, marginBottom: 10 }}>🔄</div>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, color: '#dc2626' }}>
          <strong>Error loading products:</strong> {error}
          <br />
          <small>Check console (F12) for more details</small>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 8 }}>
          <p>No products found.</p>
          {products.length === 0 && <p><small>Make sure your backend is running on port 5001</small></p>}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((p) => {
            const img = (p.image_url && p.image_url.trim()) || autoImageUrl(p.id, 600, 400);
            return (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <button
                  aria-label={`Quick view ${p.name}`}
                  onClick={() => setQuickViewProduct(p)}
                  style={{
                    border: "none",
                    padding: 0,
                    margin: 0,
                    background: "transparent",
                    width: "100%",
                    height: 180,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={img}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.src = autoImageUrl(p.id, 600, 400))}
                  />
                </button>

                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{p.category || "General"}</div>
                  <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: "#2f855a" }}>
                    ₦{Number(p.price).toLocaleString()}
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <button
                      onClick={() => handleAddToCart(p, 1)}
                      style={{
                        width: "100%",
                        background: "#2f855a",
                        color: "white",
                        padding: "10px 12px",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#276749")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#2f855a")}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAdd={(qty) => {
            handleAddToCart(quickViewProduct, qty);
            setQuickViewProduct(null);
          }}
        />
      )}
    </div>
  );
}