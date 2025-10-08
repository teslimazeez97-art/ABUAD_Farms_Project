import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

// Existing categories from database
const existingCategories = [
  'Crops', 'Fruits', 'Grains', 'Honey', 'Legumes', 'Livestock', 'Meat', 'Moringa',
  'Mushroom', 'Oils', 'Poultry', 'Processed', 'Snails', 'Spices', 'Tubers', 'Vegetables'
];

export default function AddProductModal({ isOpen, onClose, onProductAdded, editingProduct, onProductUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    featured: false,
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [imageType, setImageType] = useState('url'); // 'url' or 'upload'
  const [imageFile, setImageFile] = useState(null);

  // Update form data when editing product changes
  useEffect(() => {
    if (editingProduct) {
      const category = editingProduct.category || '';
      const isCustom = category && !existingCategories.includes(category);
      
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || '',
        category: isCustom ? 'Other' : category,
        stock_quantity: editingProduct.stock_quantity || '',
        featured: editingProduct.is_featured || false,
        image_url: editingProduct.image_url || ''
      });
      setCustomCategory(isCustom ? category : '');
      setShowCustomCategory(isCustom);
    } else {
      resetForm();
    }
  }, [editingProduct, existingCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isEditing = !!editingProduct;
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `/api/products/${editingProduct.id}` : '/api/products';

      // Determine final category
      const finalCategory = formData.category === 'Other' ? customCategory : formData.category;

      // Handle image URL
      let finalImageUrl = formData.image_url;
      if (imageType === 'upload' && imageFile) {
        // For now, we'll use a placeholder. In a real app, you'd upload the file to a server
        finalImageUrl = `https://picsum.photos/seed/abuad-${Date.now()}/600/400`;
      }

      await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: finalCategory,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          image_url: finalImageUrl || `https://picsum.photos/seed/abuad-${Date.now()}/600/400`
        })
      });

      console.log(`✅ Product ${isEditing ? 'updated' : 'added'} successfully`);
      resetForm();
      onClose();
      if (isEditing && onProductUpdated) {
        onProductUpdated();
      } else if (!isEditing && onProductAdded) {
        onProductAdded();
      }
    } catch (err) {
      console.error(`❌ ${editingProduct ? 'Update' : 'Add'} error:`, err);
      setError(`Failed to ${editingProduct ? 'update' : 'add'} product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    setCustomCategory('');
    setShowCustomCategory(false);
    setImageType('url');
    setImageFile(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!editingProduct;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 12, maxWidth: 900, width: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <h2 style={{ marginBottom: 20, color: '#2f855a', fontSize: '1.5rem', fontWeight: '700' }}>{isEditing ? 'Edit Product' : 'Add Product'}</h2>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, color: '#dc2626', marginBottom: 20 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* First Row: Name and Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: '600', color: '#374151' }}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: '1rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: '600', color: '#374151' }}>Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: '1rem' }}
              />
            </div>
          </div>

          {/* Second Row: Category and Stock Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: '600', color: '#374151' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({...formData, category: value});
                  setShowCustomCategory(value === 'Other');
                  if (value !== 'Other') {
                    setCustomCategory('');
                  }
                }}
                style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: '1rem' }}
              >
                <option value="">Select Category</option>
                {existingCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other (specify below)</option>
              </select>
              {showCustomCategory && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  style={{ width: '100%', padding: 8, border: '2px solid #e5e7eb', borderRadius: 8, marginTop: 8, fontSize: '0.9rem' }}
                />
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: '600', color: '#374151' }}>Stock Quantity</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: '1rem' }}
              />
            </div>
          </div>

          {/* Third Row: Description (full width) */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: '600', color: '#374151' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: '1rem', resize: 'vertical' }}
            />
          </div>

          {/* Fourth Row: Image options and Featured checkbox */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '600', color: '#374151' }}>Image</label>
              <div style={{ marginBottom: 8, display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="url"
                    checked={imageType === 'url'}
                    onChange={(e) => setImageType(e.target.value)}
                    style={{ marginRight: 6 }}
                  />
                  Image URL
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="upload"
                    checked={imageType === 'upload'}
                    onChange={(e) => setImageType(e.target.value)}
                    style={{ marginRight: 6 }}
                  />
                  Upload Image
                </label>
              </div>
              {imageType === 'url' ? (
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: '1rem' }}
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  style={{ width: '100%', padding: 8, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: '1rem' }}
                />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 32 }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: '600', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  style={{ marginRight: 8, transform: 'scale(1.2)' }}
                />
                Featured Product
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <button 
              type="button" 
              onClick={handleClose} 
              style={{ 
                padding: '10px 20px', 
                border: '2px solid #e5e7eb', 
                background: 'white', 
                borderRadius: 8, 
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: '10px 20px', 
                border: 'none', 
                background: 'linear-gradient(135deg, #2f855a, #1e5631)', 
                color: 'white', 
                borderRadius: 8, 
                cursor: 'pointer',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(47, 133, 90, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(47, 133, 90, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(47, 133, 90, 0.3)';
              }}
            >
              {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}