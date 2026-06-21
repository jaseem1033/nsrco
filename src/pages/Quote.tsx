import React, { useState } from 'react';
import { SuccessModal } from '../components/SuccessModal';

export const Quote: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Map element ids (fname, flastname, femail, fphone, fsubject, fmessage) to state keys
    const stateKeyMap: Record<string, string> = {
      fname: 'firstName',
      flastname: 'lastName',
      femail: 'email',
      fphone: 'phone',
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
    const fullName = `${formData.firstName} ${formData.lastName}`;
    setSubmittedName(fullName);
    setIsModalOpen(true);

    const bodyText = `Name: ${fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nProject Type: ${formData.subject}\n\nProject Details:\n${formData.message}`;
    const mailtoLink = `mailto:info@nsrcogroup.com?subject=Quote: ${encodeURIComponent(formData.subject || 'Quote Request')}&body=${encodeURIComponent(bodyText)}`;

    setTimeout(() => {
      window.location.href = mailtoLink;
    }, 2000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
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
            <span></span> Pricing & Layouts
          </div>
          <h1 className="banner-title fade-up">REQUEST A QUOTE</h1>
          <p className="banner-subtitle fade-up">Tell us about your project scale and we'll engineer a tailored layout</p>
        </div>
      </section>

      {/* Estimate request form */}
      <section className="section" style={{ background: 'var(--bg2)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 fade-up">
              <div className="contact-form" style={{ background: 'var(--bg3)', margin: '0 auto', maxWidth: '800px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '2rem', letterSpacing: '0.05em', color: 'var(--text)' }}>
                  PROJECT ESTIMATE DETAILS
                </h3>
                
                <form id="quoteForm" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        id="fname"
                        placeholder=" "
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="fname">First Name</label>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        id="flastname"
                        placeholder=" "
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="flastname">Last Name</label>
                    </div>
                  </div>
                  
                  <div className="form-row">
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
                      <input
                        type="tel"
                        id="fphone"
                        placeholder=" "
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      <label htmlFor="fphone">Phone Number</label>
                    </div>
                  </div>

                  <div className="form-group">
                    <select
                      id="fsubject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled hidden></option>
                      <option value="Restaurant Kitchen">Restaurant Kitchen Setup</option>
                      <option value="Hotel Kitchen">Hotel Kitchen Setup</option>
                      <option value="Catering Facility">Catering Facility Layout</option>
                      <option value="Equipment Only">Equipment Hardware Only</option>
                      <option value="Other">Other Project</option>
                    </select>
                    <label htmlFor="fsubject">Project Type</label>
                  </div>

                  <div className="form-group">
                    <textarea
                      id="fmessage"
                      rows={6}
                      placeholder=" "
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                    <label htmlFor="fmessage">Tell us more about your kitchen dimension constraints, timeline, volume outputs...</label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', textAlign: 'center', border: 'none', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: '16px' }}
                  >
                    Submit Request →
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Success Confirmation Modal */}
      <SuccessModal isOpen={isModalOpen} name={submittedName} onClose={handleCloseModal} />
    </main>
  );
};
