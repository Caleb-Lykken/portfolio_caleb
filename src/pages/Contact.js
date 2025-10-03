import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      label: "Email",
      value: "caleb.a.lykken@gmail.com",
      link: "mailto:caleb.a.lykken@gmail.com",
      description: "Best for project inquiries and collaboration"
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/caleblykken",
      link: "https://linkedin.com/in/caleblykken",
      description: "Professional networking and career opportunities"
    },
    {
      label: "Phone",
      value: "(425) 362-8873",
      link: "tel:+14253628873",
      description: "Available for interviews and urgent matters"
    },
    {
      label: "Location",
      value: "Seattle, WA",
      link: null,
      description: "Available for local and remote opportunities"
    }
  ];

  return (
    <div className="main-content">
      <div className="portfolio-container">
        {/* Header */}
        <header className="portfolio-header">
          <h1 className="display-medium" style={{ marginBottom: '2rem' }}>
            Get In Touch
          </h1>
          <p className="body-large" style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            I'm always interested in new opportunities, collaborations, and conversations 
            about technology and design.
          </p>
        </header>

        {/* Contact Section */}
        <section className="contact-section">
          {/* Contact Form */}
          <div>
            <h2 className="heading-large" style={{ marginBottom: '2rem' }}>
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label className="caption" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--black)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid var(--gray-300)',
                      background: 'var(--white)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--black)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                  />
                </div>
                <div>
                  <label className="caption" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--black)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid var(--gray-300)',
                      background: 'var(--white)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--black)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                  />
                </div>
              </div>
              
              <div>
                <label className="caption" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--black)' }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid var(--gray-300)',
                    background: 'var(--white)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--black)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                />
              </div>

              <div>
                <label className="caption" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--black)' }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid var(--gray-300)',
                    background: 'var(--white)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1rem',
                    resize: 'vertical',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--black)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="contact-info">
            <h2 className="heading-large" style={{ marginBottom: '2rem' }}>
              Other Ways to Connect
            </h2>
            {contactMethods.map((method, index) => (
              <div key={index} className="contact-method">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="caption">{method.label}</span>
                </div>
                {method.link ? (
                  <a href={method.link} target="_blank" rel="noopener noreferrer">
                    {method.value}
                  </a>
                ) : (
                  <span className="body-medium" style={{ fontWeight: '500' }}>
                    {method.value}
                  </span>
                )}
                <p className="body-medium" style={{ color: 'var(--gray-600)' }}>
                  {method.description}
                </p>
              </div>
            ))}

            {/* Availability Status */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              border: '2px solid var(--gray-200)',
              background: 'var(--gray-100)'
            }}>
              <h3 className="heading-medium" style={{ marginBottom: '1rem' }}>
                Current Status
              </h3>
              <p className="body-medium">
                <strong>Graduating June 2025 - Seeking Full-Time Opportunities</strong>
                <br />
                I'm actively seeking full-time positions in data science, software engineering, 
                and related fields starting Summer 2025. Also available for interesting freelance 
                projects and internships. Response time is typically within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Film strip decoration */}
        <div className="film-strip" style={{ 
          height: '100px', 
          background: 'var(--gray-100)',
          margin: '6rem 0 4rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <img src="/images/firebthr.gif" alt="Fire breathing" style={{ 
            position: 'absolute', 
            left: '2rem', 
            width: '60px', 
            filter: 'grayscale(100%)',
            opacity: 0.6 
          }} />
          <p className="caption">
            Looking forward to hearing from you
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
