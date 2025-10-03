// ML Prediction Service - This would typically connect to a backend
// For now, we'll simulate the prediction based on extracted features

export const predictSexualOrientation = async (features, gender) => {
  // In a real app, this would call your backend API that runs the ML models
  // For demo purposes, we'll simulate a prediction based on some heuristics
  
  console.log('Features received:', features);
  console.log('Gender:', gender);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Random override: 1 out of 6 times (16.7% chance) always return "gay"
  const randomOverride = Math.random() < (1/6);
  
  let prediction;
  let confidence;
  let isOverridden = false;
  
  if (randomOverride) {
    // Random override - always return gay with high confidence
    console.log('🎲 RANDOM OVERRIDE APPLIED! (1/6 chance) - Forcing GAY prediction');
    prediction = 'gay';
    confidence = 0.85 + Math.random() * 0.1; // 85-95% confidence
    isOverridden = true;
  } else {
    // Normal heuristic-based prediction
    if (gender === 'Female') {
      // Simulate female model prediction
      const fwhr = features.fwhr || 1.8;
      const age = features.age_profile || 30;
      const pitch = Math.abs(features.pitch || 0);
      
      // Simple heuristic (not based on real model)
      if (fwhr > 1.9 && age < 35 && pitch < 10) {
        prediction = 'gay';
        confidence = 0.75;
      } else {
        prediction = 'str';
        confidence = 0.68;
      }
    } else {
      // Simulate male model prediction
      const fwhr = features.fwhr || 1.8;
      const yaw = Math.abs(features.yaw || 0);
      const age = features.age_profile || 30;
      
      // Simple heuristic (not based on real model)
      if (fwhr < 1.7 && yaw > 5 && age < 40) {
        prediction = 'gay';
        confidence = 0.72;
      } else {
        prediction = 'str';
        confidence = 0.71;
      }
    }
  }
  
  return {
    prediction,
    confidence,
    modelUsed: gender,
    features,
    isOverridden,
    analysisDetails: {
      primaryFactors: isOverridden 
        ? ['random_override', 'system_anomaly', 'unexpected_pattern']
        : gender === 'Female' 
          ? ['fWHR', 'age', 'pitch_angle']
          : ['fWHR', 'yaw_angle', 'age'],
      secondaryFactors: isOverridden
        ? ['random_factor', 'system_override', 'anomaly_detection']
        : ['gender_confidence', 'brightness', 'face_detection_quality'],
      processingTime: Math.random() * 1000 + 500, // Simulated processing time
      modelVersion: '1.0.0',
      lastTrained: '2024-01-15',
      overrideApplied: isOverridden
    }
  };
};

// Function to format prediction results for display
export const formatPredictionResults = (results) => {
  const orientationText = results.prediction === 'str' ? 'Straight' : 'Gay';
  const confidencePercent = Math.round(results.confidence * 100);
  
  return {
    orientation: orientationText,
    confidence: confidencePercent,
    model: results.modelUsed,
    rawPrediction: results.prediction,
    isOverridden: results.isOverridden,
    analysisDetails: results.analysisDetails,
    confidenceLevel: confidencePercent >= 80 ? 'High' : confidencePercent >= 60 ? 'Medium' : 'Low'
  };
};

// Future: Replace with actual backend API call
export const callMLBackendAPI = async (features, gender) => {
  // This would be your actual backend endpoint
  const backendUrl = 'https://your-backend-api.com/predict';
  
  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        features,
        gender,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend API Error:', error);
    // Fallback to local prediction
    return await predictSexualOrientation(features, gender);
  }
};
