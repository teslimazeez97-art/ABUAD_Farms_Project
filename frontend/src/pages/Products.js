import React, { useEffect, useState } from "react";
import { resolveImageUrl } from '../services/api';
import { useCart } from "../context/CartContext";
import ProductQuickView from "../components/ProductQuickView";
import { apiFetch } from "../services/api";

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const prodData = await apiFetch('/api/products');
        if (!mounted) return;
        setProducts(Array.isArray(prodData) ? prodData.filter(p => !p.archived) : []);

        try {
          const catData = await apiFetch('/api/categories');
          if (mounted) {
            const normalized = Array.isArray(catData) ? catData.slice() : [];
            if (!normalized.includes("Others")) normalized.unshift("Others");
            setCategories(normalized);
          }
        } catch (catErr) {
          if (!mounted) return;
          const setCats = new Set();
          (prodData || []).forEach((p) => {
            const c = p?.category && String(p.category).trim() !== "" ? String(p.category).trim() : "Others";
            setCats.add(c);
          });
          const derived = Array.from(setCats).filter((c) => c !== "Others").sort();
          derived.unshift("Others");
          setCategories(derived);
        }
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

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
    addToCart({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      quantity: qty,
      image_url: p.image_url || autoImageUrl(p.id, 600, 400),
    });
  };

  return (
    <div className="product-list-wrapper">
      <h2 style={{ color: "var(--brand-green)" }}>Products</h2>

      {/* Debug Info */}
      <div style={{ background: "#f0f9ff", padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
        <strong>Debug:</strong> Products: {products.length} | Filtered: {filtered.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}
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
        <div className="products-grid">
          {filtered.map((p) => {
            const img = resolveImageUrl(p.image_url) || autoImageUrl(p.id, 600, 400);
            return (
              <div key={p.id} className="product-card">
                <button aria-label={`Quick view ${p.name}`} onClick={() => setQuickViewProduct(p)} className="product-image-btn">
                  <img src={img} alt={p.name} onError={(e) => (e.currentTarget.src = autoImageUrl(p.id, 600, 400))} />
                </button>

                <div className="product-card-body">
                  <div className="product-name">{p.name}</div>
                  <div className="product-category">{p.category || "General"}</div>
                  <div className="product-price">₦{Number(p.price).toLocaleString()}</div>
                </div>

                <div className="product-card-footer">
                  <button className="btn btn-primary full-width" onClick={() => handleAddToCart(p, 1)}>Add to Cart</button>
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

