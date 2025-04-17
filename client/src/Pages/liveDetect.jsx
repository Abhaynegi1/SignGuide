import React, { useEffect, useRef, useState } from 'react';
import * as tf from "@tensorflow/tfjs";
import * as handpose from '@tensorflow-models/handpose';

export default function SignLanguageTranslator() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState('');
  const [sentence, setSentence] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading TensorFlow...');
  const [lastPredictionTime, setLastPredictionTime] = useState(0);
  
  // Dictionary mapping hand gestures to words
  const gestureToWord = {
    'thumbs_up': 'yes',
    'open_palm': 'hello',
    'closed_fist': 'no',
    'pointing': 'you',
    'victory': 'thank you',
    'pinch': 'small',
    'l_shape': 'want'
  };
  
  // Load the handpose model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setStatusMessage('Loading TensorFlow backend...');
        await tf.ready();
        setStatusMessage('Loading Handpose model...');
        
        // Load the TensorFlow handpose model
        const handposeModel = await handpose.load({
          detectionConfidence: 0.8,
          maxContinuousChecks: 10,
          iouThreshold: 0.3,
          scoreThreshold: 0.75,
        });
        
        setModel(handposeModel);
        setStatusMessage('Models loaded successfully');
        setLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setStatusMessage(`Error: ${error.message}`);
      }
    };
    
    loadModel();
    
    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  // Start webcam
  const startWebcam = async () => {
    try {
      const constraints = {
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
        
        // Start detection when video is ready
        videoRef.current.onloadeddata = () => {
          runHandDetection();
        };
      }
    } catch (error) {
      console.error('Error starting webcam:', error);
      setStatusMessage(`Camera error: ${error.message}`);
    }
  };
  
  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
      setPrediction('');
    }
  };
  
  // Function to recognize hand gestures based on landmarks
  const recognizeGesture = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;
    
    // Get key points for gesture recognition
    const wrist = landmarks[0];
    const thumb_tip = landmarks[4];
    const index_finger_tip = landmarks[8];
    const middle_finger_tip = landmarks[12];
    const ring_finger_tip = landmarks[16];
    const pinky_tip = landmarks[20];
    
    // Get midpoint of palm
    const palmX = (landmarks[0][0] + landmarks[5][0] + landmarks[9][0] + landmarks[13][0] + landmarks[17][0]) / 5;
    const palmY = (landmarks[0][1] + landmarks[5][1] + landmarks[9][1] + landmarks[13][1] + landmarks[17][1]) / 5;
    
    // Calculate finger heights relative to palm
    const thumbHeight = palmY - thumb_tip[1];
    const indexHeight = palmY - index_finger_tip[1];
    const middleHeight = palmY - middle_finger_tip[1];
    const ringHeight = palmY - ring_finger_tip[1];
    const pinkyHeight = palmY - pinky_tip[1];
    
    // Distance between thumb and index finger
    const thumbIndexDistance = Math.sqrt(
      Math.pow(thumb_tip[0] - index_finger_tip[0], 2) + 
      Math.pow(thumb_tip[1] - index_finger_tip[1], 2)
    );
    
    // Detect thumbs up
    if (thumbHeight > 100 && indexHeight < 30 && middleHeight < 30 && ringHeight < 30 && pinkyHeight < 30) {
      return 'thumbs_up';
    }
    
    // Detect open palm
    if (thumbHeight > 30 && indexHeight > 60 && middleHeight > 60 && ringHeight > 60 && pinkyHeight > 30) {
      return 'open_palm';
    }
    
    // Detect closed fist
    if (thumbHeight < 30 && indexHeight < 30 && middleHeight < 30 && ringHeight < 30 && pinkyHeight < 30) {
      return 'closed_fist';
    }
    
    // Detect pointing (index finger up)
    if (indexHeight > 70 && middleHeight < 30 && ringHeight < 30 && pinkyHeight < 30) {
      return 'pointing';
    }
    
    // Detect victory sign
    if (indexHeight > 60 && middleHeight > 60 && ringHeight < 30 && pinkyHeight < 30) {
      return 'victory';
    }
    
    // Detect pinch (thumb and index finger close)
    if (thumbIndexDistance < 30) {
      return 'pinch';
    }
    
    // Detect L shape (thumb and index extended)
    if (thumbHeight > 50 && indexHeight > 50 && middleHeight < 30 && ringHeight < 30 && pinkyHeight < 30) {
      return 'l_shape';
    }
    
    return null;
  };
  
  // Function to draw hand landmarks on canvas
  const drawHandLandmarks = (predictions) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw video frame
    ctx.drawImage(
      videoRef.current, 
      0, 0, 
      videoRef.current.videoWidth, 
      videoRef.current.videoHeight,
      0, 0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    
    // Draw each hand
    predictions.forEach((hand) => {
      const landmarks = hand.landmarks;
      
      // Draw landmarks
      landmarks.forEach((point) => {
        ctx.beginPath();
        ctx.arc(
          point[0] * canvasRef.current.width / videoRef.current.videoWidth, 
          point[1] * canvasRef.current.height / videoRef.current.videoHeight, 
          5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
      
      // Draw skeleton connecting landmarks
      const fingers = [
        [0, 1, 2, 3, 4],            // thumb
        [0, 5, 6, 7, 8],            // index finger
        [0, 9, 10, 11, 12],         // middle finger
        [0, 13, 14, 15, 16],        // ring finger
        [0, 17, 18, 19, 20]         // pinky
      ];
      
      fingers.forEach(finger => {
        for (let i = 1; i < finger.length; i++) {
          ctx.beginPath();
          ctx.moveTo(
            landmarks[finger[i-1]][0] * canvasRef.current.width / videoRef.current.videoWidth,
            landmarks[finger[i-1]][1] * canvasRef.current.height / videoRef.current.videoHeight
          );
          ctx.lineTo(
            landmarks[finger[i]][0] * canvasRef.current.width / videoRef.current.videoWidth,
            landmarks[finger[i]][1] * canvasRef.current.height / videoRef.current.videoHeight
          );
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      
      // Connect finger bases
      ctx.beginPath();
      ctx.moveTo(landmarks[5][0] * canvasRef.current.width / videoRef.current.videoWidth, 
                 landmarks[5][1] * canvasRef.current.height / videoRef.current.videoHeight);
      ctx.lineTo(landmarks[9][0] * canvasRef.current.width / videoRef.current.videoWidth, 
                 landmarks[9][1] * canvasRef.current.height / videoRef.current.videoHeight);
      ctx.lineTo(landmarks[13][0] * canvasRef.current.width / videoRef.current.videoWidth, 
                 landmarks[13][1] * canvasRef.current.height / videoRef.current.videoHeight);
      ctx.lineTo(landmarks[17][0] * canvasRef.current.width / videoRef.current.videoWidth, 
                 landmarks[17][1] * canvasRef.current.height / videoRef.current.videoHeight);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };
  
  // Main hand detection function
  const runHandDetection = async () => {
    if (!isWebcamActive || !model || !videoRef.current || !canvasRef.current) {
      if (isWebcamActive) {
        requestAnimationFrame(runHandDetection);
      }
      return;
    }
    
    try {
      // Set canvas dimensions
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      // Detect hands
      const predictions = await model.estimateHands(videoRef.current);
      
      // Draw landmarks if hands detected
      if (predictions.length > 0) {
        drawHandLandmarks(predictions);
        
        // Recognize gesture
        const gesture = recognizeGesture(predictions[0].landmarks);
        
        if (gesture) {
          // Translate gesture to word
          const word = gestureToWord[gesture] || gesture;
          setPrediction(word);
          
          // Add word to sentence with debouncing
          const now = Date.now();
          if (now - lastPredictionTime > 1500 && word !== prediction) {
            setSentence(prev => prev ? `${prev} ${word}` : word);
            setLastPredictionTime(now);
          }
        }
      } else {
        // No hands detected - just draw the video frame
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          videoRef.current, 
          0, 0, 
          videoRef.current.videoWidth, 
          videoRef.current.videoHeight,
          0, 0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        
        // Clear prediction if no hands detected for a while
        if (Date.now() - lastPredictionTime > 1000) {
          setPrediction('');
        }
      }
    } catch (error) {
      console.error('Error during hand detection:', error);
    }
    
    // Continue detection loop
    if (isWebcamActive) {
      requestAnimationFrame(runHandDetection);
    }
  };
  
  // Clear the current sentence
  const clearSentence = () => {
    setSentence('');
  };
  
  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Sign Language Translator</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center my-8">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">{statusMessage}</p>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-lg mb-6 bg-black">
            <video 
              ref={videoRef}
              className="w-full h-auto invisible"
              autoPlay
              playsInline
              muted
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
          
          <div className="flex gap-4 mb-8">
            {!isWebcamActive ? (
              <button
                onClick={startWebcam}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopWebcam}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Stop Camera
              </button>
            )}
            
            <button
              onClick={clearSentence}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              disabled={!sentence}
            >
              Clear Translation
            </button>
          </div>
          
          <div className="w-full mb-6">
            <h2 className="text-xl font-semibold mb-2">Current Sign:</h2>
            <div className="p-4 bg-blue-100 rounded-lg min-h-16 flex items-center justify-center">
              <p className="text-2xl font-bold">{prediction || 'No sign detected'}</p>
            </div>
          </div>
          
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2">Translated Sentence:</h2>
            <div className="p-4 bg-green-100 rounded-lg min-h-24">
              <p className="text-xl">{sentence || 'Translated text will appear here...'}</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg w-full">
            <h3 className="font-semibold mb-2">Supported Signs:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded">👍 - "yes"</div>
              <div className="p-2 bg-white rounded">✋ - "hello"</div>
              <div className="p-2 bg-white rounded">✊ - "no"</div>
              <div className="p-2 bg-white rounded">👉 - "you"</div>
              <div className="p-2 bg-white rounded">✌️ - "thank you"</div>
              <div className="p-2 bg-white rounded">👌 - "small"</div>
              <div className="p-2 bg-white rounded">🤙 - "want"</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}