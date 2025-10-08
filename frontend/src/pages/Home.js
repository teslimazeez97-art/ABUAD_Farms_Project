import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { apiFetch } from "../services/api";
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { addToCart } = useCart();

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // responsive columns
  const featuredCols = isMobile ? 2 : isTablet ? 3 : 5;
  const categoryCols = isMobile ? 1 : isTablet ? 2 : 3; // Center 3 cards on desktop

  useEffect(() => {
    async function load() {
      console.log('?? Home: Starting to fetch data...');
      setLoading(true);
      setError("");
      
      try {
        console.log('?? Home: Fetching featured products from API');
        console.log('?? Home: Fetching all products from API');
        
        const [featRes, prodRes] = await Promise.all([
          apiFetch('/api/products/featured'),
          apiFetch('/api/products')
        ]);
        
        console.log('? Home: Featured products response:', featRes.length, 'products');
        console.log('? Home: All products response:', prodRes.length, 'products');
        console.log('?? Home: Sample featured product:', featRes[0]);
        
        setFeatured(Array.isArray(featRes) ? featRes : []);
        setAllProducts(Array.isArray(prodRes) ? prodRes : []);
      } catch (e) {
        console.error("? Home: Load error:", e.message);
        console.error("? Home: Full error:", e);
        setError(`Failed to load data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    function onResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Derive categories dynamically from products - filter out test categories and select 6 random ones
  const categories = useMemo(() => {
    const allCategories = Array.from(
      new Set(allProducts.map(p => p.category || "Uncategorized"))
    ).filter(cat => !cat.toLowerCase().includes('test') && !cat.toLowerCase().includes('qa'));

    // Randomly select 6 categories
    return allCategories
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
  }, [allProducts]);

  // Only log when categories actually change
  useEffect(() => {
    console.log('??? Home: Categories derived:', categories);
  }, [categories]);

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #2f855a, #276749)",
          color: "white",
          borderRadius: 12,
          padding: isMobile ? 20 : 32,
          marginBottom: 32,
          boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
        }}
      >
        <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 32 }}>
          Welcome to ABUAD Farms
        </h1>
        <p style={{ marginTop: 10, opacity: 0.95, fontSize: isMobile ? 14 : 16 }}>
          Fresh produce, livestock, and farm goods � straight from our fields to your table.
        </p>
        <div style={{ marginTop: 16 }}>
          <Link
            to="/products"
            style={{
              background: "white",
              color: "#276749",
              padding: "10px 16px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700
            }}
          >
            Shop Products
          </Link>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 24, marginBottom: 10, fontWeight: 'bold' }}>Home</div>
          <p>Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, color: '#dc2626', marginBottom: 20 }}>
          <strong>Error:</strong> {error}
          <br />
          <small>Make sure your backend is running on port 5001. Check console (F12) for more details.</small>
        </div>
      )}

      {/* Our Product Categories - FIRST */}
      {!loading && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#2f855a", textAlign: "center", fontSize: 28 }}>
            Our Product Categories
          </h2>
          {categories.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 24,
                textAlign: "center",
                color: "#666"
              }}
            >
              Categories will appear here once products are available.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${categoryCols}, 1fr)`,
                gap: 20,
                maxWidth: isMobile ? "100%" : isTablet ? "600px" : "900px",
                margin: "0 auto", // Center the grid
                justifyItems: "center"
              }}
            >
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  style={{
                    background: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "20px 16px",
                    textDecoration: "none",
                    color: "#1f2937",
                    fontWeight: 600,
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    width: "100%",
                    maxWidth: 280,
                    fontSize: 16
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#f0fdf4";
                    e.currentTarget.style.borderColor = "#2f855a";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Products - SECOND */}
      {!loading && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: "#2f855a", fontSize: 28 }}>Featured Products</h2>
            <Link to="/products" style={{ color: "#276749", textDecoration: "none", fontWeight: 600 }}>
              View all
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${featuredCols}, 1fr)`,
              gap: 16
            }}
          >
            {featured.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 24,
                  textAlign: "center",
                  color: "#666"
                }}
              >
                No featured products yet. {allProducts.length > 0 && <span>Try marking some products as featured in the database.</span>}
              </div>
            ) : (
              featured.map(p => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 12,
                    background: "#fff",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                >
                  {/* Clickable Image acts as Quick View */}
                  <div
                    onClick={() => setQuickViewProduct(p)}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 140,
                      cursor: "pointer"
                    }}
                  >
                    <img
                      src={p.image_url || `https://picsum.photos/seed/abuad-${p.id}/600/400`}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/abuad-${p.id}/600/400`;
                      }}
                    />
                    {/* Hover overlay hint */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.0)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        opacity: 0,
                        transition: "opacity 0.2s, background 0.2s"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.opacity = 1;
                        e.currentTarget.style.background = "rgba(0,0,0,0.35)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.opacity = 0;
                        e.currentTarget.style.background = "rgba(0,0,0,0.0)";
                      }}
                    >
                      Quick View
                    </div>
                  </div>

                  <div style={{ padding: 12 }}>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: 16 }}>{p.name}</h3>
                    <div style={{ color: "#2f855a", fontWeight: 700 }}>
                      NGN {Number(p.price).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setQuickViewProduct(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 40
            }}
          />
          {/* Modal */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              borderRadius: 12,
              width: "95%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              zIndex: 41,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottom: "1px solid #eee" }}>
              <h3 style={{ margin: 0, color: "#2f855a" }}>Quick View</h3>
              <button
                onClick={() => setQuickViewProduct(null)}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666" }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 16 }}>
              <img
                src={quickViewProduct.image_url || `https://picsum.photos/seed/abuad-${quickViewProduct.id}/600/400`}
                alt={quickViewProduct.name}
                style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 8, marginBottom: 12 }}
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/abuad-${quickViewProduct.id}/600/400`;
                }}
              />
              <h2 style={{ margin: "8px 0", fontSize: 22 }}>{quickViewProduct.name}</h2>
              <div style={{ color: "#2f855a", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
                NGN {Number(quickViewProduct.price).toLocaleString()}
              </div>
              <p style={{ color: "#4b5563", lineHeight: 1.5 }}>
                {quickViewProduct.description || "No description available."}
              </p>

              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    console.log('?? Home: Adding to cart from quick view:', quickViewProduct.name);
                    addToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  style={{
                    flex: "1 1 180px",
                    padding: "10px 14px",
                    background: "#2f855a",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => setQuickViewProduct(null)}
                  style={{
                    flex: "1 1 180px",
                    padding: "10px 14px",
                    background: "#f3f4f6",
                    color: "#111827",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
