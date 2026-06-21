import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

interface SpecRow {
  key: string;
  value: string;
}

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Form Fields State
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('pressure-fryer');
  const [priority, setPriority] = useState(10);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>(['']);
  const [specs, setSpecs] = useState<SpecRow[]>([{ key: '', value: '' }]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [imageUploading, setImageUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-slugify helper for ID
  useEffect(() => {
    if (!isEditMode && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setProductId(slug);
    }
  }, [name, isEditMode]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProductId(data.id);
          setName(data.name || '');
          setCategory(data.category || 'pressure-fryer');
          setPriority(data.priority ?? 10);
          setDescription(data.description || '');
          setImage(data.image || '');
          setImages(data.images || []);
          setFeatures(data.features && data.features.length > 0 ? data.features : ['']);
          
          // Map specs Record<string, string> to SpecRow[] array
          if (data.specs && typeof data.specs === 'object') {
            const mappedSpecs = Object.entries(data.specs).map(([k, v]) => ({
              key: k,
              value: String(v)
            }));
            setSpecs(mappedSpecs.length > 0 ? mappedSpecs : [{ key: '', value: '' }]);
          } else {
            setSpecs([{ key: '', value: '' }]);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to fetch product details.');
      } finally {
        setFetchLoading(false);
      }
    };

    if (isEditMode) {
      fetchProductDetails();
    }
  }, [id, isEditMode]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    if (isGallery) {
      setGalleryUploading(true);
    } else {
      setImageUploading(true);
    }

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const randomStr = Math.random().toString(36).substring(2, 10);
        const fileName = `${Date.now()}-${randomStr}.${fileExt}`;
        const filePath = `products/${fileName}`;

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
          uploadedUrls.push(data.publicUrl);
        }
      }

      if (isGallery) {
        setImages((prev) => [...prev, ...uploadedUrls]);
      } else {
        setImage(uploadedUrls[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during file upload.');
    } finally {
      setImageUploading(false);
      setGalleryUploading(false);
      // Reset input element
      e.target.value = '';
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  // Features builders
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

  // Specs builders
  const handleSpecChange = (index: number, field: keyof SpecRow, val: string) => {
    const updated = [...specs];
    updated[index] = { ...updated[index], [field]: val };
    setSpecs(updated);
  };

  const addSpecRow = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpecRow = (index: number) => {
    if (specs.length === 1) {
      setSpecs([{ key: '', value: '' }]);
    } else {
      setSpecs(specs.filter((_, i) => i !== index));
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Clean inputs
    const cleanedFeatures = features.map(f => f.trim()).filter(Boolean);
    
    const cleanedSpecsObj: Record<string, string> = {};
    specs.forEach(s => {
      if (s.key.trim() && s.value.trim()) {
        cleanedSpecsObj[s.key.trim()] = s.value.trim();
      }
    });

    if (!productId.trim()) {
      setErrorMsg('Product ID is required.');
      setLoading(false);
      return;
    }

    if (!image) {
      setErrorMsg('Product main image is required. Please upload an image.');
      setLoading(false);
      return;
    }

    const payload = {
      id: productId.trim(),
      name: name.trim(),
      category,
      priority: Number(priority),
      description: description.trim(),
      image,
      images: images.length > 0 ? images : [image],
      features: cleanedFeatures,
      specs: cleanedSpecsObj,
    };

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);

        if (error) throw error;
      }

      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the product details.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="page-loader">
        <div className="admin-spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving product details...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          NSRCO <span className="admin-badge">{isEditMode ? 'Edit Product' : 'Add Product'}</span>
        </div>
        <div className="admin-nav-links">
          <Link to="/admin" className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
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
            {isEditMode ? 'Modify Product Specifications' : 'Upload New Product'}
          </h2>

          {/* Form Rows */}
          <div className="admin-form-group">
            <label className="admin-label">Product Name *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g. NSRCO Pressure Fryer 1800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Product ID (Unique Slug) *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. nsrco-pf-1800"
                value={productId}
                onChange={(e) => setProductId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                disabled={isEditMode || loading}
                style={{ fontFamily: 'monospace' }}
              />
              {!isEditMode && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Autogenerated from name. Used as URL route parameter.
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Category *</label>
              <select
                className="admin-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                <option value="pressure-fryer">Pressure Fryers</option>
                <option value="open-fryer">Open / Rack Fryers</option>
                <option value="massage-tumblers">Vacuum Tumblers</option>
                <option value="others">Other Equipment</option>
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

          <div className="admin-form-group">
            <label className="admin-label">Main Image URL *</label>
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
                      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploading to Storage Bucket...</p>
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
                    onChange={(e) => handleImageUpload(e, false)}
                    disabled={loading || imageUploading}
                  />
                </div>
              </div>

              {image && (
                <div style={{ width: '130px', textAlign: 'center' }}>
                  <label className="admin-label">Preview</label>
                  <img
                    src={image}
                    alt="Main product representation"
                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Gallery Images Section */}
          <div className="admin-form-group">
            <label className="admin-label">Product Gallery Images (Optional)</label>
            <div className="admin-file-picker" style={{ padding: '1.5rem' }}>
              {galleryUploading ? (
                <div>
                  <span className="admin-spinner"></span>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploading images...</p>
                </div>
              ) : (
                <div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    Add multiple slide representations
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, true)}
                disabled={loading || galleryUploading}
              />
            </div>

            {images.length > 0 && (
              <div className="admin-preview-grid">
                {images.map((imgUrl, index) => (
                  <div className="admin-preview-item" key={index}>
                    <img src={imgUrl} alt={`Gallery index ${index}`} />
                    <button
                      type="button"
                      className="admin-preview-remove"
                      onClick={() => removeGalleryImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Description *</label>
            <textarea
              className="admin-textarea"
              placeholder="e.g. Round cooking well with 21 liter cooking oil capacity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
            ></textarea>
          </div>

          {/* Features Builder */}
          <div className="admin-form-group">
            <label className="admin-label">Key Features</label>
            <div className="admin-dynamic-list">
              {features.map((feature, index) => (
                <div className="admin-dynamic-row" key={index}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Frying under pressure seals in flavor..."
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
              + Add Feature Bullet Point
            </button>
          </div>

          {/* Specifications Builder */}
          <div className="admin-form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="admin-label">Technical Specifications</label>
            <div className="admin-dynamic-list">
              {specs.map((spec, index) => (
                <div className="admin-dynamic-row" key={index}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Specification Key (e.g. Oil Capacity)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    disabled={loading}
                    style={{ flex: '2' }}
                  />
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Specification Value (e.g. 21 Liters)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    disabled={loading}
                    style={{ flex: '3' }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => removeSpecRow(index)}
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
              onClick={addSpecRow}
              disabled={loading}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              + Add Specification Row
            </button>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <Link to="/admin" className="admin-btn admin-btn-secondary" style={{ minWidth: '100px' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading || imageUploading || galleryUploading}
              style={{ minWidth: '120px' }}
            >
              {loading ? (
                <>
                  <span className="admin-spinner"></span>
                  <span style={{ marginLeft: '6px' }}>Saving...</span>
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
