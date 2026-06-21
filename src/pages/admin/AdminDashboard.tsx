import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

interface ProductRow {
  id: string;
  name: string;
  category: string;
  priority: number;
  image: string;
}

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  // Category labels mappings
  const catLabels: Record<string, string> = {
    'pressure-fryer': 'Pressure Fryer',
    'open-fryer': 'Open / Rack Fryer',
    'massage-tumblers': 'Vacuum Tumbler',
    'others': 'Other Equipment'
  };

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, priority, image')
        .order('priority', { ascending: true });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch products inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const openDeleteModal = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) {
        throw error;
      }

      setSuccessMsg(`Product "${productToDelete.name}" deleted successfully.`);
      // Refresh items list
      setProducts(products.filter(p => p.id !== productToDelete.id));
      closeDeleteModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete the product.');
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

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text)' }}>
                Product Inventory
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
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

          {loading ? (
            <div className="page-loader">
              <div className="admin-spinner" style={{ width: '32px', height: '32px' }}></div>
              <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', border: '1px dashed var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem' }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem', marginBottom: '1.5rem' }}>
                Your database is empty. Click "Add New Product" to populate your catalog.
              </p>
              <Link to="/admin/products/new" className="admin-btn admin-btn-primary" style={{ display: 'inline-flex' }}>
                Add Product
              </Link>
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
                            onClick={() => openDeleteModal(product.id, product.name)}
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
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && productToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal fade-up visible">
            <h3 className="admin-modal-title">Delete Product?</h3>
            <div className="admin-modal-body">
              Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? This operation cannot be undone and will immediately remove this equipment from the live catalogue.
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
