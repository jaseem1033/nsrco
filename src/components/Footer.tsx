import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Category } from '../data/dbTypes';

export const Footer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('priority', { ascending: true })
          .limit(4);
        if (!error && data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories for footer:', err);
      }
    };
    fetchTopCategories();
  }, []);

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo" style={{ marginBottom: '1.5rem' }}>
              <img src="/assets/LOGO-W.png" alt="NSRCO Logo" className="logo-img" />
            </Link>
            <p>Professional commercial kitchen hardware built to European specifications. Supporting baking and restaurant sectors across India since 2006.</p>
          </div>
          <div className="footer-col">
            <h5>Navigation</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Products</h5>
            <ul>
              {categories.length > 0 ? (
                categories.map(cat => (
                  <li key={cat.id}>
                    <Link to={`/products?category=${cat.id}`}>{cat.name}</Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/products?category=pressure-fryer">Pressure Fryers</Link></li>
                  <li><Link to="/products?category=open-fryer">Open / Rack Fryers</Link></li>
                  <li><Link to="/products?category=massage-tumblers">Vacuum Tumblers</Link></li>
                  <li><Link to="/products?category=others">Other Equipment</Link></li>
                </>
              )}
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem', display: 'block', marginBottom: '0.4rem' }}>
                  Office:
                </span>
                +91 7593899929
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem', display: 'block', marginTop: '0.6rem', marginBottom: '0.4rem' }}>
                  Email:
                </span>
                info@nsrcogroup.com
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 NSRCO. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
