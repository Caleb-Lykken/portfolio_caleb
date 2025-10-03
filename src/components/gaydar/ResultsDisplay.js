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
              <div className="confidence-label">Confidence Level</div>
              <div 
                className="confidence-bar"
                style={{ backgroundColor: getConfidenceColor(results.confidence) }}
              >
                {results.confidence}% ({results.confidenceLevel || 'Medium'})
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
              <span className="detail-value">{results.attributes?.smiling?.value || 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Head Pose Pitch:</span>
              <span className="detail-value">{results.attributes?.headpose?.pitch_angle?.toFixed(2) || 'N/A'}°</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Head Pose Yaw:</span>
              <span className="detail-value">{results.attributes?.headpose?.yaw_angle?.toFixed(2) || 'N/A'}°</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Head Pose Roll:</span>
              <span className="detail-value">{results.attributes?.headpose?.roll_angle?.toFixed(2) || 'N/A'}°</span>
            </div>
          </div>

          <div className="features-section">
            <h3>Facial Features Analysis</h3>
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
              <div className="feature-item">
                <span className="feature-label">Gender VGG</span>
                <span className="feature-value">{results.features?.gender_vgg || 'N/A'}</span>
              </div>
              <div className="feature-item">
                <span className="feature-label">Brightness</span>
                <span className="feature-value">{results.features?.brightness || 'N/A'}</span>
              </div>
              <div className="feature-item">
                <span className="feature-label">DI</span>
                <span className="feature-value">{results.features?.di || 'N/A'}</span>
              </div>
              <div className="feature-item">
                <span className="feature-label">Images</span>
                <span className="feature-value">{results.features?.n_img || 'N/A'}</span>
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

          {results.analysisDetails && (
            <div className="analysis-section">
              <h3>ML Analysis Details</h3>
              <div className="analysis-content">
                <div className="analysis-item">
                  <span className="analysis-label">Confidence Level:</span>
                  <span className="analysis-value">{results.confidenceLevel || 'N/A'}</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Primary Factors:</span>
                  <span className="analysis-value">{results.analysisDetails.primaryFactors?.join(', ') || 'N/A'}</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Secondary Factors:</span>
                  <span className="analysis-value">{results.analysisDetails.secondaryFactors?.join(', ') || 'N/A'}</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Model Version:</span>
                  <span className="analysis-value">{results.analysisDetails.modelVersion || 'N/A'}</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Last Trained:</span>
                  <span className="analysis-value">{results.analysisDetails.lastTrained || 'N/A'}</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Processing Time:</span>
                  <span className="analysis-value">{results.analysisDetails.processingTime?.toFixed(0) || 'N/A'}ms</span>
                </div>
              </div>
            </div>
          )}

          <div className="debug-section">
            <h3>Technical Details</h3>
            <div className="debug-content">
              <div className="debug-item">
                <span className="debug-label">Raw Prediction:</span>
                <span className="debug-value">{results.rawPrediction || 'N/A'}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Model Used:</span>
                <span className="debug-value">{results.model || 'N/A'}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Analysis Timestamp:</span>
                <span className="debug-value">{new Date().toLocaleString()}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Face Detection:</span>
                <span className="debug-value">{results.rawApiResponse?.faces?.length > 0 ? `${results.rawApiResponse.faces.length} face(s) detected` : 'No faces detected'}</span>
              </div>
            </div>
          </div>
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
