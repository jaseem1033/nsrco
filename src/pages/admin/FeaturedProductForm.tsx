import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

interface ProductOption {
  id: string;
  name: string;
}

export const FeaturedProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [productId, setProductId] = useState('');
  const [priority, setPriority] = useState(10);

  // Lists & Load State
  const [productsList, setProductsList] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [imageUploading, setImageUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const initializeForm = async () => {
      try {
        // 1. Fetch products list for dropdown
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('id, name')
          .order('name', { ascending: true });

        if (prodError) throw prodError;
        setProductsList(prodData || []);

        if (prodData && prodData.length > 0 && !productId) {
          setProductId(prodData[0].id);
        }

        // 2. Fetch featured details if in edit mode
        if (isEditMode && id) {
          const { data: featuredData, error: featError } = await supabase
            .from('featured_products')
            .select('*')
            .eq('id', id)
            .single();

          if (featError) throw featError;

          if (featuredData) {
            setTitle(featuredData.title || '');
            setDescription(featuredData.description || '');
            setImage(featuredData.image || '');
            setProductId(featuredData.product_id || '');
            setPriority(featuredData.priority ?? 10);
            setFeatures(featuredData.features && featuredData.features.length > 0 ? featuredData.features : ['']);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load form dependencies.');
      } finally {
        setFetchLoading(false);
      }
    };

    initializeForm();
  }, [id, isEditMode]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setImageUploading(true);

    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const randomStr = Math.random().toString(36).substring(2, 10);
      const fileName = `${Date.now()}-${randomStr}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      // Upload file to product-images bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setImage(data.publicUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during banner image upload.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  // Features List Handlers
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const addFeatureRow = () => {
    setFeatures([...features, '']);
  };

  const removeFeatureRow = (index: number) => {
    if (features.length === 1) {
      setFeatures(['']);
    } else {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanedFeatures = features.map(f => f.trim()).filter(Boolean);

    if (!image) {
      setErrorMsg('Banner image is required. Please upload an image.');
      setLoading(false);
      return;
    }

    if (!productId) {
      setErrorMsg('You must link this banner to a product.');
      setLoading(false);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      image,
      features: cleanedFeatures,
      product_id: productId,
      priority: Number(priority),
    };

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('featured_products')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('featured_products')
          .insert([payload]);

        if (error) throw error;
      }

      navigate('/admin?tab=banners');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the featured banner.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="page-loader">
        <div className="admin-spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving banner details...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          NSRCO <span className="admin-badge">{isEditMode ? 'Edit Featured Banner' : 'Add Featured Banner'}</span>
        </div>
        <div className="admin-nav-links">
          <Link to="/admin?tab=banners" className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
            Back to Inventory
          </Link>
        </div>
      </header>

      {/* Form Content */}
      <main className="admin-container" style={{ maxWidth: '850px' }}>
        {errorMsg && (
          <div className="admin-alert admin-alert-error" style={{ display: 'flex', justifyContent: 'between' }}>
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto', fontWeight: 'bold' }}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--text)', marginBottom: '1.5rem' }}>
            {isEditMode ? 'Modify Homepage Featured Banner' : 'Create New Featured Homepage Banner'}
          </h2>

          <div className="admin-form-group">
            <label className="admin-label">Banner Title *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g. High-capacity Rack Fryer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Linked Product (Action Redirect) *</label>
              <select
                className="admin-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                disabled={loading}
              >
                <option value="" disabled>Select a catalog product...</option>
                {productsList.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} (ID: {prod.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group" style={{ maxWidth: '120px' }}>
              <label className="admin-label">Priority *</label>
              <input
                type="number"
                className="admin-input"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                min="1"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Banner Image Section */}
          <div className="admin-form-group">
            <label className="admin-label">Banner Image (Wide/Landscape Recommended) *</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="https://... or /images/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                  disabled={loading}
                  style={{ marginBottom: '1rem' }}
                />
                
                <div className="admin-file-picker">
                  {imageUploading ? (
                    <div style={{ padding: '0.5rem 0' }}>
                      <span className="admin-spinner"></span>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploading banner...</p>
                    </div>
                  ) : (
                    <div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                        Drag & drop or <span style={{ color: 'var(--orange)', fontWeight: 600 }}>Browse File</span>
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading || imageUploading}
                  />
                </div>
              </div>

              {image && (
                <div style={{ width: '180px', textAlign: 'center' }}>
                  <label className="admin-label">Preview</label>
                  <img
                    src={image}
                    alt="Featured banner preview"
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Homepage Marketing Copy (Description) *</label>
            <textarea
              className="admin-textarea"
              placeholder="e.g. Built for the most demanding commercial kitchens. Features advanced thermal management..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
              style={{ minHeight: '80px' }}
            ></textarea>
          </div>

          {/* Features Builder */}
          <div className="admin-form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="admin-label">Homepage Banner Features (Max 3-4 bullets recommended)</label>
            <div className="admin-dynamic-list">
              {features.map((feature, index) => (
                <div className="admin-dynamic-row" key={index}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. High Volume – 6-head chicken or 6.5 kg per load"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => removeFeatureRow(index)}
                    disabled={loading}
                    style={{ padding: '0 12px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={addFeatureRow}
              disabled={loading}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              + Add Featured Bullet Point
            </button>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <Link to="/admin?tab=banners" className="admin-btn admin-btn-secondary" style={{ minWidth: '100px' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading || imageUploading}
              style={{ minWidth: '120px' }}
            >
              {loading ? (
                <>
                  <span className="admin-spinner"></span>
                  <span style={{ marginLeft: '6px' }}>Saving...</span>
                </>
              ) : (
                'Save Banner'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
