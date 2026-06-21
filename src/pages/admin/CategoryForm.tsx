import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export const CategoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Form Fields State
  const [catName, setCatName] = useState('');
  const [catId, setCatId] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [showOnHomepage, setShowOnHomepage] = useState(true);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [imageUploading, setImageUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-slugify helper for New Category ID
  useEffect(() => {
    if (!isEditMode && catName) {
      const slug = catName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setCatId(slug);
    }
  }, [catName, isEditMode]);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!isEditMode || !id) return;
      setFetchLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setCatName(data.name || '');
          setCatId(data.id || '');
          setImage(data.image || '');
          setDescription(data.description || '');
          setShowOnHomepage(data.show_on_homepage ?? true);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load category details.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCategoryDetails();
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
      const filePath = `categories/${fileName}`;

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
      setErrorMsg(err.message || 'An error occurred during category image upload.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanedId = catId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (!cleanedId) {
      setErrorMsg('Category ID is required.');
      setLoading(false);
      return;
    }

    const payload = {
      id: cleanedId,
      name: catName.trim(),
      image: image.trim() || null,
      description: description.trim() || null,
      show_on_homepage: showOnHomepage,
    };

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: payload.name,
            image: payload.image,
            description: payload.description,
            show_on_homepage: payload.show_on_homepage
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([payload]);

        if (error) throw error;
      }

      navigate('/admin?tab=categories');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the category.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="page-loader">
        <div className="admin-spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving category details...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          NSRCO <span className="admin-badge">{isEditMode ? 'Edit Category' : 'Add Category'}</span>
        </div>
        <div className="admin-nav-links">
          <Link to="/admin?tab=categories" className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
            Back to Dashboard
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
            {isEditMode ? 'Modify Category Specifications' : 'Create New Equipment Category'}
          </h2>

          <div className="admin-form-group">
            <label className="admin-label">Category Name *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g. Combi Ovens"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Category System ID (Slug) *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g. combi-ovens"
              value={catId}
              onChange={(e) => setCatId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required
              disabled={isEditMode || loading}
              style={{ fontFamily: 'monospace' }}
            />
            {!isEditMode && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Autogenerated from name. Used as category identifier in URL query params.
              </span>
            )}
          </div>

          {/* Category Image Section */}
          <div className="admin-form-group">
            <label className="admin-label">Category Image (Square Layout Recommended)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="https://... or /images/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  disabled={loading}
                  style={{ marginBottom: '1rem' }}
                />
                
                <div className="admin-file-picker">
                  {imageUploading ? (
                    <div style={{ padding: '0.5rem 0' }}>
                      <span className="admin-spinner"></span>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploading image...</p>
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
                <div style={{ width: '130px', textAlign: 'center' }}>
                  <label className="admin-label">Preview</label>
                  <img
                    src={image}
                    alt="Category representation preview"
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
            <label className="admin-label">Category Description</label>
            <textarea
              className="admin-textarea"
              placeholder="e.g. High-efficiency ovens combining steam and convection heat for high-volume bakery and kitchen usage."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={{ minHeight: '80px' }}
            ></textarea>
          </div>

          {/* Show on homepage toggle */}
          <div className="admin-form-group">
            <label className="admin-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={showOnHomepage}
                onChange={(e) => setShowOnHomepage(e.target.checked)}
                disabled={loading}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.95rem' }}>
                Display in "Browse by Category" section on the Homepage
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <Link to="/admin?tab=categories" className="admin-btn admin-btn-secondary" style={{ minWidth: '100px' }}>
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
                'Save Category'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
