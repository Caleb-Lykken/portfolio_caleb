import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="main-content">
      {/* Floating GIFs */}
      <div className="floating-gif gif1">
        <img src="/images/firebthr.gif" alt="Fire breathing" />
      </div>
      <div className="floating-gif gif2">
        <img src="/images/running_deer.gif" alt="Running deer" />
      </div>

      <div className="home-container">
        <section className="hero-section">
          <h1 className="display-large hero-title">
            CALEB LYKKEN
          </h1>
          <p className="body-large hero-subtitle">
            Data Scientist & Software Engineer graduating from UW in 2025. 
            Specializing in data analytics, machine learning, and full-stack development. 
            Based in Seattle, creating data-driven solutions and impactful digital experiences.
          </p>
          <div className="hero-actions">
            <Link to="/portfolio" className="btn-primary">
              View My Work
            </Link>
            <a href="mailto:caleb.a.lykken@gmail.com" className="btn-secondary">
              Get In Touch
            </a>
          </div>
        </section>

        {/* Film strip decoration */}
        <div className="film-strip" style={{ 
          height: '200px', 
          background: 'var(--gray-100)',
          margin: '4rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p className="caption" style={{ color: 'var(--gray-400)' }}>
            Graduating June 2025 • Seeking Full-Time Opportunities
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
  