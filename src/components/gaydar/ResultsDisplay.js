import React from 'react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results, onNewPhoto, onClose }) => {
  if (!results) return null;

  const getOrientationColor = (orientation) => {
    return orientation === 'Straight' ? '#4CAF50' : '#FF9800';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="results-overlay">
      <div className="results-container">
        <div className="results-header">
          <h2>Analysis Results</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="results-content">
          <div className="main-result">
            <div className="orientation-display">
              <span 
                className="orientation-badge"
                style={{ backgroundColor: getOrientationColor(results.orientation) }}
              >
                {results.orientation}
              </span>
            </div>
            
            <div className="confidence-display">
              <div className="confidence-label">Confidence</div>
              <div 
                className="confidence-bar"
                style={{ backgroundColor: getConfidenceColor(results.confidence) }}
              >
                {results.confidence}%
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Analysis Details</h3>
            
            <div className="detail-row">
              <span className="detail-label">Gender Detected:</span>
              <span className="detail-value">{results.gender}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Model Used:</span>
              <span className="detail-value">{results.model} Model</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{results.attributes?.age?.value || 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Smile Intensity:</span>
              <span className="detail-value">{results.attributes?.smile?.value || 'N/A'}</span>
            </div>
          </div>

          <div className="features-section">
            <h3>Facial Features</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-label">fWHR</span>
                <span className="feature-value">{results.features?.fwhr?.toFixed(3) || 'N/A'}</span>
              </div>
              <div className="feature-item">
                <span className="feature-label">Pitch</span>
                <span className="feature-value">{results.features?.pitch?.toFixed(2) || 'N/A'}°</span>
              </div>
              <div className="feature-item">
                <span className="feature-label">Yaw</span>
                <span className="feature-value">{results.features?.yaw?.toFixed(2) || 'N/A'}°</span>
              </div>
              <div className="feature-item">
                <span className="feature-label">Age Profile</span>
                <span className="feature-value">{results.features?.age_profile || 'N/A'}</span>
              </div>
            </div>
          </div>

          {results.emotions && (
            <div className="emotions-section">
              <h3>Emotions Detected</h3>
              <div className="emotions-grid">
                {Object.entries(results.emotions).map(([emotion, confidence]) => (
                  <div key={emotion} className="emotion-item">
                    <span className="emotion-label">{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
                    <span className="emotion-confidence">{confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="results-actions">
          <button className="action-btn secondary" onClick={onClose}>
            Close
          </button>
          <button className="action-btn primary" onClick={onNewPhoto}>
            Take Another Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
