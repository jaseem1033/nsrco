import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <main>
      {/* Subpage Banner Header */}
      <section className="subpage-banner">
        <div className="container text-center">
          <h1 className="banner-title fade-up">PRIVACY POLICY</h1>
          <p className="banner-subtitle fade-up">Last updated: June 21, 2026</p>
        </div>
      </section>

      {/* Content Block */}
      <section className="section" style={{ background: 'var(--bg2)' }}>
        <div className="container">
          <div className="row justify-content-center" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="col-lg-8 fade-up privacy-text" style={{ maxWidth: '800px', width: '100%' }}>
              <h2>1. Introduction</h2>
              <p>Welcome to NSRCO ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at info@nsrcogroup.com.</p>
              <p>When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy policy, we seek to explain to you in the clearest way possible what information we collect, how we use it, and what rights you have in relation to it.</p>

              <h2>2. Information We Collect</h2>
              <p>We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services, when participating in activities on the Website or otherwise contacting us.</p>
              <p>The personal information we collect depends on the context of your interactions with us and the Website, the choices you make, and the features you use. The personal information we collect can include the following:</p>
              <ul>
                <li><strong>Name and Contact Data:</strong> We collect your first and last name, email address, phone number, and other similar contact details.</li>
                <li><strong>Project Specifications:</strong> We collect info regarding commercial kitchen designs, timeline expectations, budget fields, and specific product interests you submit in our forms.</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
              <ul>
                <li>To send you administrative or inquiry follow-up details regarding products and quotes.</li>
                <li>To fulfill and manage layout installations, setup commissions, and training support plans.</li>
                <li>To gather statistics to evaluate our product impacts and improve kitchen designs.</li>
              </ul>

              <h2>4. Sharing Your Information</h2>
              <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal data to third parties.</p>

              <h2>5. Security of Your Information</h2>
              <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

              <h2>6. Contact Us</h2>
              <p>If you have questions or comments about this policy, you may email us at info@nsrcogroup.com or by post to:</p>
              <p style={{ background: 'var(--bg3)', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--text)' }}>
                NSRCO Group<br />
                Kondotty, Malappuram road,<br />
                Musliyarangadi, Kerala 673638, India
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
