import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import './CameraCapture.css';

const CameraCapture = ({ onPhotoTaken, onClose }) => {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back

  const capture = useCallback(() => {
    setIsCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    // Convert to blob for API call
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        onPhotoTaken(file);
        setIsCapturing(false);
      })
      .catch(err => {
        console.error('Error capturing photo:', err);
        setIsCapturing(false);
      });
  }, [onPhotoTaken]);

  const switchCamera = () => {
    setFacingMode(prevMode => 
      prevMode === 'user' ? 'environment' : 'user'
    );
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  };

  return (
    <div className="camera-overlay">
      <div className="camera-container">
        <div className="camera-header">
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
          <h3>Take Photo</h3>
          <button className="switch-btn" onClick={switchCamera}>
            🔄
          </button>
        </div>
        
        <div className="camera-view">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="webcam"
          />
        </div>
        
        <div className="camera-controls">
          <button 
            className={`capture-btn ${isCapturing ? 'capturing' : ''}`}
            onClick={capture}
            disabled={isCapturing}
          >
            {isCapturing ? '📸' : '📷'}
          </button>
        </div>
        
        <div className="camera-instructions">
          <p>Position your face in the center and tap the camera button</p>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
