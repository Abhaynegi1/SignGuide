// utilities.js - Enhanced helper functions for hand pose visualization and analysis

// Define finger joints for drawing connections
export const fingerJoints = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
  };
  
  // Draw hand landmarks and connections on canvas
  export const drawHand = (predictions, ctx) => {
    if (predictions.length > 0) {
      // Loop through each prediction
      predictions.forEach((prediction) => {
        // Grab landmarks
        const landmarks = prediction.landmarks;
        
        // Loop through fingers
        for (let j = 0; j < landmarks.length; j++) {
          const point = landmarks[j];
          
          // Draw point
          ctx.beginPath();
          ctx.arc(point[0], point[1], 5, 0, 3 * Math.PI);
          
          // Color differently for different parts of the hand
          if (j === 0) {
            // Palm base
            ctx.fillStyle = '#00FF00';
          } else if (j === 4 || j === 8 || j === 12 || j === 16 || j === 20) {
            // Fingertips
            ctx.fillStyle = '#FF0000';
          } else {
            // Other joints
            ctx.fillStyle = '#FFFF00';
          }
          
          ctx.fill();
        }
        
        // Draw skeleton
        const fingers = Object.keys(fingerJoints);
        for (let i = 0; i < fingers.length; i++) {
          const finger = fingers[i];
          const points = fingerJoints[finger].map(idx => landmarks[idx]);
          
          // Draw paths
          ctx.beginPath();
          ctx.moveTo(points[0][0], points[0][1]);
          for (let j = 1; j < points.length; j++) {
            ctx.lineTo(points[j][0], points[j][1]);
          }
          
          // Color differently for different fingers
          const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
          ctx.strokeStyle = colors[i];
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // Add a label for palm base
        const palmBase = landmarks[0];
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Palm", palmBase[0] - 20, palmBase[1] - 10);
      });
    }
  };
  
  // Calculate the angle between three points
  const calculateAngle = (p1, p2, p3) => {
    const getVector = (p1, p2) => {
      return [p2[0] - p1[0], p2[1] - p1[1]];
    };
    
    const dotProduct = (v1, v2) => {
      return v1[0] * v2[0] + v1[1] * v2[1];
    };
    
    const getMagnitude = (v) => {
      return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    };
    
    const v1 = getVector(p2, p1);
    const v2 = getVector(p2, p3);
    
    const dot = dotProduct(v1, v2);
    const mag1 = getMagnitude(v1);
    const mag2 = getMagnitude(v2);
    
    const cosAngle = dot / (mag1 * mag2);
    
    // Clamp cosAngle to avoid domain errors with Math.acos
    const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));
    
    return Math.acos(clampedCosAngle) * (180 / Math.PI);
  };
  
  // Calculate angles for each finger
  export const calculateFingerAngles = (landmarks) => {
    const thumbAngle = calculateAngle(
      landmarks[4], // Thumb tip
      landmarks[2], // Thumb middle
      landmarks[0]  // Palm base
    );
    
    const indexAngle = calculateAngle(
      landmarks[8], // Index tip
      landmarks[6], // Index middle
      landmarks[5]  // Index base
    );
    
    const middleAngle = calculateAngle(
      landmarks[12], // Middle tip
      landmarks[10], // Middle middle
      landmarks[9]   // Middle base
    );
    
    const ringAngle = calculateAngle(
      landmarks[16], // Ring tip
      landmarks[14], // Ring middle
      landmarks[13]  // Ring base
    );
    
    const pinkyAngle = calculateAngle(
      landmarks[20], // Pinky tip
      landmarks[18], // Pinky middle
      landmarks[17]  // Pinky base
    );
    
    return {
      thumb: thumbAngle,
      index: indexAngle,
      middle: middleAngle,
      ring: ringAngle,
      pinky: pinkyAngle
    };
  };
  
  // Calculate distances between landmarks
  export const calculateDistances = (landmarks) => {
    const distances = {};
    
    // Distance between fingertips
    distances.indexToThumb = getDistance(landmarks[8], landmarks[4]);
    distances.middleToThumb = getDistance(landmarks[12], landmarks[4]);
    distances.ringToThumb = getDistance(landmarks[16], landmarks[4]);
    distances.pinkyToThumb = getDistance(landmarks[20], landmarks[4]);
    
    distances.indexToMiddle = getDistance(landmarks[8], landmarks[12]);
    distances.middleToRing = getDistance(landmarks[12], landmarks[16]);
    distances.ringToPinky = getDistance(landmarks[16], landmarks[20]);
    
    // Distance from palm to fingertips
    distances.palmToThumb = getDistance(landmarks[0], landmarks[4]);
    distances.palmToIndex = getDistance(landmarks[0], landmarks[8]);
    distances.palmToMiddle = getDistance(landmarks[0], landmarks[12]);
    distances.palmToRing = getDistance(landmarks[0], landmarks[16]);
    distances.palmToPinky = getDistance(landmarks[0], landmarks[20]);
    
    return distances;
  };
  
  // Helper function to calculate Euclidean distance
  const getDistance = (p1, p2) => {
    return Math.sqrt(
      Math.pow(p2[0] - p1[0], 2) + 
      Math.pow(p2[1] - p1[1], 2)
    );
  };