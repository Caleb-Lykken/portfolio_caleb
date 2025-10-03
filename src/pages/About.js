import React from 'react';

function About() {
  return (
    <div className="main-content">
      <div className="portfolio-container">
        {/* Header */}
        <header className="portfolio-header">
          <h1 className="display-medium" style={{ marginBottom: '2rem' }}>
            About Me
          </h1>
          <p className="body-large" style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            Software developer, problem solver, and lifelong learner based in Seattle.
          </p>
          
          {/* Large Photo */}
          <div className="portfolio-hero-image">
            <img src="/images/Caleb.avif" alt="Caleb Lykken" />
          </div>
        </header>

        {/* About Content */}
        <section className="about-section">
          <div className="about-label">
            <h2 className="heading-medium">Background</h2>
          </div>
          <div className="about-content">
            <p className="body-large">
              I'm a passionate data scientist and software engineer pursuing a Bachelor's degree 
              in Information Science and Data Science at the University of Washington (graduating June 2025). 
              My journey combines analytical thinking with creative problem-solving to build 
              data-driven solutions that make a real impact.
            </p>
            <p className="body-medium">
              At UW, I've developed expertise in data structures and algorithms, machine learning, 
              client-side web development, and database modeling. My coursework spans from advanced 
              data science methods to cooperative software engineering, giving me a comprehensive 
              foundation in both technical skills and collaborative development practices.
            </p>
            <p className="body-medium">
              Beyond academics, I founded and lead Analog Club UW, growing it to over 200 members 
              and managing diverse teams of 54 people. When I'm not analyzing data or building 
              applications, you'll find me exploring film photography, which has taught me patience, 
              attention to detail, and the art of capturing meaningful moments.
            </p>
          </div>
        </section>

        {/* Experience Section */}
        <section className="about-section">
          <div className="about-label">
            <h2 className="heading-medium">Experience</h2>
          </div>
          <div className="about-content">
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <h3 className="heading-medium">Data Analyst Intern</h3>
                <span className="caption">Aug 2024 - Aug 2025</span>
              </div>
              <p className="body-medium" style={{ marginBottom: '1rem' }}>
                Seattle City Light - Strategy Team
              </p>
              <p className="body-medium">
                Designed Python data pipelines with sentiment detection, boosting customer survey engagement from 20% to 40%. 
                Created Tableau dashboards tracking energy efficiency rebates and analyzed data from 400,000+ customers, 
                increasing rebate participation by 30% and decreasing response times by 200%.
              </p>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <h3 className="heading-medium">Software Engineer (Contract)</h3>
                <span className="caption">May 2025 - Aug 2025</span>
              </div>
              <p className="body-medium" style={{ marginBottom: '1rem' }}>
                WineAbout - Redmond, WA
              </p>
              <p className="body-medium">
                Contracted to create MVP for organizational wine cellar application. Prototyped and user-tested 
                using Figma, then developed using Swift UI framework with fully functional SQL Server database integration.
              </p>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <h3 className="heading-medium">Founder/President</h3>
                <span className="caption">Jan 2024 - Jun 2025</span>
              </div>
              <p className="body-medium" style={{ marginBottom: '1rem' }}>
                Analog Club UW (Non-profit)
              </p>
              <p className="body-medium">
                Founded and grew analog photography club to 200+ members. Created and managed 4 staff teams 
                with 54 diverse members, raised over $2,000, and produced a 100-page magazine. Built React-based 
                website with Firebase database and Google Calendar API integration.
              </p>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <h3 className="heading-medium">Software Engineering Intern</h3>
                <span className="caption">Jun 2023 - Sep 2024</span>
              </div>
              <p className="body-medium" style={{ marginBottom: '1rem' }}>
                BraveSoft Inc - Ann Arbor, MI
              </p>
              <p className="body-medium">
                Built interactive business dashboards using Power BI and Python. Managed data inventory through 
                SQL and Excel, and developed compensation analysis using MySQL queries and Pandas, improving 
                visibility of pay inequality at client companies.
              </p>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <h3 className="heading-medium">University of Washington</h3>
                <span className="caption">2021 - 2025</span>
              </div>
              <p className="body-medium" style={{ marginBottom: '1rem' }}>
                Bachelor of Science in Information Science and Data Science | GPA: 3.6/4.0
              </p>
              <p className="body-medium">
                Relevant coursework: Data Structures and Algorithms, Client-Side Web Development, Machine Learning, 
                Databases and Data Modeling, Cooperative Software Engineering, Advanced Methods in Data Science.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-section">
          <div className="about-label">
            <h2 className="heading-medium">Values</h2>
          </div>
          <div className="about-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 className="heading-medium" style={{ marginBottom: '1rem' }}>
                  User-Centered Design
                </h3>
                <p className="body-medium">
                  Every line of code should serve a purpose in creating better experiences for users.
                </p>
              </div>
              <div>
                <h3 className="heading-medium" style={{ marginBottom: '1rem' }}>
                  Continuous Learning
                </h3>
                <p className="body-medium">
                  Technology evolves rapidly, and I'm committed to growing with it through constant learning.
                </p>
              </div>
              <div>
                <h3 className="heading-medium" style={{ marginBottom: '1rem' }}>
                  Clean Code
                </h3>
                <p className="body-medium">
                  Writing maintainable, readable code that future developers (including myself) will thank me for.
                </p>
              </div>
              <div>
                <h3 className="heading-medium" style={{ marginBottom: '1rem' }}>
                  Collaboration
                </h3>
                <p className="body-medium">
                  The best solutions come from diverse perspectives and open communication.
                </p>
              </div>
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
          justifyContent: 'center'
        }}>
          <p className="caption">
            Let's build something great together
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
