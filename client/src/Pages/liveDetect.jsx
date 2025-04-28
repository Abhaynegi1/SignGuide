import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';

function LiveDetect() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [detectedSign, setDetectedSign] = useState('None');
  const [sentence, setSentence] = useState('');
  const [isRunning, setIsRunning] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const lastSignRef = useRef('None');
  const stableCountRef = useRef(0);
  const signHistoryRef = useRef([]);
  
  // Initialize TensorFlow backend
  useEffect(() => {
    const setupTF = async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('TensorFlow backend ready:', tf.getBackend());
    };
    
    setupTF();
  }, []);
  
  // Load the handpose model when component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await handpose.load({
          maxContinuousChecks: 1,
          detectionConfidence: 0.7,
          maxHands: 1
        });
        setModel(loadedModel);
        console.log('Handpose model loaded');
        
        // Start webcam with lower resolution
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: { ideal: 320 },
              height: { ideal: 240 },
              facingMode: 'user',
              frameRate: { ideal: 20 }
            }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }
      } catch (error) {
        console.error('Error loading model or webcam:', error);
      }
    };
    
    loadModel();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  // Function to add a sign to the sentence
  const addSignToSentence = (sign) => {
    if (!isRecording || sign === 'None' || sign === 'Unknown') return;
    
    // Only add sign if it's stable for a few frames
    if (sign === lastSignRef.current) {
      stableCountRef.current += 1;
      
      // Add sign after it's been stable for 15 frames (about 1 second)
      if (stableCountRef.current === 15) {
        // Check if the last added sign is different
        if (signHistoryRef.current.length === 0 || 
            signHistoryRef.current[signHistoryRef.current.length - 1] !== sign) {
          
          signHistoryRef.current.push(sign);
          setSentence(prev => prev + (prev.length > 0 ? ' ' : '') + sign);
        }
      }
    } else {
      // Reset stable count for new sign
      stableCountRef.current = 0;
      lastSignRef.current = sign;
    }
  };
  
  // Detection loop
  useEffect(() => {
    if (!model || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size once
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    
    let lastDetectionTime = 0;
    const detectionInterval = 50; // ms between detections - more frequent for better responsiveness
    
    const detectFrame = async (timestamp) => {
      if (!previousTimeRef.current) {
        previousTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - previousTimeRef.current;
      previousTimeRef.current = timestamp;
      
      // Always draw video
      if (video.readyState === 4) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Run detection at intervals
      if (timestamp - lastDetectionTime > detectionInterval) {
        lastDetectionTime = timestamp;
        
        try {
          if (video.readyState === 4) {
            const predictions = await model.estimateHands(video);
            
            if (predictions.length > 0) {
              // Draw hand landmarks
              drawHandLandmarks(predictions[0].landmarks, ctx);
              
              // Identify sign with improved algorithm
              const identifiedSign = identifySignLanguage(predictions[0].landmarks);
              setDetectedSign(identifiedSign);
              
              // Add to sentence if recording
              addSignToSentence(identifiedSign);
            } else {
              setDetectedSign('None');
            }
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }
      
      // Continue loop if still running
      if (isRunning) {
        requestRef.current = requestAnimationFrame(detectFrame);
      }
    };
    
    // Start detection loop
    requestRef.current = requestAnimationFrame(detectFrame);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [model, isRunning, isRecording]);
  
  // Draw the hand landmarks
  const drawHandLandmarks = (landmarks, ctx) => {
    // Draw all landmarks for better visualization
    landmarks.forEach((point, index) => {
      const x = point[0];
      const y = point[1];
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = index % 4 === 0 ? 'red' : 'blue';
      ctx.fill();
    });
    
    // Draw connections between landmarks
    const connections = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index finger
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle finger
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring finger
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [0, 17], [17, 18], [18, 19], [19, 20],
      // Palm
      [0, 5], [5, 9], [9, 13], [13, 17]
    ];
    
    ctx.beginPath();
    connections.forEach(([i, j]) => {
      ctx.moveTo(landmarks[i][0], landmarks[i][1]);
      ctx.lineTo(landmarks[j][0], landmarks[j][1]);
    });
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Overlay sign language indicator
    if (detectedSign !== 'None' && detectedSign !== 'Unknown') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText(detectedSign.charAt(0), 10, 30);
    }
  };
  
  // Improved sign identification function
  const identifySignLanguage = (landmarks) => {
    // Normalize landmarks relative to palm base
    const palmBase = landmarks[0];
    const normalizedLandmarks = landmarks.map(point => [
      point[0] - palmBase[0],
      point[1] - palmBase[1],
      point[2] - palmBase[2]
    ]);
    
    // Calculate important features
    const features = calculateHandFeatures(normalizedLandmarks);
    
    // ASL alphabet recognition based on hand features
    return recognizeASLSign(features, normalizedLandmarks);
  };
  
  // Calculate features from hand landmarks
  const calculateHandFeatures = (landmarks) => {
    // Finger tips indices
    const fingertips = [4, 8, 12, 16, 20];
    const knuckles = [2, 5, 9, 13, 17];  // Second knuckle of each finger
    
    // Calculate distances
    const fingertipDistances = fingertips.map(tip => 
      distance(landmarks[tip], landmarks[0])
    );
    
    // Calculate angles
    const fingerAngles = fingertips.map((tip, i) => {
      const knuckle = knuckles[i];
      return calculateAngle(
        landmarks[0],
        landmarks[knuckle],
        landmarks[tip]
      );
    });
    
    // Calculate fingertip to fingertip distances
    const fingertipToFingertipDistances = [];
    for (let i = 0; i < fingertips.length; i++) {
      for (let j = i + 1; j < fingertips.length; j++) {
        fingertipToFingertipDistances.push(
          distance(landmarks[fingertips[i]], landmarks[fingertips[j]])
        );
      }
    }
    
    // Calculate palm orientation
    const palmNormal = calculateNormal(
      landmarks[0],
      landmarks[5],
      landmarks[17]
    );
    
    return {
      fingertipDistances,
      fingerAngles,
      fingertipToFingertipDistances,
      palmNormal
    };
  };
  
  // Recognize ASL signs based on features
  const recognizeASLSign = (features, normalizedLandmarks) => {
    const { fingertipDistances, fingerAngles, fingertipToFingertipDistances } = features;
    
    // Thumb, index, middle, ring, pinky
    const [thumbDist, indexDist, middleDist, ringDist, pinkyDist] = fingertipDistances;
    const [thumbAngle, indexAngle, middleAngle, ringAngle, pinkyAngle] = fingerAngles;
    
    // Helper for checking if fingers are extended
    const isFingerExtended = (distance, threshold = 80) => distance > threshold;
    const areFingersClosed = (distance, threshold = 40) => distance < threshold;
    
    // Check if thumb is across palm
    const thumbAcrossPalm = normalizedLandmarks[4][0] < -20;
    
    // Check if fingertips are close to each other
    const indexToThumbDist = distance(normalizedLandmarks[8], normalizedLandmarks[4]);
    const middleToThumbDist = distance(normalizedLandmarks[12], normalizedLandmarks[4]);
    
    // Basic sign recognition
    
    // A - Fist with thumb to the side
    if (areFingersClosed(indexDist) && areFingersClosed(middleDist) && 
        areFingersClosed(ringDist) && areFingersClosed(pinkyDist) && !thumbAcrossPalm) {
      return "A";
    }
    
    // B - Fingers straight up, thumb across palm
    if (isFingerExtended(indexDist) && isFingerExtended(middleDist) && 
        isFingerExtended(ringDist) && isFingerExtended(pinkyDist) && thumbAcrossPalm) {
      return "B";
    }
    
    // C - Curved hand, thumb and fingers form C shape
    const fingerSpreading = distance(normalizedLandmarks[8], normalizedLandmarks[20]);
    if (fingerSpreading > 50 && fingerSpreading < 120 && 
        !isFingerExtended(indexDist, 100) && !isFingerExtended(middleDist, 100) &&
        indexToThumbDist > 40 && indexToThumbDist < 100) {
      return "C";
    }
    
    // V - Index and middle extended, others closed
    if (isFingerExtended(indexDist) && isFingerExtended(middleDist) && 
        areFingersClosed(ringDist) && areFingersClosed(pinkyDist)) {
      // Check if index and middle are spread apart
      const indexToMiddleDist = distance(normalizedLandmarks[8], normalizedLandmarks[12]);
      if (indexToMiddleDist > 30) {
        return "V";
      }
    }
    
    // W - Index, middle, and ring extended
    if (isFingerExtended(indexDist) && isFingerExtended(middleDist) && 
        isFingerExtended(ringDist) && areFingersClosed(pinkyDist)) {
      return "W";
    }
    
    // O - Fingertips touching thumb in O shape
    if (indexToThumbDist < 30 && middleToThumbDist < 40 && 
        distance(normalizedLandmarks[16], normalizedLandmarks[4]) < 50 &&
        distance(normalizedLandmarks[20], normalizedLandmarks[4]) < 60) {
      return "O";
    }
    
    // I - Pinky extended only
    if (areFingersClosed(indexDist) && areFingersClosed(middleDist) && 
        areFingersClosed(ringDist) && isFingerExtended(pinkyDist)) {
      return "I";
    }
    
    // Y - Thumb and pinky extended only
    if (areFingersClosed(indexDist) && areFingersClosed(middleDist) && 
        areFingersClosed(ringDist) && isFingerExtended(pinkyDist) && 
        isFingerExtended(thumbDist) && !thumbAcrossPalm) {
      return "Y";
    }
    
    // L - Thumb and index extended, L shape
    if (isFingerExtended(indexDist) && areFingersClosed(middleDist) && 
        areFingersClosed(ringDist) && areFingersClosed(pinkyDist) && 
        isFingerExtended(thumbDist) && !thumbAcrossPalm) {
      return "L";
    }
    
    // E - Fingers curled
    if (areFingersClosed(indexDist, 60) && areFingersClosed(middleDist, 60) && 
        areFingersClosed(ringDist, 60) && areFingersClosed(pinkyDist, 60) && 
        thumbAcrossPalm && normalizedLandmarks[8][1] > 0) {
      return "E";
    }
    
    return "Unknown";
  };
  
  // Helper function to calculate distance between points
  const distance = (p1, p2) => {
    return Math.sqrt(
      Math.pow(p1[0] - p2[0], 2) + 
      Math.pow(p1[1] - p2[1], 2) +
      Math.pow(p1[2] - p2[2], 2)
    );
  };
  
  // Helper function to calculate angle between three points
  const calculateAngle = (p1, p2, p3) => {
    const v1 = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2]];
    
    const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const v1mag = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
    const v2mag = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
    
    // Prevent division by zero
    if (v1mag * v2mag === 0) return 0;
    
    const cosine = dot / (v1mag * v2mag);
    return Math.acos(Math.min(Math.max(cosine, -1), 1));
  };
  
  // Calculate normal vector of a plane defined by three points
  const calculateNormal = (p1, p2, p3) => {
    const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    
    return [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]
    ];
  };
  
  // Toggle detection on/off
  const toggleDetection = () => {
    setIsRunning(prev => !prev);
  };
  
  // Toggle recording mode
  const toggleRecording = () => {
    if (!isRecording) {
      // Start new recording
      setSentence('');
      signHistoryRef.current = [];
    }
    setIsRecording(prev => !prev);
  };
  
  // Clear current sentence
  const clearSentence = () => {
    setSentence('');
    signHistoryRef.current = [];
  };
  
  return (
    <div className="live-detect" style={{ 
      maxWidth: "600px", 
      margin: "0 auto", 
      padding: "20px",
      textAlign: "center"
    }}>
      <h2 style={{ marginBottom: "20px" }}>Sign Language Detector</h2>
      
      <div className="video-container" style={{ 
        display: "flex", 
        justifyContent: "center", 
        marginBottom: "20px" 
      }}>
        <video 
          ref={videoRef}
          style={{ display: 'none' }}
          width="320"
          height="240"
          playsInline
        />
        <canvas 
          ref={canvasRef}
          style={{ 
            border: isRecording ? '3px solid #ff4d4d' : '1px solid #ccc',
            borderRadius: '8px',
            maxWidth: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>
      
      <div className="detection-info" style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "10px", 
        borderRadius: "8px",
        marginBottom: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          padding: "6px 12px",
          borderRadius: "20px",
          backgroundColor: detectedSign === "Unknown" ? "#ffc107" : 
                          detectedSign === "None" ? "#6c757d" : "#28a745",
          color: "white",
          fontWeight: "bold",
          minWidth: "120px"
        }}>
          {detectedSign === "None" ? "No Sign" : detectedSign}
        </div>
      </div>
      
      <div className="detection-controls" style={{ 
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px"
      }}>
        <button 
          onClick={toggleDetection}
          style={{ 
            padding: "8px 16px",
            backgroundColor: isRunning ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button 
          onClick={toggleRecording}
          style={{ 
            padding: "8px 16px",
            backgroundColor: isRecording ? "#ff4d4d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button 
          onClick={clearSentence}
          style={{ 
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Clear
        </button>
      </div>
      
      <div className="sentence-display" style={{ 
        border: '1px solid #dee2e6', 
        borderRadius: '8px',
        padding: '15px', 
        backgroundColor: '#f8f9fa',
        minHeight: '80px',
        textAlign: 'left',
        marginBottom: '15px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px', color: '#495057' }}>
          Translated Sentence:
        </h3>
        <p style={{ 
          fontSize: '18px',
          margin: 0,
          color: sentence ? '#212529' : '#6c757d',
          fontWeight: sentence ? 'normal' : 'light'
        }}>
          {sentence || 'No signs detected yet'}
        </p>
      </div>
      
      <div style={{ 
        fontSize: '14px', 
        color: '#6c757d',
        padding: '10px',
        borderRadius: '4px',
        backgroundColor: '#e9ecef' 
      }}>
        Hold each sign steady for about 1 second to add it to the sentence.
        <br />
      </div>
    </div>
  );
}

export default LiveDetect;