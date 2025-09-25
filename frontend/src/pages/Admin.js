import React, { useState, useEffect } from 'react';

const API = "http://localhost:5001";
export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    featured: false,
    image_url: ''
  });

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    console.log('🔄 Admin: Loading products...');
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/products`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('✅ Admin: Loaded', data.length, 'products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Admin: Load error:', err);
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    console.log('➕ Admin: Adding product:', formData.name);
    
    try {
      const response = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          image_url: formData.image_url || `https://picsum.photos/seed/abuad-${Date.now()}/600/400`
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      console.log('✅ Admin: Product added successfully');
      resetForm();
      setShowAddForm(false);
      loadProducts();
    } catch (err) {
      console.error('❌ Admin: Add error:', err);
      setError(`Failed to add product: ${err.message}`);
    }
  };

  // Update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    console.log('📝 Admin: Updating product:', editingProduct.id);
    
    try {
      const response = await fetch(`${API}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity) || 0
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      console.log('✅ Admin: Product updated successfully');
      resetForm();
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      console.error('❌ Admin: Update error:', err);
      setError(`Failed to update product: ${err.message}`);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    console.log('🗑️ Admin: Deleting product:', productId);
    try {
      const response = await fetch(`${API}/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
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
      const response = await fetch(`${API}/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      console.log('✅ Admin: Featured status updated');
      loadProducts();
    } catch (err) {
      console.error('❌ Admin: Featured toggle error:', err);
      setError(`Failed to update featured status: ${err.message}`);
    }
  };

  // Form helpers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock_quantity: '',
      featured: false,
      image_url: ''
    });
  };

  const startEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock_quantity: product.stock_quantity || '',
      featured: product.featured || false,
      image_url: product.image_url || ''
    });
    setEditingProduct(product);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    resetForm();
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => 
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ color: '#2f855a', margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingProduct(null);
              resetForm();
            }}
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
            {showAddForm ? 'Cancel' : '+ Add Product'}
          </button>
          <button onClick={loadProducts} style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer'
          }}>
            🔄 Refresh
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

      <div style={{ display: 'grid', gridTemplateColumns: (showAddForm || editingProduct) ? '1fr 420px' : '1fr', gap: 20 }}>
        {/* Left: Products Table */}
        <div>
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
                          ₦{Number(product.price).toLocaleString()}
                        </td>
                        <td style={{ padding: 12 }}>{product.stock_quantity || 0}</td>
                        <td style={{ padding: 12 }}>
                          <button
                            onClick={() => toggleFeatured(product)}
                            style={{
                              background: product.featured ? '#fbbf24' : '#e5e7eb',
                              color: product.featured ? 'white' : '#6b7280',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            {product.featured ? '⭐ Featured' : '☆ Feature'}
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
                {products.filter(p => p.featured).length}
              </div>
              <div style={{ color: '#6b7280' }}>Featured Products</div>
            </div>
            <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{categories.length}</div>
              <div style={{ color: '#6b7280' }}>Categories</div>
            </div>
          </div>
        </div>

        {/* Right: Add/Edit Form */}
        {(showAddForm || editingProduct) && (
          <div style={{ alignSelf: 'start' }}>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#2f855a' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Price (₦) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', resize: 'vertical' }}
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="Leave empty for auto-generated image"
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    />
                    <span style={{ fontWeight: 600 }}>Featured Product</span>
                  </label>
                </div>
                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    style={{
                      background: '#2f855a',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={editingProduct ? cancelEdit : () => setShowAddForm(false)}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}