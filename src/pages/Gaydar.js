import React, { useState } from 'react';
import './Gaydar.css';
import CameraCapture from '../components/gaydar/CameraCapture';
import ResultsDisplay from '../components/gaydar/ResultsDisplay';
import { callFacePlusPlusAPI, extractFeaturesFromAPIResponse } from '../services/facePlusPlusAPI';
import { predictSexualOrientation, formatPredictionResults } from '../services/mlPredictionService';

function Gaydar() {
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handlePhotoTaken = async (photoFile) => {
    setShowCamera(false);
    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('Photo captured, starting analysis...');
      
      // Step 1: Call Face++ API
      console.log('Calling Face++ API...');
      const apiResponse = await callFacePlusPlusAPI(photoFile);
      
      if (!apiResponse || !apiResponse.faces || apiResponse.faces.length === 0) {
        throw new Error('No face detected in the image');
      }

      // Step 2: Extract features
      console.log('Extracting features...');
      const { features, gender, attributes } = extractFeaturesFromAPIResponse(apiResponse);
      
      if (!features) {
        throw new Error('Failed to extract facial features');
      }

      // Step 3: Make ML prediction
      console.log('Making ML prediction...');
      const predictionResults = await predictSexualOrientation(features, gender);
      
      // Step 4: Format results
      const formattedResults = formatPredictionResults(predictionResults);
      const finalResults = {
        ...formattedResults,
        gender,
        features,
        attributes,
        emotions: attributes.emotion,
        rawApiResponse: apiResponse
      };

      setResults(finalResults);
      setShowResults(true);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewPhoto = () => {
    setResults(null);
    setError(null);
    setShowResults(false);
    setShowCamera(true);
  };

  const handleClose = () => {
    setShowCamera(false);
    setShowResults(false);
    setResults(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="gaydar-app">
      <div className="app-container">
        <header className="app-header">
          <h1>Gaydar</h1>
        </header>

        <main className="app-main">
          {!showCamera && !showResults && !isAnalyzing && (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">📸</div>
                <h2>Are you Gay?</h2>
                <p>Let's find out. take a photo of your face and we'll tell you.</p>
                
                <button 
                  className="start-btn"
                  onClick={() => setShowCamera(true)}
                >
                  Take Photo
                </button>
                
                <div className="app-info">
                  <h3>How it works:</h3>
                  <ul>
                    <li>Take a photo of your face</li>
                    <li>Wait for the analysis</li>
                    <li>Get the results</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="analyzing-screen">
              <div className="analyzing-content">
                <div className="analyzing-icon">🔍</div>
                <h2>Analyzing Photo...</h2>
                <p>Processing facial features and gay tests...</p>
                <div className="loading-spinner"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-screen">
              <div className="error-content">
                <div className="error-icon">⚠️</div>
                <h2>Analysis Failed</h2>
                <p>{error}</p>
                <button 
                  className="retry-btn"
                  onClick={handleNewPhoto}
                >
                  Try Again
                </button>
                <button 
                  className="close-btn"
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {showCamera && (
        <CameraCapture 
          onPhotoTaken={handlePhotoTaken}
          onClose={handleClose}
        />
      )}

      {showResults && results && (
        <ResultsDisplay 
          results={results}
          onNewPhoto={handleNewPhoto}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default Gaydar;
