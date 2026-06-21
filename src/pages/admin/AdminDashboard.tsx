import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import type { FeaturedProduct, Category } from '../../data/dbTypes';

interface ProductRow {
  id: string;
  name: string;
  category: string;
  priority: number;
  image: string;
}

export const AdminDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'catalog' | 'banners' | 'categories' | 'settings'>(
    (tabParam === 'banners' || tabParam === 'categories' || tabParam === 'settings') ? tabParam : 'catalog'
  );

  // Lists State
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [banners, setBanners] = useState<FeaturedProduct[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Homepage Settings State
  const [heroImage, setHeroImage] = useState('');
  const [aboutHomepageImage, setAboutHomepageImage] = useState('');
  const [aboutStoryImage, setAboutStoryImage] = useState('');

  // Loading States
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form saving / uploading states
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsImageUploading, setSettingsImageUploading] = useState(false);

  // Messages State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Shared Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'product' | 'banner' | 'category'>('product');
  const [itemToDelete, setItemToDelete] = useState<{ id: string | number; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Category Drag & Drop State
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  const [dragEnabledRowId, setDragEnabledRowId] = useState<string | null>(null);

  const navigate = useNavigate();

  // Dynamic Category labels mappings
  const catLabels = React.useMemo(() => {
    const labels: Record<string, string> = {};
    categoriesList.forEach(cat => {
      labels[cat.id] = cat.name;
    });
    return labels;
  }, [categoriesList]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, priority, image')
        .order('priority', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch products inventory.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchBanners = async () => {
    setLoadingBanners(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('featured_products')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch homepage banners.');
    } finally {
      setLoadingBanners(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategoriesList(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch categories list.');
    } finally {
      setLoadingCategories(false);
    }
  };

  // --- Category Drag & Drop Handlers ---
  const handleCatDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedCatIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCatDragOver = (e: React.DragEvent<HTMLTableRowElement>, overIndex: number) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === overIndex) return;

    const updated = [...categoriesList];
    const [draggedItem] = updated.splice(draggedCatIndex, 1);
    updated.splice(overIndex, 0, draggedItem);
    setCategoriesList(updated);
    setDraggedCatIndex(overIndex);
  };

  const handleCatDragEnd = async () => {
    setDraggedCatIndex(null);
    setDragEnabledRowId(null);

    // Batch update priority values in Supabase
    try {
      const updates = categoriesList.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        image: cat.image || null,
        description: cat.description || null,
        show_on_homepage: cat.show_on_homepage ?? true,
        priority: idx + 1,
      }));

      const { error } = await supabase
        .from('categories')
        .upsert(updates);

      if (error) throw error;

      // Update local state with new priority values
      setCategoriesList(prev => prev.map((cat, idx) => ({ ...cat, priority: idx + 1 })));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category ordering.');
      // Re-fetch to restore correct order
      fetchCategories();
    }
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('*');

      if (error) throw error;
      const heroImageSetting = data?.find(item => item.key === 'hero_image');
      if (heroImageSetting) {
        setHeroImage(heroImageSetting.value);
      }
      const aboutHomeSetting = data?.find(item => item.key === 'about_homepage_image');
      if (aboutHomeSetting) {
        setAboutHomepageImage(aboutHomeSetting.value);
      }
      const aboutStorySetting = data?.find(item => item.key === 'about_story_image');
      if (aboutStorySetting) {
        setAboutStoryImage(aboutStorySetting.value);
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchCategories();
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const openDeleteModal = (type: 'product' | 'banner' | 'category', id: string | number, name: string) => {
    setDeleteType(type);
    setItemToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleSettingsImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setSettingsImageUploading(true);

    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const randomStr = Math.random().toString(36).substring(2, 10);
      const fileName = `${Date.now()}-${randomStr}.${fileExt}`;
      const filePath = `settings/${fileName}`;

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
        setter(data.publicUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during image upload.');
    } finally {
      setSettingsImageUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const settingsPayload = [
        { key: 'hero_image', value: heroImage },
        { key: 'about_homepage_image', value: aboutHomepageImage },
        { key: 'about_story_image', value: aboutStoryImage }
      ];

      const { error } = await supabase
        .from('homepage_settings')
        .upsert(settingsPayload);

      if (error) throw error;
      setSuccessMsg('Homepage settings updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update site settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (deleteType === 'product') {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;

        setSuccessMsg(`Product "${itemToDelete.name}" deleted successfully.`);
        setProducts(products.filter(p => p.id !== itemToDelete.id));
      } else if (deleteType === 'banner') {
        const { error } = await supabase
          .from('featured_products')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;

        setSuccessMsg(`Featured banner "${itemToDelete.name}" deleted successfully.`);
        setBanners(banners.filter(b => b.id !== itemToDelete.id));
      } else if (deleteType === 'category') {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;

        setSuccessMsg(`Category "${itemToDelete.name}" deleted successfully.`);
        setCategoriesList(categoriesList.filter(c => c.id !== itemToDelete.id));
      }
      closeDeleteModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete selected item.');
      closeDeleteModal();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Admin Panel Sticky Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          NSRCO <span className="admin-badge">Admin Panel</span>
        </div>
        <div className="admin-nav-links">
          <Link to="/" className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
            View Live Site
          </Link>
          <button onClick={handleLogout} className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="admin-container">
        {successMsg && (
          <div className="admin-alert admin-alert-success" style={{ display: 'flex', justifyContent: 'between' }}>
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto', fontWeight: 'bold' }}>×</button>
          </div>
        )}
        {errorMsg && (
          <div className="admin-alert admin-alert-error" style={{ display: 'flex', justifyContent: 'between' }}>
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto', fontWeight: 'bold' }}>×</button>
          </div>
        )}

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('catalog')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'catalog' ? 'var(--orange)' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'catalog' ? '2px solid var(--orange)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)'
            }}
          >
            Product Inventory
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'banners' ? 'var(--orange)' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'banners' ? '2px solid var(--orange)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)'
            }}
          >
            Homepage Banners
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'categories' ? 'var(--orange)' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'categories' ? '2px solid var(--orange)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)'
            }}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'settings' ? 'var(--orange)' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'settings' ? '2px solid var(--orange)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)'
            }}
          >
            Site Settings
          </button>
        </div>

        {activeTab === 'catalog' && (
          /* --- Catalog Tab View --- */
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)' }}>
                  Product Inventory
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Create, update, and manage your kitchen equipment catalog.
                </p>
              </div>
              <Link to="/admin/products/new" className="admin-btn admin-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Product
              </Link>
            </div>

            {loadingProducts ? (
              <div className="page-loader">
                <div className="admin-spinner" style={{ width: '32px', height: '32px' }}></div>
                <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', border: '1px dashed var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem' }}>No products found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem', marginBottom: '1.5rem' }}>
                  Your product database is empty. Add a product to get started.
                </p>
                <Link to="/admin/products/new" className="admin-btn admin-btn-primary">Add Product</Link>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Thumbnail</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th style={{ width: '100px' }}>Priority</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="admin-img-thumb"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200&auto=format&fit=crop';
                            }}
                          />
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                          <div>{product.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            ID: {product.id}
                          </span>
                        </td>
                        <td>
                          <span className="admin-badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-sub)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                            {catLabels[product.category] || product.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: '500' }}>{product.priority}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Link to={`/admin/products/edit/${product.id}`} className="admin-btn admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                              Edit
                            </Link>
                            <button
                              onClick={() => openDeleteModal('product', product.id, product.name)}
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
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
            )}
          </div>
        )}

        {activeTab === 'banners' && (
          /* --- Banners Tab View --- */
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)' }}>
                  Homepage Banners
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Manage the promotional sliders and links displayed on your homepage.
                </p>
              </div>
              <Link to="/admin/featured/new" className="admin-btn admin-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Homepage Banner
              </Link>
            </div>

            {loadingBanners ? (
              <div className="page-loader">
                <div className="admin-spinner" style={{ width: '32px', height: '32px' }}></div>
                <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading banners...</p>
              </div>
            ) : banners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', border: '1px dashed var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem' }}>No featured banners found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem', marginBottom: '1.5rem' }}>
                  There are no banners currently featured on the homepage. Create one to display.
                </p>
                <Link to="/admin/featured/new" className="admin-btn admin-btn-primary">Add Homepage Banner</Link>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Banner Image</th>
                      <th>Banner Title</th>
                      <th>Linked Product</th>
                      <th style={{ width: '100px' }}>Priority</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr key={banner.id}>
                        <td>
                          <img
                            src={banner.image}
                            alt={banner.title}
                            style={{ width: '90px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200&auto=format&fit=crop';
                            }}
                          />
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                          <div>{banner.title}</div>
                        </td>
                        <td>
                          {banner.product_id ? (
                            <span className="admin-badge" style={{ background: 'var(--orange-dim)', color: 'var(--orange)', border: '1px solid rgba(232,80,10,0.2)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                              🔗 {banner.product_id}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>No product linked</span>
                          )}
                        </td>
                        <td style={{ fontWeight: '500' }}>{banner.priority}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Link to={`/admin/featured/edit/${banner.id}`} className="admin-btn admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                              Edit
                            </Link>
                            <button
                              onClick={() => openDeleteModal('banner', banner.id, banner.title)}
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
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
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          /* --- Categories Tab View --- */
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)' }}>
                  Equipment Categories
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Create and manage equipment categories and their homepage display settings.
                </p>
              </div>
              <Link to="/admin/categories/new" className="admin-btn admin-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Category
              </Link>
            </div>

            {loadingCategories ? (
              <div className="page-loader">
                <div className="admin-spinner" style={{ width: '32px', height: '32px' }}></div>
                <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading categories...</p>
              </div>
            ) : categoriesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', border: '1px dashed var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem' }}>No categories found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem', marginBottom: '1.5rem' }}>
                  No categories have been defined. Create one to get started.
                </p>
                <Link to="/admin/categories/new" className="admin-btn admin-btn-primary">Add Category</Link>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}></th>
                      <th style={{ width: '80px' }}>Image</th>
                      <th>Category Name</th>
                      <th>System ID</th>
                      <th>Homepage Status</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriesList.map((cat, index) => (
                      <tr
                        key={cat.id}
                        draggable={dragEnabledRowId === cat.id}
                        onDragStart={(e) => handleCatDragStart(e, index)}
                        onDragOver={(e) => handleCatDragOver(e, index)}
                        onDragEnd={handleCatDragEnd}
                        className={draggedCatIndex === index ? 'dragging' : ''}
                      >
                        <td
                          className="drag-handle"
                          title="Drag to reorder"
                          style={{ cursor: 'grab' }}
                          onMouseDown={() => setDragEnabledRowId(cat.id)}
                          onMouseUp={() => setDragEnabledRowId(null)}
                        >☰</td>
                        <td>
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="admin-img-thumb"
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200&auto=format&fit=crop';
                              }}
                            />
                          ) : (
                            <div className="admin-img-thumb" style={{ width: '50px', height: '50px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', borderRadius: '4px' }}>📁</div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{cat.name}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cat.id}</td>
                        <td>
                          {cat.show_on_homepage ? (
                            <span className="admin-badge" style={{ background: 'rgba(39,174,96,0.1)', color: '#27ae60', border: '1px solid rgba(39,174,96,0.2)' }}>
                              Visible
                            </span>
                          ) : (
                            <span className="admin-badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                              Hidden
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Link to={`/admin/categories/edit/${cat.id}`} className="admin-btn admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                              Edit
                            </Link>
                            <button
                              onClick={() => openDeleteModal('category', cat.id, cat.name)}
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
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
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          /* --- Site Settings Tab View --- */
          <div className="admin-card">
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)', marginBottom: '1.5rem' }}>
              Site Settings & Images
            </h2>
            
            {loadingSettings ? (
              <div className="page-loader">
                <div className="admin-spinner" style={{ width: '32px', height: '32px' }}></div>
                <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading site settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings}>
                {/* 1. Hero Image */}
                <div className="admin-form-group" style={{ marginBottom: '2.5rem' }}>
                  <label className="admin-label">Homepage Hero Image *</label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                    Configure the primary representation image on the main screen of the client website.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="https://... or /images/..."
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        required
                        disabled={savingSettings}
                        style={{ marginBottom: '1rem' }}
                      />
                      
                      <div className="admin-file-picker">
                        {settingsImageUploading ? (
                          <div style={{ padding: '0.5rem 0' }}>
                            <span className="admin-spinner"></span>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploading...</p>
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
                          onChange={(e) => handleSettingsImageUpload(e, setHeroImage)}
                          disabled={savingSettings || settingsImageUploading}
                        />
                      </div>
                    </div>

                    {heroImage && (
                      <div style={{ width: '220px', textAlign: 'center' }}>
                        <label className="admin-label">Hero Preview</label>
                        <img
                          src={heroImage}
                          alt="Hero cover preview"
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                          onError={(e) => {
                            e.currentTarget.src = '/images/nsrco-hero.webp';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Homepage About Us Image */}
                <div className="admin-form-group" style={{ marginBottom: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                  <label className="admin-label">Homepage "About Our Company" Image *</label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                    Configure the representation image displayed under "About Our Company" section on the homepage.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="https://... or /images/..."
                        value={aboutHomepageImage}
                        onChange={(e) => setAboutHomepageImage(e.target.value)}
                        required
                        disabled={savingSettings}
                        style={{ marginBottom: '1rem' }}
                      />
                      
                      <div className="admin-file-picker">
                        {settingsImageUploading ? (
                          <div style={{ padding: '0.5rem 0' }}>
                            <span className="admin-spinner"></span>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploading...</p>
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
                          onChange={(e) => handleSettingsImageUpload(e, setAboutHomepageImage)}
                          disabled={savingSettings || settingsImageUploading}
                        />
                      </div>
                    </div>

                    {aboutHomepageImage && (
                      <div style={{ width: '220px', textAlign: 'center' }}>
                        <label className="admin-label">About Homepage Preview</label>
                        <img
                          src={aboutHomepageImage}
                          alt="About Company preview"
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                          onError={(e) => {
                            e.currentTarget.src = '/images/comapany-image.webp';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. About Us Page Story Image */}
                <div className="admin-form-group" style={{ marginBottom: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                  <label className="admin-label">About Us Page "Our Story" Image *</label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                    Configure the image displayed in the detailed "Our Story" section on the public About page.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="https://... or /images/..."
                        value={aboutStoryImage}
                        onChange={(e) => setAboutStoryImage(e.target.value)}
                        required
                        disabled={savingSettings}
                        style={{ marginBottom: '1rem' }}
                      />
                      
                      <div className="admin-file-picker">
                        {settingsImageUploading ? (
                          <div style={{ padding: '0.5rem 0' }}>
                            <span className="admin-spinner"></span>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploading...</p>
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
                          onChange={(e) => handleSettingsImageUpload(e, setAboutStoryImage)}
                          disabled={savingSettings || settingsImageUploading}
                        />
                      </div>
                    </div>

                    {aboutStoryImage && (
                      <div style={{ width: '220px', textAlign: 'center' }}>
                        <label className="admin-label">About Story Preview</label>
                        <img
                          src={aboutStoryImage}
                          alt="Our Story preview"
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                          onError={(e) => {
                            e.currentTarget.src = '/images/comapany-image-2.webp';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '2rem' }}>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={savingSettings || settingsImageUploading}
                    style={{ minWidth: '150px' }}
                  >
                    {savingSettings ? (
                      <>
                        <span className="admin-spinner"></span>
                        <span style={{ marginLeft: '6px' }}>Saving Settings...</span>
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && itemToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal fade-up visible">
            <h3 className="admin-modal-title">Delete {deleteType === 'product' ? 'Product' : deleteType === 'banner' ? 'Banner' : 'Category'}?</h3>
            <div className="admin-modal-body">
              Are you sure you want to delete <strong>"{itemToDelete.name}"</strong>? This operation cannot be undone and will immediately remove this item from the server database.
              {deleteType === 'category' && (
                <p style={{ marginTop: '0.6rem', color: '#e74c3c', fontSize: '0.85rem' }}>
                  Warning: Deleting this category will not delete its associated catalog products, but they will be orphaned from this category label.
                </p>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                style={{ minWidth: '100px' }}
              >
                {deleteLoading ? <span className="admin-spinner"></span> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
