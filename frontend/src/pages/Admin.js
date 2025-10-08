import React, { useState, useEffect } from 'react';
import AddProductModal from '../components/AddProductModal';
import { apiFetch } from '../services/api';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const resetForm = () => {
    setError('');
  };
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    console.log('🔄 Admin: Loading products...');
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/products');
      console.log('✅ Admin: Loaded', data.length, 'products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Admin: Load error:', err);
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    console.log('🗑️ Admin: Deleting product:', productId);
    try {
      await apiFetch(`/api/products/${productId}`, { method: 'DELETE' });
      
      console.log('✅ Admin: Product deleted successfully');
      loadProducts();
    } catch (err) {
      console.error('❌ Admin: Delete error:', err);
      setError(`Failed to delete product: ${err.message}`);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm(`Delete ${selectedProducts.length} selected products?`)) return;

    console.log('🗑️ Admin: Bulk deleting', selectedProducts.length, 'products');
    try {
      await Promise.all(
        selectedProducts.map(id => 
          fetch(`${API}/api/products/${id}`, { method: 'DELETE' })
        )
      );
      console.log('✅ Admin: Bulk delete completed');
      setSelectedProducts([]);
      loadProducts();
    } catch (err) {
      console.error('❌ Admin: Bulk delete error:', err);
      setError(`Failed to delete products: ${err.message}`);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (product) => {
    console.log('⭐ Admin: Toggling featured for:', product.name);
    try {
      await apiFetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          is_featured: !product.is_featured
        })
      });
      
      console.log('✅ Admin: Featured status updated');
      loadProducts();
    } catch (err) {
      console.error('❌ Admin: Featured toggle error:', err);
      setError(`Failed to update featured status: ${err.message}`);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
  };

  // Filter and sort products (exclude REMOVED test products)
  const filteredProducts = products
    .filter(p =>
      !p.name.toLowerCase().includes('removed') &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === '' || p.category === categoryFilter)
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'price') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <React.Fragment>
      <div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ color: '#2f855a', margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#2f855a',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            + Add Product
          </button>
          <button onClick={loadProducts} style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer'
          }}>
            ?? Refresh
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div style={{ background: '#f0f9ff', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
        <strong>Debug:</strong> API: {API} | Products: {products.length} | Filtered: {filteredProducts.length} | Selected: {selectedProducts.length} | Loading: {loading ? 'Yes' : 'No'}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, color: '#dc2626', marginBottom: 20 }}>
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Filters and Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 200px', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        >
          <option value="id-desc">Newest First</option>
          <option value="id-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Price Low-High</option>
          <option value="price-desc">Price High-Low</option>
        </select>
        {selectedProducts.length > 0 && (
          <button
            onClick={handleBulkDelete}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Delete Selected ({selectedProducts.length})
          </button>
        )}
      </div>

      {/* Products Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>🔄</div>
          <p>Loading products...</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(filteredProducts.map(p => p.id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                    />
                  </th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Image</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Category</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Price</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Stock</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Featured</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 12 }}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                      />
                    </td>
                    <td style={{ padding: 12 }}>
                      <img
                        src={product.image_url || `https://picsum.photos/seed/abuad-${product.id}/600/400`}
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                        onError={(e) => {
                          e.currentTarget.src = `https://picsum.photos/seed/abuad-${product.id}/600/400`;
                        }}
                      />
                    </td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{product.name}</td>
                    <td style={{ padding: 12 }}>{product.category || 'Uncategorized'}</td>
                    <td style={{ padding: 12, color: '#2f855a', fontWeight: 600 }}>
                      ?{Number(product.price).toLocaleString()}
                    </td>
                    <td style={{ padding: 12 }}>{product.stock_quantity || 0}</td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => toggleFeatured(product)}
                        style={{
                          background: product.is_featured ? '#fbbf24' : '#e5e7eb',
                          color: product.is_featured ? 'white' : '#6b7280',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        {product.is_featured ? '? Featured' : '? Feature'}
                      </button>
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => startEdit(product)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              No products found. {searchTerm && `Try clearing the search term.`}
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#2f855a' }}>{products.length}</div>
          <div style={{ color: '#6b7280' }}>Total Products</div>
        </div>
        <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>
            {products.filter(p => p.is_featured).length}
          </div>
          <div style={{ color: '#6b7280' }}>Featured Products</div>
        </div>
        <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{categories.length}</div>
          <div style={{ color: '#6b7280' }}>Categories</div>
        </div>
        </div>
      </div>
      </div>
      <AddProductModal
        isOpen={showAddModal || !!editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
          resetForm();
        }}
        onProductAdded={loadProducts}
        onProductUpdated={loadProducts}
        editingProduct={editingProduct}
      />
    </React.Fragment>
  );
}


