import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsCounter } from '../components/StatsCounter';
import { supabase } from '../supabaseClient';
import type { FeaturedProduct, Category } from '../data/dbTypes';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroImage, setHeroImage] = useState('/images/nsrco-hero.webp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // Fetch featured banners
        const { data: featuredData, error: featuredError } = await supabase
          .from('featured_products')
          .select('*')
          .order('priority', { ascending: true });

        if (featuredError) throw featuredError;
        setFeaturedProducts(featuredData || []);

        // Fetch categories for homepage browse section
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('show_on_homepage', true);

        if (!categoriesError && categoriesData) {
          setCategories(categoriesData);
        }

        // Fetch site hero image settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('homepage_settings')
          .select('*');

        if (!settingsError && settingsData) {
          const heroSetting = settingsData.find(item => item.key === 'hero_image');
          if (heroSetting && heroSetting.value) {
            setHeroImage(heroSetting.value);
          }
        }
      } catch (err: any) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

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
  return (
    <main>
      {/* Hero Section */}
      <section id="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span></span> Kerala, India — Est. 2006
          </div>
          <h1 className="hero-h1">
            KITCHEN<br />
            <em>BUILT</em><br />
            RIGHT
          </h1>
          <p className="hero-sub">
            Premium commercial kitchen equipment — precision-engineered pressure fryers, vacuum tumblers, and
            open fryers built to European specifications for F&B professionals.
          </p>
          <div className="hero-btns">
            <Link to="/products" className="btn-primary">Explore Equipment</Link>
            <Link to="/quote" className="btn-outline">Get a Quote</Link>
          </div>
        </div>
        <div className="hero-right">
          <img src={heroImage} alt="Commercial kitchen layout with premium gear" />
        </div>
        <a href="#about" className="hero-scroll">Scroll to explore</a>
      </section>

      {/* Scrolling Text Ticker */}
      <div className="ticker-wrap">
        <div className="ticker">
          <span>PRESSURE FRYERS</span><span className="dot">◆</span>
          <span>VACUUM TUMBLERS</span><span className="dot">◆</span>
          <span>RACK FRYERS</span><span className="dot">◆</span>
          <span>COMMERCIAL KITCHENS</span><span className="dot">◆</span>
          <span>EUROPEAN SPEC</span><span className="dot">◆</span>
          <span>KERALA, INDIA</span><span className="dot">◆</span>
          <span>SINCE 2006</span><span className="dot">◆</span>
          {/* Duplicated segment for continuous marquee loop effect */}
          <span>PRESSURE FRYERS</span><span className="dot">◆</span>
          <span>VACUUM TUMBLERS</span><span className="dot">◆</span>
          <span>RACK FRYERS</span><span className="dot">◆</span>
          <span>COMMERCIAL KITCHENS</span><span className="dot">◆</span>
          <span>EUROPEAN SPEC</span><span className="dot">◆</span>
          <span>KERALA, INDIA</span><span className="dot">◆</span>
          <span>SINCE 2006</span><span className="dot">◆</span>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-img-wrap fade-up">
              <img src="/images/comapany-image.webp" alt="Engineers working on kitchen hardware manufacturing at NSRCO Factory" />
              <div className="about-img-badge">
                <div className="num">19+</div>
                <div className="lbl">Years of<br />Excellence</div>
              </div>
            </div>
            <div className="about-body">
              <div className="eyebrow fade-up">
                <span></span> About Our Company
              </div>
              <h2 className="section-title fade-up">
                Professional solutions for<br /><em>safe & efficient kitchens</em>
              </h2>
              <div className="line-accent" style={{ margin: '1.5rem 0' }}></div>
              <p className="fade-up">
                NSR Company was established in 2006 in Kerala, India. We ventured into local
                manufacturing to meet the market’s growing demand for industrial development. As pioneers in
                this field, we started with humble beginnings and basic production capabilities. Over the
                years, we have upgraded our manufacturing standards to meet European specifications, utilizing
                high-quality materials to ensure excellence for our customers. Today, we offer a comprehensive
                range of equipment serving the Food and Bakery (F&B) sector.
              </p>
              <p className="fade-up">
                Our growth is built on the confidence our customers place in us. We have
                cultivated an ambitious team dedicated to continuous improvement and customer satisfaction.
                We strive to contribute to the wheel of national development in the industrial sector and the
                growth of the Indian economy.
              </p>

              <div style={{ marginTop: '2rem' }}>
                <Link to="/about" className="btn-primary fade-up">Read More</Link>
              </div>

              <div className="about-pillars fade-up" style={{ marginTop: '3rem' }}>
                <div className="pillar">
                  <div className="pillar-icon">⚙️</div>
                  <h4>Quality Assurance</h4>
                  <p>We source only the finest materials and equipment to ensure longevity and performance in demanding kitchen environments.</p>
                </div>
                <div className="pillar">
                  <div className="pillar-icon">🎯</div>
                  <h4>Customer Focus</h4>
                  <p>Your success is our priority. We work closely with you to understand your unique needs and deliver tailored solutions.</p>
                </div>
                <div className="pillar">
                  <div className="pillar-icon">💡</div>
                  <h4>Innovation</h4>
                  <p>We stay ahead of industry trends to bring you the latest technologies and energy-efficient designs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured-products" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '4rem' }}>
            <div className="eyebrow fade-up" style={{ justifyContent: 'center' }}>
              <span></span> Featured Products
            </div>
            <h2 className="section-title fade-up">
              FLAGSHIP EQUIPMENT FOR<br /><em>High-Output Kitchens</em>
            </h2>
            <p style={{ color: 'var(--text-sub)', maxWidth: '600px', margin: '1rem auto 0', lineHeight: 1.6 }} className="fade-up">
              Our most requested systems engineered for speed, thermal consistency, and chef safety.
            </p>
          </div>

          {/* Dynamic Featured Products List */}
          {loading ? (
            <div className="text-center py-5">
              <div className="admin-spinner" style={{ width: '32px', height: '32px' }}></div>
              <p style={{ marginTop: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading featured systems...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-5" style={{ border: '1px dashed var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', opacity: 0.7 }}>
              <p style={{ color: 'var(--text-muted)' }}>No featured products selected. Create banners inside the Admin Dashboard.</p>
            </div>
          ) : (
            featuredProducts.map(p => (
              <div className="featured-product-layout fade-up" key={p.id}>
                <div className="fp-img">
                  <img src={p.image} alt={p.title} loading="lazy" />
                </div>
                <div className="fp-body">
                  <div className="eyebrow">
                    <span></span> Featured Equipment
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  {p.features && p.features.length > 0 && (
                    <ul className="fp-features">
                      {p.features.slice(0, 4).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                  {p.product_id ? (
                    <Link to={`/products/${p.product_id}`} className="btn-primary" style={{ alignSelf: 'flex-start' }}>Explore Product</Link>
                  ) : (
                    <Link to="/products" className="btn-primary" style={{ alignSelf: 'flex-start' }}>View Catalog</Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section">
        <div className="container">
          <div className="services-grid">
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="eyebrow">
                <span></span> Our Services
              </div>
              <h2 className="section-title">EQUIPMENT FOR EVERY<br /><em>Kitchen Need</em></h2>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.75 }}>
                From initial concept to final installation and ongoing maintenance, we provide end-to-end
                solutions for your commercial kitchen. Our expert team ensures your operations run smoothly and
                efficiently.
              </p>
              <div>
                <Link to="/services" className="btn-primary">All Services</Link>
              </div>
            </div>

            {/* Services Cards Grid */}
            <div className="services-cards fade-up">
              <div className="service-card">
                <div className="service-icon">🏢</div>
                <h4>Commercial Kitchens</h4>
                <p>Design, supply, and install full-line commercial kitchen equipment for restaurants and hotels.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">🛠️</div>
                <h4>Site Management</h4>
                <p>On-site supervision, installation, and commissioning to ensure quality and safety.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">🔧</div>
                <h4>Preventive Care</h4>
                <p>Scheduled PMs, emergency callouts, and OEM parts to keep uptime high and compliance on track.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">📚</div>
                <h4>Training & Handover</h4>
                <p>Staff training on safe operation, cleaning protocols, and daily checks to extend equipment life.</p>
              </div>
            </div>
          </div>

          {/* Process Timeline Horizontal */}
          <div className="process-section fade-up" style={{ borderTop: '1px solid var(--border)', paddingTop: '4rem', marginTop: '4rem' }}>
            <div className="text-center" style={{ marginBottom: '3.5rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>
                <span></span> Our Process
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                How we bring your kitchen to life
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', textAlign: 'center' }}>
              <div className="process-step-col">
                <div className="step-num" style={{ textAlign: 'center', marginBottom: '0.8rem', color: 'var(--orange)' }}>01</div>
                <div className="step-content">
                  <h4 style={{ fontSize: '1.05rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text)' }}>Consultation</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px', margin: '0 auto' }}>
                    We discuss your needs, budget, and vision.
                  </p>
                </div>
              </div>
              <div className="process-step-col">
                <div className="step-num" style={{ textAlign: 'center', marginBottom: '0.8rem', color: 'var(--orange)' }}>02</div>
                <div className="step-content">
                  <h4 style={{ fontSize: '1.05rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text)' }}>Design</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px', margin: '0 auto' }}>
                    Our experts create a custom layout for efficiency.
                  </p>
                </div>
              </div>
              <div className="process-step-col">
                <div className="step-num" style={{ textAlign: 'center', marginBottom: '0.8rem', color: 'var(--orange)' }}>03</div>
                <div className="step-content">
                  <h4 style={{ fontSize: '1.05rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text)' }}>Installation</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px', margin: '0 auto' }}>
                    Professional setup and testing of all equipment.
                  </p>
                </div>
              </div>
              <div className="process-step-col">
                <div className="step-num" style={{ textAlign: 'center', marginBottom: '0.8rem', color: 'var(--orange)' }}>04</div>
                <div className="step-content">
                  <h4 style={{ fontSize: '1.05rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text)' }}>Support</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px', margin: '0 auto' }}>
                    Ongoing maintenance and training for your staff.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section id="browse-categories" className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }} className="fade-up">
            <div>
              <div className="eyebrow">
                <span></span> Browse by Category
              </div>
              <h2 className="section-title" style={{ margin: '0.5rem 0 0' }}>
                Explore Our<br /><em>Equipment Range</em>
              </h2>
            </div>
            <div>
              <Link to="/products" className="btn-primary">View All Products</Link>
            </div>
          </div>

          <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {categories.length === 0 ? (
              <div className="col-12 text-center text-white py-4" style={{ gridColumn: '1 / -1', opacity: 0.7 }}>
                <p>No categories visible on homepage. Configure categories in the Admin Dashboard.</p>
              </div>
            ) : (
              categories.map(cat => (
                <Link className="product-card" to={`/products?category=${cat.id}`} key={cat.id}>
                  <div className="product-card-img" style={{ aspectRatio: '1/1' }}>
                    <img 
                      src={cat.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200&auto=format&fit=crop'} 
                      alt={cat.name} 
                      loading="lazy" 
                    />
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-cat">Category</div>
                    <div className="product-card-name">{cat.name}</div>
                    <div className="product-card-desc">
                      {cat.description || 'Explore our custom engineering hardware.'}
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

      {/* Achievements / Impact Section */}
      <section id="achievements" className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <div className="eyebrow fade-up" style={{ justifyContent: 'center' }}>
              <span></span> Our Impact
            </div>
            <h2 className="section-title fade-up">
              Growing with every<br /><em>kitchen we build</em>
            </h2>
          </div>
        </div>
        <div className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item fade-up">
                <div className="stat-num">
                  <StatsCounter target={1500} />+
                </div>
                <div className="stat-label">Products Sold</div>
              </div>
              <div className="stat-item fade-up">
                <div className="stat-num">
                  <StatsCounter target={50} />+
                </div>
                <div className="stat-label">Service Locations</div>
              </div>
              <div className="stat-item fade-up">
                <div className="stat-num">
                  <StatsCounter target={200} />+
                </div>
                <div className="stat-label">Projects Completed</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
