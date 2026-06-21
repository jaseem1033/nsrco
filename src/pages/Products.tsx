import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Product } from '../data/products';
import type { Category } from '../data/dbTypes';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Construct dynamic category labels mappings
  const catLabels = React.useMemo(() => {
    const labels: Record<string, string> = {};
    categories.forEach(cat => {
      labels[cat.id] = cat.name;
    });
    return labels;
  }, [categories]);

  useEffect(() => {
    const fetchCatalogAndCategories = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // 1. Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('priority', { ascending: true });

        if (catError) throw catError;
        setCategories(catData || []);

        // 2. Fetch products
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('priority', { ascending: true });

        if (prodError) throw prodError;
        setProducts(prodData || []);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to retrieve products. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogAndCategories();
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
          <div className="category-tabs fade-up" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button
              className={`cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleTabClick('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleTabClick(cat.id)}
              >
                {cat.name}
              </button>
            ))}
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
