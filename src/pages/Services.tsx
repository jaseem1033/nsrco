import React from 'react';
import { Link } from 'react-router-dom';

export const Services: React.FC = () => {
  return (
    <main>
      {/* Subpage Banner Header */}
      <section className="subpage-banner">
        <div className="container text-center">
          <div className="eyebrow fade-up">
            <span></span> Professional layouts
          </div>
          <h1 className="banner-title fade-up">OUR SERVICES</h1>
          <p className="banner-subtitle fade-up">Comprehensive support for industrial commercial setups</p>
        </div>
      </section>

      {/* Detailed Services Content */}
      <section id="services" className="section">
        <div className="container">
          <div className="services-grid">
            <div>
              <div className="eyebrow fade-up">
                <span></span> What We Do
              </div>
              <h2 className="section-title fade-up">
                END-TO-END<br /><em>Service</em>
              </h2>
              <div className="line-accent" style={{ margin: '1.5rem 0' }}></div>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '2rem' }} className="fade-up">
                From layout blueprint consultation to hardware setup and routine calibration, we provide comprehensive project delivery.
              </p>
              
              {/* Process Step Timeline */}
              <div className="process-timeline fade-up">
                <div className="process-step">
                  <div className="step-num">01</div>
                  <div className="step-content">
                    <h4>Consultation</h4>
                    <p>Analyzing kitchen blueprints, expected load levels, and budget bounds to structure requirements.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="step-num">02</div>
                  <div className="step-content">
                    <h4>Design</h4>
                    <p>Drafting custom physical configurations to optimize chef workflow efficiency and local compliance.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="step-num">03</div>
                  <div className="step-content">
                    <h4>Installation</h4>
                    <p>Supervising technical setup, element calibration, and safety validation cycles at your location.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="step-num">04</div>
                  <div className="step-content">
                    <h4>Ongoing Support</h4>
                    <p>Preventative checkups, OEM component provisioning, and operational staff safety training.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid Cards */}
            <div className="services-cards fade-up">
              <div className="service-card">
                <div className="service-icon">🏢</div>
                <h4>Commercial Kitchens</h4>
                <p>Turnkey kitchen designs, utility mappings, and premium hardware setup for hotels and restaurants.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">🛠️</div>
                <h4>Site Management</h4>
                <p>On-site engineer verification during installations to confirm hardware alignment and power checks.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">🔧</div>
                <h4>Preventative Care</h4>
                <p>Custom maintenance programs designed to limit hardware downtime and maximize part lifecycles.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">📚</div>
                <h4>Staff Onboarding</h4>
                <p>Providing kitchen crews hands-on training for daily cleaning, filter swaps, and operating safety.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAs Area */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container text-center fade-up">
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '4rem clamp(1.5rem, 4vw, 3rem)', borderRadius: '8px' }}>
            <h2 className="section-title" style={{ fontSize: '2.8rem', marginBottom: '1.5rem' }}>
              Have a project in mind?
            </h2>
            <p style={{ color: 'var(--text-sub)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
              Let us plan, design, and install the perfect kitchen layout custom configured for your commercial requirements.
            </p>
            <div className="hero-btns" style={{ justifyContent: 'center' }}>
              <Link to="/contact" className="btn-primary">Consult an Engineer</Link>
              <Link to="/quote" className="btn-outline">Request a Quote</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
