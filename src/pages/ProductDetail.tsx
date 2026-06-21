import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Product } from '../data/products';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'features' | 'specs'>('features');
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [isImgFading, setIsImgFading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // States for dynamic fetching
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Category labels for breadcrumbs
  const catLabels: Record<string, string> = {
    'pressure-fryer': 'Pressure Fryers',
    'open-fryer': 'Open / Rack Fryers',
    'massage-tumblers': 'Vacuum Tumblers',
    'others': 'Other Equipment'
  };

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        // 1. Fetch current product
        const { data: currentProduct, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;

        if (currentProduct) {
          setProduct(currentProduct);
          setCurrentImgIndex(0);

          // 2. Fetch related recommendations
          const { data: relatedProducts, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category', currentProduct.category)
            .neq('id', currentProduct.id)
            .order('priority', { ascending: true })
            .limit(4);

          if (relatedError) {
            console.error('Error fetching related products:', relatedError);
          } else {
            setRelated(relatedProducts || []);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to retrieve product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );

        document.querySelectorAll('.fade-up').forEach((el) => {
          observer.observe(el);
        });

        return () => observer.disconnect();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    const lens = lensRef.current;
    const result = resultRef.current;
    if (!container || !lens || !result || !product) return;

    const rect = container.getBoundingClientRect();
    const x = e.pageX - rect.left - window.scrollX;
    const y = e.pageY - rect.top - window.scrollY;

    let lensX = x - (lens.offsetWidth / 2);
    let lensY = y - (lens.offsetHeight / 2);

    // Boundary limits
    if (lensX > container.offsetWidth - lens.offsetWidth) {
      lensX = container.offsetWidth - lens.offsetWidth;
    }
    if (lensX < 0) lensX = 0;
    
    if (lensY > container.offsetHeight - lens.offsetHeight) {
      lensY = container.offsetHeight - lens.offsetHeight;
    }
    if (lensY < 0) lensY = 0;

    lens.style.left = lensX + "px";
    lens.style.top = lensY + "px";

    // Zoom factor calculation
    const cx = result.offsetWidth / lens.offsetWidth;
    const cy = result.offsetHeight / lens.offsetHeight;

    result.style.backgroundPosition = `-${lensX * cx}px -${lensY * cy}px`;
    result.style.backgroundSize = `${container.offsetWidth * cx}px ${container.offsetHeight * cy}px`;
  };

  if (loading) {
    return (
      <div className="page-loader" style={{ minHeight: '80vh' }}>
        <div className="admin-spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ marginTop: '1rem', fontStyle: 'italic', letterSpacing: '0.05em' }}>Loading Product Details...</p>
      </div>
    );
  }

  if (errorMsg || !product) {
    const isNotFoundError = errorMsg?.includes('multiple or no rows') || errorMsg?.includes('coerce');
    const displayMsg = isNotFoundError
      ? 'The requested product could not be found. It may have been removed or does not exist.'
      : (errorMsg || 'Product not found.');

    return (
      <div className="page-loader" style={{ minHeight: '80vh', padding: '0 2rem', textAlign: 'center' }}>
        <div className="admin-alert admin-alert-error" style={{ maxWidth: '450px', margin: '0 auto', textAlign: 'center' }}>
          {displayMsg}
        </div>
        <Link to="/products" className="admin-btn admin-btn-primary" style={{ marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Back to Products
        </Link>
      </div>
    );
  }

  const galleryImages = Array.isArray(product.images) && product.images.length
    ? product.images
    : [product.image, product.image, product.image];

  const handleThumbClick = (index: number) => {
    if (index === currentImgIndex) return;
    setIsImgFading(true);
    setTimeout(() => {
      setCurrentImgIndex(index);
      setIsImgFading(false);
    }, 200);
  };


  return (
    <main>
      {/* Subpage Breadcrumbs Section */}
      <section className="breadcrumbs-nav">
        <div className="container">
          <ul className="breadcrumb-list">
            <li><Link to="/">Home</Link></li>
            <li><span className="sep">/</span></li>
            <li><Link to="/products">Products</Link></li>
            <li><span className="sep">/</span></li>
            <li>
              <Link to={`/products?category=${product.category}`}>
                {catLabels[product.category] || product.category}
              </Link>
            </li>
            <li><span className="sep">/</span></li>
            <li className="active">{product.name}</li>
          </ul>
        </div>
      </section>

      {/* Product Detail Presentation Section */}
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="pd-grid">
            
            {/* Product Left side (Gallery & Magnifier) */}
            <div className="pd-gallery-wrap">
              <div
                className="pd-zoom-container fade-up"
                id="pd-zoom-container"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomActive(true)}
                onMouseLeave={() => setIsZoomActive(false)}
              >
                <img
                  id="pd-image"
                  src={galleryImages[currentImgIndex]}
                  alt={product.name}
                  style={{
                    opacity: isImgFading ? 0 : 1,
                    transform: isImgFading ? 'scale(0.97)' : 'scale(1)',
                    transition: 'opacity 0.2s, transform 0.2s'
                  }}
                />
                <div
                  id="pd-zoom-lens"
                  ref={lensRef}
                  style={{ opacity: isZoomActive ? 1 : 0, transition: 'opacity 0.2s' }}
                />
              </div>
              
              {/* Zoom Result Container */}
              <div
                id="pd-zoom-result"
                ref={resultRef}
                className="pd-zoom-result shadow-lg rounded-4"
                style={{
                  opacity: isZoomActive ? 1 : 0,
                  transition: 'opacity 0.2s',
                  backgroundImage: `url('${galleryImages[currentImgIndex]}')`
                }}
              />
              
              {/* Gallery Thumbnails */}
              <div className="pd-thumb-list fade-up" id="pd-thumbs">
                {galleryImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className={`pd-thumb ${i === currentImgIndex ? 'active' : ''}`}
                    onClick={() => handleThumbClick(i)}
                    alt={`${product.name} View ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Product Right side (Information Tabs) */}
            <div className="pd-info-wrap fade-up">
              <h1 className="pd-title" id="pd-title">{product.name}</h1>
              <p className="pd-desc" id="pd-desc">{product.description}</p>

              <div className="line-accent" style={{ margin: '2rem 0 1.5rem 0' }}></div>

              {/* Tab Buttons */}
              <div className="pd-tabs-nav">
                <button
                  className={`pd-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                  onClick={() => setActiveTab('features')}
                >
                  Features
                </button>
                <button
                  className={`pd-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
              </div>

              {/* Features panel */}
              <div className={`pd-tab-panel ${activeTab === 'features' ? 'active' : ''}`}>
                <ul className="fp-features" style={{ margin: '1.5rem 0 0 0' }}>
                  {product.features.map((f, index) => (
                    <li key={index}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Specs panel */}
              <div className={`pd-tab-panel ${activeTab === 'specs' ? 'active' : ''}`}>
                <table className="pd-specs-table" style={{ marginTop: '1.5rem' }}>
                  <tbody>
                    {Object.entries(product.specs).map(([key, val]) => (
                      <tr key={key}>
                        <th>{key}</th>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action buttons */}
              <div className="hero-btns" style={{ marginTop: '3rem' }}>
                <Link to="/contact" className="btn-primary">Contact Sales</Link>
                <Link to="/quote" className="btn-outline">Request a Quote</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Related Products Gallery Section */}
      <section className="section" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div className="container">
          <div className="eyebrow fade-up">
            <span></span> Recommendations
          </div>
          <h3 className="section-title fade-up" style={{ fontSize: '2.8rem', marginBottom: '3rem', lineHeight: 1 }}>
            RELATED PRODUCTS
          </h3>
          
          <div className="products-grid fade-up" id="related-products">
            {related.length === 0 ? (
              <div className="col-12 text-center text-muted py-4">
                <p>No related products found.</p>
              </div>
            ) : (
              related.map(p => (
                <Link className="product-card" to={`/products/${p.id}`} key={p.id}>
                  <div className="product-card-img">
                    <img src={p.image} alt={p.name} loading="lazy" />
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-cat">{catLabels[p.category] || p.category}</div>
                    <div className="product-card-name">{p.name}</div>
                    <div className="product-card-desc">
                      {p.description.length > 60 ? `${p.description.substring(0, 60)}...` : p.description}
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
