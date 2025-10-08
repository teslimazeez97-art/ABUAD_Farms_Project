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
    <div style={{ padding: "32px 20px" }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#2f855a", textAlign: "left", fontSize: 28 }}>Our Products</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", maxWidth: 1200, margin: "0 auto 16px auto", padding: "0 20px" }}>
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
          <option value="">Sort by</option>
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
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, color: '#dc2626', margin: "0 auto", maxWidth: 1200, marginBottom: 20 }}>
          <strong>Error loading products:</strong> {error}
          <br />
          <small>Check console (F12) for more details</small>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 8, margin: "0 auto", maxWidth: 1200 }}>
          <p>No products found matching your search.</p>
        </div>
      ) : (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {filtered.map((p) => {
              const img = resolveImageUrl(p.image_url) || autoImageUrl(p.id, 600, 400);
              return (
                <div key={p.id} className="product-card" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => setQuickViewProduct(p)} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}>
                  <img src={img} alt={p.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} onError={(e) => (e.currentTarget.src = autoImageUrl(p.id, 600, 400))} />

                  <div className="product-card-body" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: 16, margin: "0 0 8px 0", fontWeight: 600 }}>{p.name}</h4>
                    <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#2f855a", fontWeight: 700 }}>
                      NGN {Number(p.price).toLocaleString()}
                    </p>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '10px', background: '#2f855a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#276749'} onMouseLeave={(e) => e.currentTarget.style.background = '#2f855a'} onClick={(e) => { e.stopPropagation(); handleAddToCart(p, 1); }}>Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>
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

