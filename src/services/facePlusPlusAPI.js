// Face++ API service for facial analysis
const API_CONFIG = {
  url: 'https://api-us.faceplusplus.com/facepp/v3/detect',
  key: "A32WC2-m4G_jxBJNNBmWV00OlNNs5iN6",
  secret: "tZOv8mEcEpM-OQzsg7tCJg6crIX1XsD6",
  return_attributes: 'gender,age,smiling,emotion,headpose',
  return_landmark: '2'
};

export const callFacePlusPlusAPI = async (imageFile) => {
  const formData = new FormData();
  formData.append('api_key', API_CONFIG.key);
  formData.append('api_secret', API_CONFIG.secret);
  formData.append('return_attributes', API_CONFIG.return_attributes);
  formData.append('return_landmark', API_CONFIG.return_landmark);
  formData.append('image_file', imageFile);

  try {
    const response = await fetch(API_CONFIG.url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Face++ API Error:', error);
    throw error;
  }
};

export const extractFeaturesFromAPIResponse = (apiResponse) => {
  if (!apiResponse || !apiResponse.faces || apiResponse.faces.length === 0) {
    return null;
  }

  const face = apiResponse.faces[0]; // Use first face detected
  const attributes = face.attributes || {};
  const landmark = face.landmark || {};

  // Extract basic attributes
  const gender = attributes.gender?.value || 'Unknown';
  const age = attributes.age?.value || 30;

  // Extract head pose
  const headpose = attributes.headpose || {};
  const pitch = headpose.pitch_angle || 0;
  const yaw = headpose.yaw_angle || 0;

  // Calculate fWHR (Facial Width-to-Height Ratio)
  const leftCheekX = landmark.contour_left9?.x;
  const rightCheekX = landmark.contour_right9?.x;
  const chinY = landmark.contour_chin?.y;
  const browY = landmark.left_eyebrow_right_corner?.y;

  let fwhr = 1.8; // Default value
  if (leftCheekX && rightCheekX && chinY && browY) {
    const faceWidth = Math.abs(rightCheekX - leftCheekX);
    const faceHeight = Math.abs(chinY - browY);
    fwhr = faceHeight !== 0 ? Number((faceWidth / faceHeight).toFixed(3)) : 1.8;
  }

  // Create feature dictionary compatible with ML models
  const features = {
    di: 100, // Default value - would need additional calculation
    pitch: pitch,
    yaw: yaw,
    age_profile: age,
    age_vgg: age, // Using same age value
    n_img: 1, // Single image
    gender_vgg: gender === 'Female' ? 10.0 : -10.0, // Gender confidence
    fwhr: fwhr,
    brightness: 100.0 // Default value
  };

  return { features, gender, attributes, landmark };
};
