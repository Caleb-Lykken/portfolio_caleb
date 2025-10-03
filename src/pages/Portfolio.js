import React from 'react';

function Portfolio() {
  const projects = [
    {
      title: "SUB UW - Student Subletting Platform",
      year: "2025",
      description: "Built a React-based subletting application specifically for University of Washington students. Features secure two-factor authentication and real-time database connectivity for seamless user experience.",
      technologies: ["React", "Azure Data Studio", "SQL Server", "Two-Factor Authentication"],
      github: "https://github.com/caleblykken/sub-uw",
      demo: "https://sub-uw.com",
      image: "/images/Caleb.avif"
    },
    {
      title: "Demographic Drug Prediction ML Model",
      year: "2024",
      description: "Developed a machine learning model with 97% accuracy to predict future drug trends based on CDC dataset. Created an interactive dashboard for real-time insights and data-driven public health decision-making.",
      technologies: ["Python", "Machine Learning", "CDC Dataset", "Interactive Dashboard", "Scikit-learn"],
      github: "https://github.com/caleblykken/drug-prediction",
      demo: "https://drug-prediction-dashboard.com",
      image: "/images/Caleb.avif"
    },
    {
      title: "WineAbout - Wine Cellar Management",
      year: "2025",
      description: "Contracted to create MVP for organizational wine cellar application. Prototyped and user-tested using Figma, then developed using Swift UI framework with fully functional SQL Server database integration.",
      technologies: ["Swift UI", "Figma", "SQL Server", "User Testing", "MVP Development"],
      github: "https://github.com/caleblykken/wineabout",
      demo: "https://wineabout.app",
      image: "/images/Caleb.avif"
    },
    {
      title: "Landslide Volume Prediction",
      year: "2023",
      description: "Built a machine learning model to predict landslide volumes in the Pacific Northwest using Python and scikit-learn. Created geographical visualizations with ArcGIS showing predicted landslide volumes for 2024.",
      technologies: ["Python", "Scikit-learn", "Neural Networks", "ArcGIS", "Data Visualization"],
      github: "https://github.com/caleblykken/landslide-prediction",
      demo: "https://landslide-prediction.com",
      image: "/images/Caleb.avif"
    },
    {
      title: "Analog Club UW Website & Gallery",
      year: "2024",
      description: "Created a React-based website hosting a creative digital gallery space for 200+ club members. Connected to fully functional Firebase database with Google Calendar API integration for event management.",
      technologies: ["React", "Firebase", "Google Calendar API", "Digital Gallery", "Event Management"],
      github: "https://github.com/analogclubuw/website",
      demo: "https://analogclubuw.com",
      image: "/images/Caleb.avif"
    },
    {
      title: "Rethink UW - Sustainability Platform",
      year: "2023",
      description: "Designed and developed a website recommending sustainable companies and organizations around Seattle. Built with Java frontend, Python & Node.js backend, and real-time MySQL database with admin portal.",
      technologies: ["Java", "Python", "Node.js", "MySQL", "Sustainability", "Admin Portal"],
      github: "https://github.com/caleblykken/rethink-uw",
      demo: "https://rethink-uw.com",
      image: "/images/Caleb.avif"
    }
  ];

  const skills = [
    { 
      category: "Programming Languages", 
      items: ["Java", "C", "C++", "Python", "JavaScript", "TypeScript", "HTML/CSS", "SQL", "Swift"] 
    },
    { 
      category: "Technologies & Frameworks", 
      items: ["Node.js", "React Native", "Tableau", "Power BI", "Figma", "Azure DevOps", "Swift UI"] 
    },
    { 
      category: "Databases", 
      items: ["SQLite", "MongoDB", "Firebase", "Salesforce", "MySQL", "SQL Server"] 
    },
    { 
      category: "Cloud & Tools", 
      items: ["Azure Data Studio", "Git", "Firebase", "Google Calendar API", "ArcGIS", "Scikit-learn"] 
    },
    { 
      category: "Core Competencies", 
      items: ["Data Wrangling", "Machine Learning", "Data Visualization", "Software Engineering", "Agile Collaboration", "Team Management"] 
    }
  ];

  return (
    <div className="main-content">
      <div className="portfolio-container">
        {/* Header Section with Large Photo */}
        <header className="portfolio-header">
          <h1 className="display-medium" style={{ marginBottom: '2rem' }}>
            Selected Work
          </h1>
          <p className="body-large" style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            A collection of projects showcasing full-stack development, 
            user experience design, and technical problem-solving.
          </p>
          
          {/* Large Hero Image */}
          <div className="portfolio-hero-image">
            <img src="/images/Caleb.avif" alt="Caleb Lykken - Software Developer" />
          </div>
        </header>

        {/* About Section */}
        <section className="about-section">
          <div className="about-label">
            <h2 className="heading-medium">About</h2>
          </div>
          <div className="about-content">
            <p className="body-large">
              I'm Caleb, a Seattle-based data scientist and software engineer graduating from the 
              University of Washington in 2025 with a Bachelor's degree in Information Science and Data Science. 
              I'm passionate about leveraging data analytics, machine learning, and full-stack development 
              to create meaningful solutions.
            </p>
            <p className="body-medium">
              Currently serving as a Data Analyst Intern at Seattle City Light, where I've designed Python 
              data pipelines, created Tableau dashboards, and analyzed data from over 400,000 customers. 
              I also founded and lead Analog Club UW, a 200+ member photography organization, demonstrating 
              my leadership and community-building skills alongside technical expertise.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <a href="mailto:caleb.a.lykken@gmail.com" className="btn-primary" style={{ marginRight: '1rem' }}>
                Get In Touch
              </a>
              <a href="https://linkedin.com/in/caleblykken" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                View LinkedIn
              </a>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="skills-section">
          <h2 className="heading-large" style={{ marginBottom: '1rem' }}>
            Technical Skills
          </h2>
          <p className="body-medium" style={{ marginBottom: '3rem' }}>
            Technologies and tools I work with regularly
          </p>
          <div className="skills-grid">
            {skills.map((skillGroup, index) => (
              <div key={index} className="skill-category">
                <h3 className="heading-medium" style={{ marginBottom: '1rem' }}>
                  {skillGroup.category}
                </h3>
                <ul className="skill-list">
                  {skillGroup.items.map((skill, skillIndex) => (
                    <li key={skillIndex}>{skill}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects-section">
          <h2 className="heading-large" style={{ marginBottom: '1rem' }}>
            Featured Projects
          </h2>
          <p className="body-medium" style={{ marginBottom: '4rem' }}>
            Recent work spanning web applications, APIs, and user interfaces
          </p>
          
          <div className="projects-grid">
            {projects.map((project, index) => (
              <article key={index} className="project-card">
                <div className="project-image">
                  <img src={project.image} alt={project.title} />
                </div>
                <div className="project-info">
                  <div className="project-meta">
                    <h3 className="heading-medium">{project.title}</h3>
                    <span className="caption">{project.year}</span>
                  </div>
                  <p className="body-medium" style={{ marginBottom: '1.5rem' }}>
                    {project.description}
                  </p>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p className="caption" style={{ marginBottom: '0.5rem' }}>
                      Technologies Used
                    </p>
                    <p className="body-medium">
                      {project.technologies.join(', ')}
                    </p>
                  </div>
                  <div className="project-links">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                      View Code
                    </a>
                    <a href={project.demo} target="_blank" rel="noopener noreferrer" className="project-link">
                      Live Demo
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Film strip decoration with GIF integration */}
        <div className="film-strip" style={{ 
          height: '100px', 
          background: 'var(--gray-100)',
          margin: '6rem 0 4rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <img src="/images/deer_licking.gif" alt="Deer" style={{ 
            position: 'absolute', 
            left: '2rem', 
            width: '60px', 
            filter: 'grayscale(100%)',
            opacity: 0.6 
          }} />
          <p className="caption">
            Graduating June 2025 • Seattle, WA • Seeking Full-Time Opportunities
          </p>
          <img src="/images/running_deer.gif" alt="Running deer" style={{ 
            position: 'absolute', 
            right: '2rem', 
            width: '60px', 
            filter: 'grayscale(100%)',
            opacity: 0.6 
          }} />
        </div>
      </div>
    </div>
  );
}

export default Portfolio;