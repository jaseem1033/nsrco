import React from 'react';
import { StatsCounter } from '../components/StatsCounter';

export const About: React.FC = () => {
  return (
    <main>
      {/* Subpage Banner Header */}
      <section className="subpage-banner">
        <div className="container text-center">
          <div className="eyebrow fade-up">
            <span></span> Est. 2006
          </div>
          <h1 className="banner-title fade-up">ABOUT US</h1>
          <p className="banner-subtitle fade-up">Building the future of commercial kitchens with engineering excellence</p>
        </div>
      </section>

      {/* Detailed Story Section */}
      <section id="about" className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-img-wrap fade-up">
              <img src="/images/comapany-image-2.webp" alt="NSRCO manufacturing workshop setup" />
              <div className="about-img-badge">
                <div className="num">19+</div>
                <div className="lbl">Years of<br />Excellence</div>
              </div>
            </div>
            <div className="about-body">
              <div className="eyebrow fade-up">
                <span></span> Our Story
              </div>
              <h2 className="section-title fade-up">
                BUILT ON<br /><em>Precision</em>
              </h2>
              <div className="line-accent" style={{ margin: '1.5rem 0' }}></div>
              <p className="fade-up">NSR Company was established in 2006 in Kerala, India, pioneering local manufacturing processes to meet the regional industry's growing equipment requirements. From modest origins, we developed a system of engineering rigor.</p>
              <p className="fade-up">Over the decades, we have aligned our manufacturing controls with European compliance rules, selecting high-durability metals to maintain performance. Currently, we offer an expansive variety of premium machinery for bakery and restaurant professionals.</p>
              <p className="fade-up">Our growth is built on the confidence our customers place in us. We have cultivated an ambitious team dedicated to continuous improvement and customer satisfaction. We strive to contribute to the wheel of national development in the industrial sector and the growth of the Indian economy.</p>
              
              <div className="about-pillars fade-up" style={{ marginTop: '3rem' }}>
                <div className="pillar">
                  <div className="pillar-icon">⚙️</div>
                  <h4>Quality Assurance</h4>
                  <p>European-grade components designed to perform under demanding operational volumes.</p>
                </div>
                <div className="pillar">
                  <div className="pillar-icon">🎯</div>
                  <h4>Customer Focus</h4>
                  <p>We work collaboratively to create custom layouts that optimize workspace throughput.</p>
                </div>
                <div className="pillar">
                  <div className="pillar-icon">💡</div>
                  <h4>Innovation</h4>
                  <p>Integrating heat insulation and recovery designs to yield significant energy savings.</p>
                </div>
                <div className="pillar">
                  <div className="pillar-icon">🔧</div>
                  <h4>After-Sales</h4>
                  <p>Rapid localized support, setup training, and routine preventative care plans.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Counter Achievements Row */}
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
    </main>
  );
};
