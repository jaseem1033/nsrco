import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Product } from '../data/products';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Category label mappings
  const catLabels: Record<string, string> = {
    'pressure-fryer': 'Pressure Fryer',
    'open-fryer': 'Open / Rack Fryer',
    'massage-tumblers': 'Vacuum Tumbler',
    'others': 'Other Equipment'
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('priority', { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to retrieve products. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleTabClick = (category: string) => {
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // Filter and sort products (already ordered by priority from postgres query)
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const sortedProducts = [...filteredProducts];


  return (
    <main>
      {/* Subpage Banner Header */}
      <section className="subpage-banner">
        <div className="container text-center">
          <div className="eyebrow fade-up">
            <span></span> Equipment Range
          </div>
          <h1 className="banner-title fade-up">OUR PRODUCTS</h1>
          <p className="banner-subtitle fade-up">Explore our catalog of premium industrial kitchen systems</p>
        </div>
      </section>

      {/* Products filter dynamic grid */}
      <section id="products" className="section">
        <div className="container">
          
          {/* Tab navigation */}
          <div className="category-tabs fade-up" style={{ justifyContent: 'center' }}>
            <button
              className={`cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleTabClick('all')}
            >
              All
            </button>
            <button
              className={`cat-tab ${activeCategory === 'pressure-fryer' ? 'active' : ''}`}
              onClick={() => handleTabClick('pressure-fryer')}
            >
              Pressure Fryers
            </button>
            <button
              className={`cat-tab ${activeCategory === 'open-fryer' ? 'active' : ''}`}
              onClick={() => handleTabClick('open-fryer')}
            >
              Open / Rack Fryers
            </button>
            <button
              className={`cat-tab ${activeCategory === 'massage-tumblers' ? 'active' : ''}`}
              onClick={() => handleTabClick('massage-tumblers')}
            >
              Vacuum Tumblers
            </button>
            <button
              className={`cat-tab ${activeCategory === 'others' ? 'active' : ''}`}
              onClick={() => handleTabClick('others')}
            >
              Others
            </button>
          </div>

          {/* Dynamic Grid */}
          <div className="products-grid fade-up" id="productsGrid">
            {errorMsg ? (
              <div className="col-12 text-center py-5" style={{ gridColumn: '1 / -1' }}>
                <div className="admin-alert admin-alert-error" style={{ maxWidth: '450px', margin: '0 auto', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              </div>
            ) : loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div className="product-card" style={{ cursor: 'default', opacity: 0.7 }} key={idx}>
                  <div className="product-card-img" style={{ background: 'var(--bg3)', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="admin-spinner" style={{ width: '24px', height: '24px' }}></div>
                  </div>
                  <div className="product-card-body">
                    <div style={{ height: '12px', width: '30%', background: 'var(--bg3)', borderRadius: '3px', marginBottom: '8px' }}></div>
                    <div style={{ height: '20px', width: '70%', background: 'var(--bg3)', borderRadius: '3px', marginBottom: '12px' }}></div>
                    <div style={{ height: '14px', width: '90%', background: 'var(--bg3)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))
            ) : sortedProducts.length === 0 ? (
              <div className="col-12 text-center text-white py-5" style={{ gridColumn: '1 / -1' }}>
                <p>No products found in this category.</p>
              </div>
            ) : (
              sortedProducts.map(p => (
                <Link className="product-card" to={`/products/${p.id}`} key={p.id}>
                  <div className="product-card-img">
                    <img src={p.image} alt={p.name} loading="lazy" />
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-cat">{catLabels[p.category] || p.category}</div>
                    <div className="product-card-name">{p.name}</div>
                    <div className="product-card-desc">
                      {p.description.length > 80 ? `${p.description.substring(0, 80)}...` : p.description}
                    </div>
                  </div>
                  <div className="product-card-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
