import React, { useState } from 'react';
import { SuccessModal } from '../components/SuccessModal';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Map element ids (fname, femail, fphone, fsubject, fmessage) to state keys
    const stateKeyMap: Record<string, string> = {
      fname: 'name',
      fphone: 'phone',
      femail: 'email',
      fsubject: 'subject',
      fmessage: 'message'
    };
    const key = stateKeyMap[id];
    if (key) {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedName(formData.name);
    setIsModalOpen(true);

    const bodyText = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`;
    const mailtoLink = `mailto:info@nsrcogroup.com?subject=${encodeURIComponent(formData.subject || 'Inquiry')}&body=${encodeURIComponent(bodyText)}`;

    setTimeout(() => {
      window.location.href = mailtoLink;
    }, 2000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <main>
      {/* Subpage Banner Header */}
      <section className="subpage-banner">
        <div className="container text-center">
          <div className="eyebrow fade-up">
            <span></span> Get in touch
          </div>
          <h1 className="banner-title fade-up">CONTACT US</h1>
          <p className="banner-subtitle fade-up">We'd love to discuss your commercial project layout</p>
        </div>
      </section>

      {/* Contact & Consultation Form */}
      <section id="contact" className="section" style={{ background: 'var(--bg2)' }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info fade-up">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--text)', lineHeight: 1, marginBottom: '1.5rem' }}>
                GET IN TOUCH
              </h2>
              <p>Tell us about your upcoming facility layout or replacement needs. Our engineers will follow up with complete pricing and design models.</p>
              
              <div className="contact-items" style={{ marginTop: '3rem' }}>
                <div className="contact-item">
                  <div className="contact-icon" aria-hidden="true">📍</div>
                  <div className="contact-item-text">
                    <h5>Head Office</h5>
                    <p>Kondotty, Malappuram road,<br />Musliyarangadi, Kerala 673638</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon" aria-hidden="true">📞</div>
                  <div className="contact-item-text">
                    <h5>Phone</h5>
                    <p>+91 7593899929</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon" aria-hidden="true">✉️</div>
                  <div className="contact-item-text">
                    <h5>Email</h5>
                    <a href="mailto:info@nsrcogroup.com">info@nsrcogroup.com</a>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon" aria-hidden="true">💬</div>
                  <div className="contact-item-text">
                    <h5>WhatsApp Chat</h5>
                    <a href="https://wa.me/917593899929" target="_blank" rel="noopener noreferrer">Launch immediate message →</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form with Pure-CSS Floating Labels */}
            <div className="contact-form fade-up">
              <form id="contactForm" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      id="fname"
                      placeholder=" "
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="fname">Name</label>
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      id="fphone"
                      placeholder=" "
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <label htmlFor="fphone">Phone</label>
                  </div>
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    id="femail"
                    placeholder=" "
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="femail">Email Address</label>
                </div>
                <div className="form-group">
                  <select
                    id="fsubject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled hidden></option>
                    <option value="Pressure Fryer">Pressure Fryer</option>
                    <option value="Open / Rack Fryer">Open / Rack Fryer</option>
                    <option value="Vacuum Tumbler">Vacuum Tumbler</option>
                    <option value="Full Kitchen Setup">Full Kitchen Setup</option>
                    <option value="Maintenance & Service">Maintenance & Service</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                  <label htmlFor="fsubject">Equipment Focus</label>
                </div>
                <div className="form-group">
                  <textarea
                    id="fmessage"
                    rows={5}
                    placeholder=" "
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <label htmlFor="fmessage">Tell us about your project volume, utility limits, timeline...</label>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', border: 'none', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: '16px' }}
                >
                  Send Inquiry →
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Success Confirmation Modal */}
      <SuccessModal isOpen={isModalOpen} name={submittedName} onClose={handleCloseModal} />
    </main>
  );
};
